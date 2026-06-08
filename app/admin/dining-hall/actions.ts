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
  revalidatePath("/dashboard/dining-hall")
  revalidatePath("/dashboard")

}

export async function recordDiningHallServing(formData: FormData) {
  const { supabase, user, error } = await assertDiningHallAccess()
  if (error || !user) {
    console.error(error)
    return
  }

  const mealId = String(formData.get("meal_id") || "").trim()
  const profileId = String(formData.get("profile_id") || "").trim()
  const plates = Number(formData.get("plates") || 1)
  const note = String(formData.get("note") || "").trim()

  if (!mealId || !profileId) {
    console.error("Select a meal and person before recording food.")
    return
  }

  if (!Number.isFinite(plates) || plates <= 0) {
    console.error("Plate quantity must be greater than zero.")
    return
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
    return
  }

  revalidatePath("/admin/dining-hall")
  revalidatePath("/dashboard/dining-hall")
}
