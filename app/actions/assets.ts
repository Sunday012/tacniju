"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

export async function getAssets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching assets:", error);
    return { error: error.message };
  }

  return { assets: data };
}

export async function createAsset(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const is_gift = formData.get("is_gift") === "on";
  const quantity = parseInt(formData.get("quantity") as string, 10);

  if (!name || !category || isNaN(quantity)) {
    return { error: "Missing required fields." };
  }

  const { error } = await supabase.from("assets").insert({
    name,
    category,
    is_gift,
    total_quantity: quantity,
    available_quantity: quantity,
  });

  if (error) {
    console.error("Error creating asset:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/stock");
  return { success: true };
}

export async function getAssetAssignments(assetId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("asset_assignments")
    .select(`
      id,
      assigned_at,
      profile:profiles!profile_id(
        full_name,
        reservation_number
      )
    `)
    .eq("asset_id", assetId)
    .order("assigned_at", { ascending: false });

  if (error) {
    console.error("Error fetching assignments:", error);
    return { error: error.message };
  }

  return { assignments: data };
}

export async function assignGift(formData: FormData) {
  const supabase = await createClient();
  const reservationNumber = formData.get("reservationNumber") as string;
  const assetId = formData.get("assetId") as string;

  if (!reservationNumber || !assetId) {
    return { error: "Missing reservation number or asset ID." };
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

  // 2. Check asset availability
  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .select("available_quantity")
    .eq("id", assetId)
    .single();

  if (assetError || !asset) {
    return { error: "Asset not found." };
  }

  if (asset.available_quantity <= 0) {
    return { error: "This gift is out of stock!" };
  }

  // 3. Assign the gift
  const { data: authData } = await supabase.auth.getUser();
  const assignedBy = authData?.user?.id;

  const { error: assignError } = await supabase.from("asset_assignments").insert({
    asset_id: assetId,
    profile_id: profileId,
    assigned_by: assignedBy,
  });

  if (assignError) {
    console.error("Error assigning gift:", assignError);
    if (assignError.code === "23505") {
      return { error: "This person has already received this exact gift." };
    }
    return { error: assignError.message };
  }

  // 4. Decrement available quantity
  const { error: updateError } = await supabase
    .from("assets")
    .update({ available_quantity: asset.available_quantity - 1 })
    .eq("id", assetId);

  if (updateError) {
    console.error("Error updating quantity:", updateError);
    // Ideally we would rollback the assignment here but this is a simple system
  }

  revalidatePath("/admin/stock");
  return { success: true };
}

export async function deleteAsset(assetId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("assets")
    .delete()
    .eq("id", assetId);

  if (error) {
    console.error("Error deleting asset:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/stock");
  return { success: true };
}
export async function updateAsset(assetId: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const is_gift = formData.get("is_gift") === "on";
  const quantity = parseInt(formData.get("quantity") as string, 10);

  if (!name || !category || isNaN(quantity)) {
    return { error: "Missing required fields." };
  }

  // Get current asset to calculate new available quantity
  const { data: currentAsset, error: fetchError } = await supabase
    .from("assets")
    .select("total_quantity, available_quantity")
    .eq("id", assetId)
    .single();

  if (fetchError || !currentAsset) {
    return { error: "Asset not found." };
  }

  const diff = quantity - currentAsset.total_quantity;
  const newAvailable = Math.max(0, currentAsset.available_quantity + diff);

  const { error } = await supabase
    .from("assets")
    .update({
      name,
      category,
      is_gift,
      total_quantity: quantity,
      available_quantity: newAvailable,
    })
    .eq("id", assetId);

  if (error) {
    console.error("Error updating asset:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/stock");
  return { success: true };
}
