"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "You must be signed in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, error: profile?.is_admin ? null : "Admins only." };
}

function revalidateDiary() {
  revalidatePath("/admin/diary");
  revalidatePath("/admin/diary/locations");
  revalidatePath("/dashboard/diary");
}

export async function createDiaryLocation(name: string) {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };
  const cleanName = name.trim();
  if (!cleanName) return { error: "District name is required." };

  const { error: insertError } = await supabase
    .from("diary_locations")
    .insert({ name: cleanName });
  if (insertError) return { error: insertError.message };

  revalidateDiary();
  return { success: true };
}

export async function createDiaryAssembly(locationId: string, name: string) {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };
  const cleanName = name.trim();
  if (!locationId) return { error: "Select a district." };
  if (!cleanName) return { error: "Assembly name is required." };

  const { error: insertError } = await supabase
    .from("diary_assemblies")
    .insert({ location_id: locationId, name: cleanName });
  if (insertError) return { error: insertError.message };

  revalidateDiary();
  return { success: true };
}

export async function deleteDiaryLocation(id: string) {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };
  const { error: deleteError } = await supabase.from("diary_locations").delete().eq("id", id);
  if (deleteError) return { error: deleteError.message };
  revalidateDiary();
  return { success: true };
}

export async function deleteDiaryAssembly(id: string) {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };
  const { error: deleteError } = await supabase.from("diary_assemblies").delete().eq("id", id);
  if (deleteError) return { error: deleteError.message };
  revalidateDiary();
  return { success: true };
}
