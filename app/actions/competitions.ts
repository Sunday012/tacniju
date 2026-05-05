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
  const registrationPoints = parseInt(formData.get("registrationPoints") as string || "0");

  if (!name) {
    return { error: "Competition name is required." };
  }

  const { error } = await supabase
    .from("competitions")
    .insert([{ name, description, registration_points: registrationPoints }]);

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
        reservation_number,
        points
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

  // 1. Get competition points requirement
  const { data: competition, error: compError } = await supabase
    .from("competitions")
    .select("registration_points")
    .eq("id", competitionId)
    .single();

  if (compError || !competition) {
    return { error: "Competition not found." };
  }

  // 2. Find profile by reservation number
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, points")
    .eq("reservation_number", reservationNumber)
    .limit(1);

  if (profileError || !profiles || profiles.length === 0) {
    return { error: "Profile not found with that reservation number." };
  }

  const profile = profiles[0];
  const cost = competition.registration_points || 0;

  // 3. Check points
  if (profile.points < cost) {
    return { error: `Insufficient points. Member has ${profile.points} but needs ${cost}.` };
  }

  // 4. Use a transaction-like approach (Supabase RPC would be better, but we can do it sequentially)
  // Deduct points
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ points: profile.points - cost })
    .eq("id", profile.id);

  if (updateError) {
    return { error: "Failed to deduct points." };
  }

  // 5. Insert into competition_entries
  const { error: insertError } = await supabase
    .from("competition_entries")
    .insert([{ competition_id: competitionId, profile_id: profile.id }]);

  if (insertError) {
    // Refund points if insert fails
    await supabase
      .from("profiles")
      .update({ points: profile.points })
      .eq("id", profile.id);

    if (insertError.code === "23505") { // Unique violation
      return { error: "This person is already entered into this competition." };
    }
    console.error("Error entering competition:", insertError);
    return { error: insertError.message };
  }

  revalidatePath(`/admin/competitions/${competitionId}`);
  return { success: true };
}

export async function generateTeams(competitionId: string, teamCount: number) {
  const supabase = await createClient();
  
  // 1. Get all entries
  const { data: entries, error: entriesError } = await supabase
    .from("competition_entries")
    .select("profile_id")
    .eq("competition_id", competitionId);

  if (entriesError || !entries || entries.length === 0) {
    return { error: "No entries found for this competition." };
  }

  // 2. Shuffle entries
  const shuffled = [...entries].sort(() => Math.random() - 0.5);

  // 3. Create teams
  const teams = [];
  for (let i = 0; i < teamCount; i++) {
    const { data: team, error: teamError } = await supabase
      .from("competition_teams")
      .insert([{ competition_id: competitionId, team_name: `Team ${i + 1}` }])
      .select()
      .single();

    if (teamError) return { error: "Failed to create teams." };
    teams.push(team);
  }

  // 4. Distribute members
  const teamMembers = shuffled.map((entry, index) => ({
    team_id: teams[index % teamCount].id,
    profile_id: entry.profile_id
  }));

  const { error: memberError } = await supabase
    .from("competition_team_members")
    .insert(teamMembers);

  if (memberError) return { error: "Failed to assign team members." };

  revalidatePath(`/admin/competitions/${competitionId}`);
  return { success: true };
}

export async function getCompetitionTeams(competitionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("competition_teams")
    .select(`
      id,
      team_name,
      members:competition_team_members(
        id,
        profile:profiles(full_name, reservation_number)
      )
    `)
    .eq("competition_id", competitionId);

  if (error) return { error: error.message };
  return { teams: data };
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

export async function deleteCompetition(competitionId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("competitions")
    .delete()
    .eq("id", competitionId);

  if (error) {
    console.error("Error deleting competition:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/competitions");
  return { success: true };
}

