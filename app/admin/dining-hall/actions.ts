"use server"

import { revalidatePath } from "next/cache"
import { getCurrentAccessProfile, isUshering } from "@/lib/access"

async function assertDiningHallAccess() {
  const { supabase, user, profile } = await getCurrentAccessProfile()
  if (!user) {
    return { supabase, user: null, error: "You must be logged in." }
  }

  if (!isUshering(profile)) {
    return { supabase, user: null, error: "Only admins and Ushering can manage Dining Hall records." }
  }

  return { supabase, user, error: null }
}

export async function createDiningHallMeal(formData: FormData) {
  const { supabase, user, error } = await assertDiningHallAccess()
  if (error || !user) {
    console.error(error)
    return
  }

  const mealName = String(formData.get("meal_name") || "").trim()
  const campDay = String(formData.get("camp_day") || "").trim()
  const mealTime = String(formData.get("meal_time") || "").trim()
  const unitName = String(formData.get("unit_name") || "Plate").trim() || "Plate"
  const points = Number(formData.get("points") || 0)

  if (!mealName || !campDay || !mealTime) {
    console.error("Meal name, camp day, and meal time are required.")
    return
  }

  if (!Number.isFinite(points) || points < 0) {
    console.error("Points must be zero or more.")
    return
  }

  const { error: insertError } = await supabase.from("dining_hall_meals").insert({
    meal_name: mealName,
    camp_day: campDay,
    meal_time: mealTime,
    points,
    unit_name: unitName,
    created_by: user.id,
  })

  if (insertError) {
    console.error("Failed to create dining hall meal", insertError)
    return
  }

  revalidatePath("/admin/dining-hall")
  revalidatePath("/admin/dining-hall/timetable")
  revalidatePath("/admin/dining-hall/register")
  revalidatePath("/admin/dining-hall/summary")
  revalidatePath("/dashboard/dining-hall")
  revalidatePath("/dashboard")

}

export async function recordDiningHallServing(formData: FormData) {
  const { supabase, user, error } = await assertDiningHallAccess()
  if (error || !user) {
    console.error(error)
    return { error: error || "You must be logged in." }
  }

  const mealId = String(formData.get("meal_id") || "").trim()
  const profileId = String(formData.get("profile_id") || "").trim()
  const plates = Number(formData.get("plates") || 1)
  const note = String(formData.get("note") || "").trim()

  if (!mealId || !profileId) {
    console.error("Select a meal and person before recording food.")
    return { error: "Select a meal before recording food." }
  }

  if (!Number.isFinite(plates) || plates <= 0) {
    console.error("Plate quantity must be greater than zero.")
    return { error: "Plate quantity must be greater than zero." }
  }

  const { error: insertError } = await supabase.from("dining_hall_servings").insert({
    meal_id: mealId,
    profile_id: profileId,
    plates,
    note: note || null,
    served_by: user.id,
  })

  if (insertError) {
    console.error("Failed to record dining hall serving", insertError)
    return { error: "Failed to record food. Please try again." }
  }

  revalidatePath("/admin/dining-hall")
  revalidatePath("/admin/dining-hall/register")
  revalidatePath("/admin/dining-hall/summary")
  revalidatePath("/dashboard/dining-hall")

  return { success: true }
}

export async function deleteDiningHallServingsForProfile(profileId: string) {
  const { supabase, user, error } = await assertDiningHallAccess()
  if (error || !user) {
    return { error: error || "You must be logged in." }
  }

  const id = profileId.trim()
  if (!id) {
    return { error: "Profile ID is required." }
  }

  const { error: deleteError } = await supabase
    .from("dining_hall_servings")
    .delete()
    .eq("profile_id", id)

  if (deleteError) {
    console.error("Failed to remove dining hall servings", deleteError)
    return { error: "Failed to remove food record. Please try again." }
  }

  revalidatePath("/admin/dining-hall")
  revalidatePath("/admin/dining-hall/register")
  revalidatePath("/admin/dining-hall/summary")
  revalidatePath("/dashboard/dining-hall")

  return { success: true }
}

export async function deleteDiningHallMeal(mealId: string) {
  const { supabase, user, error } = await assertDiningHallAccess()
  if (error || !user) {
    return { error: error || "You must be logged in." }
  }

  const id = mealId.trim()
  if (!id) {
    return { error: "Meal ID is required." }
  }

  const { error: updateError } = await supabase
    .from("dining_hall_meals")
    .update({
      active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (updateError) {
    console.error("Failed to delete dining hall meal", updateError)
    return { error: "Failed to delete meal. Please try again." }
  }

  revalidatePath("/admin/dining-hall")
  revalidatePath("/admin/dining-hall/timetable")
  revalidatePath("/admin/dining-hall/register")
  revalidatePath("/admin/dining-hall/summary")
  revalidatePath("/dashboard/dining-hall")
  revalidatePath("/dashboard")

  return { success: true }
}

export async function deleteAllDiningHallMeals() {
  const { supabase, user, error } = await assertDiningHallAccess()
  if (error || !user) {
    return { error: error || "You must be logged in." }
  }

  const { error: updateError } = await supabase
    .from("dining_hall_meals")
    .update({
      active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("active", true)

  if (updateError) {
    console.error("Failed to delete all dining hall meals", updateError)
    return { error: "Failed to delete all meals. Please try again." }
  }

  revalidatePath("/admin/dining-hall")
  revalidatePath("/admin/dining-hall/timetable")
  revalidatePath("/admin/dining-hall/register")
  revalidatePath("/admin/dining-hall/summary")
  revalidatePath("/dashboard/dining-hall")
  revalidatePath("/dashboard")

  return { success: true }
}
