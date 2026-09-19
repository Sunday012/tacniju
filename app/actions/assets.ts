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
  const gift_number = String(formData.get("gift_number") || "").trim() || null;
  const is_stall_item = formData.get("is_stall_item") === "on";
  const money_price = parseFloat(formData.get("money_price") as string) || 0;
  const point_price = parseInt(formData.get("point_price") as string, 10) || 0;
  const quantity = parseInt(formData.get("quantity") as string, 10);

  if (!name || !category || isNaN(quantity)) {
    return { error: "Missing required fields." };
  }

  const { error } = await supabase.from("assets").insert({
    name,
    category,
    is_gift,
    gift_number,
    is_stall_item,
    money_price,
    point_price,
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

export async function getAllAssetAssignments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("asset_assignments")
    .select(`
      id,
      assigned_at,
      profile_id,
      asset:assets!asset_id(
        name,
        category,
        gift_number
      ),
      profile:profiles!profile_id(
        full_name,
        reservation_number,
        phone_number
      ),
      assigned_by_profile:profiles!assigned_by(
        full_name
      )
    `)
    .order("assigned_at", { ascending: false });

  if (error) {
    console.error("Error fetching all assignments:", error);
    return { error: error.message };
  }

  return { assignments: data };
}

export async function getUserAssetAssignments() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { assignments: [] };

  const { data, error } = await supabase
    .from("asset_assignments")
    .select(`
      id,
      assigned_at,
      asset:assets!asset_id(
        name,
        category
      )
    `)
    .eq("profile_id", authData.user.id)
    .order("assigned_at", { ascending: false });

  if (error) {
    console.error("Error fetching user assignments:", error);
    return { error: error.message };
  }

  return { assignments: data };
}

export async function assignGift(formData: FormData) {
  const supabase = await createClient();
  const rawReservationNumber = formData.get("reservationNumber") as string;
  const reservationNumber = rawReservationNumber?.trim();
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
export async function editAsset(assetId: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const is_gift = formData.get("is_gift") === "on";
  const gift_number = String(formData.get("gift_number") || "").trim() || null;
  const is_stall_item = formData.get("is_stall_item") === "on";
  const money_price = parseFloat(formData.get("money_price") as string) || 0;
  const point_price = parseInt(formData.get("point_price") as string, 10) || 0;
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
      gift_number,
      is_stall_item,
      money_price,
      point_price,
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

export async function revokeGift(assignmentId: string) {
  const supabase = await createClient();

  // 1. Get the assignment to know which asset it is
  const { data: assignment, error: fetchError } = await supabase
    .from("asset_assignments")
    .select("asset_id")
    .eq("id", assignmentId)
    .single();

  if (fetchError || !assignment) {
    return { error: "Assignment not found." };
  }

  // 2. Delete the assignment
  const { error: deleteError } = await supabase
    .from("asset_assignments")
    .delete()
    .eq("id", assignmentId);

  if (deleteError) {
    console.error("Error revoking gift:", deleteError);
    return { error: deleteError.message };
  }

  // 3. Increment the available quantity of the asset
  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .select("available_quantity")
    .eq("id", assignment.asset_id)
    .single();

  if (!assetError && asset) {
    await supabase
      .from("assets")
      .update({ available_quantity: asset.available_quantity + 1 })
      .eq("id", assignment.asset_id);
  }

  revalidatePath("/admin/stock");
  return { success: true };
}

export async function toggleAssetVisibility(assetId: string, currentVisibility: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("assets")
    .update({ is_visible: !currentVisibility })
    .eq("id", assetId);

  if (error) {
    console.error("Error toggling visibility:", error);
    return { error: error.message };
  }
  revalidatePath("/admin/stock");
  revalidatePath("/dashboard/stall");
  return { success: true };
}

export async function getAdminStallOrders() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stall_orders")
    .select(`
      id,
      profile_id,
      asset_id,
      payment_method,
      status,
      created_at,
      asset:assets!asset_id(name, category, money_price, point_price),
      profile:profiles!profile_id(full_name, reservation_number, phone_number, points)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching stall orders:", error);
    return { error: error.message };
  }
  return { orders: data };
}

export async function updateStallOrderStatus(orderId: string, status: string, assetId: string, paymentMethod: string, profileId: string, pointPrice: number) {
  const supabase = await createClient();
  
  // Update order status
  const { error } = await supabase
    .from("stall_orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    console.error("Error updating order status:", error);
    return { error: error.message };
  }

  // If approved, decrement asset available quantity and create assignment
  if (status === "approved") {
    const { data: asset } = await supabase.from("assets").select("available_quantity").eq("id", assetId).single();
    if (asset) {
      await supabase.from("assets").update({ available_quantity: Math.max(0, asset.available_quantity - 1) }).eq("id", assetId);
    }
    
    // Create the assignment so it shows up in "Received Gifts"
    const { data: authData } = await supabase.auth.getUser();
    await supabase.from("asset_assignments").insert({
      asset_id: assetId,
      profile_id: profileId,
      assigned_by: authData?.user?.id,
    });
  }

  // If rejected AND paid with points, refund the points
  if (status === "rejected" && paymentMethod === "points") {
    const { data: profile } = await supabase.from("profiles").select("points").eq("id", profileId).single();
    if (profile) {
      await supabase.from("profiles").update({ points: (profile.points || 0) + pointPrice }).eq("id", profileId);
    }
  }

  revalidatePath("/admin/stock");
  revalidatePath("/admin/stalls");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/stall");
  return { success: true };
}

export async function createStallOrder(assetId: string, paymentMethod: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify asset exists and is available
  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .select("available_quantity, point_price")
    .eq("id", assetId)
    .single();

  if (assetError || !asset) return { error: "Item not found" };
  if (asset.available_quantity <= 0) return { error: "Item is out of stock" };

  let originalPoints: number | null = null;
  let deductedPoints = 0;

  // If paying with points, deduct points
  if (paymentMethod === "points") {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) return { error: "Could not fetch your points" };
    if ((profile.points || 0) < asset.point_price) {
      return { error: "You do not have enough points for this item." };
    }

    originalPoints = Number(profile.points || 0);
    deductedPoints = Number(asset.point_price || 0);

    // Deduct points
    const { error: deductError } = await supabase
      .from("profiles")
      .update({ points: originalPoints - deductedPoints })
      .eq("id", user.id);

    if (deductError) return { error: "Failed to deduct points" };
  }

  // Create order
  const { error: orderError } = await supabase.from("stall_orders").insert({
    profile_id: user.id,
    asset_id: assetId,
    payment_method: paymentMethod,
    status: "pending"
  });

  if (orderError) {
    if (paymentMethod === "points" && originalPoints !== null) {
      await supabase
        .from("profiles")
        .update({ points: originalPoints })
        .eq("id", user.id);
    }
    console.error("Error creating order:", orderError);
    return { error: "Failed to place request" };
  }

  revalidatePath("/dashboard/stall");
  revalidatePath("/dashboard");
  revalidatePath("/admin/stock");
  revalidatePath("/admin/stalls");
  return { success: true };
}

export async function deleteStallOrder(orderId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("stall_orders")
    .delete()
    .eq("id", orderId);

  if (error) {
    console.error("Error deleting stall order:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/stalls");
  revalidatePath("/admin/stock");
  return { success: true };
}
