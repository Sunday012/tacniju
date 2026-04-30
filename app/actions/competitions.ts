"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

export async function getCompetitions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("competitions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching competitions:", error);
    return { error: error.message };
  }

  return { competitions: data };
}

export async function createCompetition(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) {
    return { error: "Competition name is required." };
  }

  const { error } = await supabase
    .from("competitions")
    .insert([{ name, description }]);

  if (error) {
    console.error("Error creating competition:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/competitions");
  return { success: true };
}

export async function getCompetitionEntries(competitionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("competition_entries")
    .select(`
      id,
      entered_at,
      profile:profiles!profile_id(
        id,
        full_name,
        reservation_number
      )
    `)
    .eq("competition_id", competitionId)
    .order("entered_at", { ascending: false });

  if (error) {
    console.error("Error fetching entries:", error);
    return { error: error.message };
  }

  return { entries: data };
}

export async function enterCompetition(formData: FormData) {
  const supabase = await createClient();
  const reservationNumber = formData.get("reservationNumber") as string;
  const competitionId = formData.get("competitionId") as string;

  if (!reservationNumber || !competitionId) {
    return { error: "Missing reservation number or competition ID." };
  }

  // 1. Find profile by reservation number
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("reservation_number", reservationNumber)
    .limit(1);

  if (profileError || !profiles || profiles.length === 0) {
    return { error: "Profile not found with that reservation number." };
  }

  const profileId = profiles[0].id;

  // 2. Insert into competition_entries
  const { error: insertError } = await supabase
    .from("competition_entries")
    .insert([{ competition_id: competitionId, profile_id: profileId }]);

  if (insertError) {
    if (insertError.code === "23505") { // Unique violation
      return { error: "This person is already entered into this competition." };
    }
    console.error("Error entering competition:", insertError);
    return { error: insertError.message };
  }

  revalidatePath(`/admin/competitions/${competitionId}`);
  return { success: true };
}

export async function removeCompetitionEntry(entryId: string, competitionId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("competition_entries")
    .delete()
    .eq("id", entryId);

  if (error) {
    console.error("Error deleting entry:", error);
    return { error: error.message };
  }

  revalidatePath(`/admin/competitions/${competitionId}`);
  return { success: true };
}
