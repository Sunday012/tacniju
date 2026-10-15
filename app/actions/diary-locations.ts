"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/server";
import { getAdminOfficeAccess } from "@/lib/access";

async function requireLocationManager() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "You must be signed in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_admin, email, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const access = await getAdminOfficeAccess({ ...profile, email: profile?.email || user.email });
  const canManageLocations = Boolean(
    profile?.is_admin ||
      access.isSuperAdmin ||
      access.offices.includes("admin-office") ||
      access.permissions.includes("admin.locations.manage"),
  );

  if (!canManageLocations) return { supabase: null, error: "You do not have permission to manage locations." };

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return { supabase: null, error: "Location management is not configured on the server." };

  return {
    supabase: createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey),
    error: null,
  };
}

function revalidateDiary() {
  revalidatePath("/admin/diary");
  revalidatePath("/admin/diary/locations");
  revalidatePath("/dashboard/diary");
}

export async function createDiaryLocation(name: string) {
  const { supabase, error } = await requireLocationManager();
  if (error || !supabase) return { error: error || "Location management is not configured on the server." };
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
  const { supabase, error } = await requireLocationManager();
  if (error || !supabase) return { error: error || "Location management is not configured on the server." };
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

export async function updateDiaryLocation(id: string, name: string) {
  const { supabase, error } = await requireLocationManager();
  if (error || !supabase) return { error: error || "Location management is not configured on the server." };
  const cleanName = name.trim();
  if (!cleanName) return { error: "District name is required." };
  const { error: updateError } = await supabase.from("diary_locations").update({ name: cleanName }).eq("id", id);
  if (updateError) return { error: updateError.message };
  revalidateDiary();
  return { success: true };
}

export async function updateDiaryAssembly(id: string, locationId: string, name: string) {
  const { supabase, error } = await requireLocationManager();
  if (error || !supabase) return { error: error || "Location management is not configured on the server." };
  const cleanName = name.trim();
  if (!locationId) return { error: "Select a district." };
  if (!cleanName) return { error: "Assembly name is required." };
  const { error: updateError } = await supabase.from("diary_assemblies").update({ location_id: locationId, name: cleanName }).eq("id", id);
  if (updateError) return { error: updateError.message };
  revalidateDiary();
  return { success: true };
}

export async function deleteDiaryLocation(id: string) {
  const { supabase, error } = await requireLocationManager();
  if (error || !supabase) return { error: error || "Location management is not configured on the server." };
  const { error: deleteError } = await supabase.from("diary_locations").delete().eq("id", id);
  if (deleteError) return { error: deleteError.message };
  revalidateDiary();
  return { success: true };
}

export async function deleteDiaryAssembly(id: string) {
  const { supabase, error } = await requireLocationManager();
  if (error || !supabase) return { error: error || "Location management is not configured on the server." };
  const { error: deleteError } = await supabase.from("diary_assemblies").delete().eq("id", id);
  if (deleteError) return { error: deleteError.message };
  revalidateDiary();
  return { success: true };
}
