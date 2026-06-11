"use server"

import { revalidatePath } from "next/cache"
import { getCurrentAccessProfile, isMainAdmin } from "@/lib/access"
import { getPointCategory } from "@/lib/point-categories"

function revalidatePointPaths(category?: string) {
  revalidatePath("/admin/points")
  if (category) {
    revalidatePath(`/admin/points/${category}`)
    revalidatePath(`/admin/points/${category}/works`)
    revalidatePath(`/admin/points/${category}/summary`)
  }
  revalidatePath("/dashboard")
}

export async function adjustMemberPoints(formData: FormData) {
  const { supabase, user, profile } = await getCurrentAccessProfile()
  if (!user || !isMainAdmin(profile)) return

  const profileId = String(formData.get("profile_id") || "").trim()
  const points = Number(formData.get("points") || 0)
  const mode = String(formData.get("mode") || "add")

  if (!profileId) return
  if (!Number.isFinite(points) || points <= 0) return

  const { data: member, error: fetchError } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", profileId)
    .maybeSingle()

  if (fetchError || !member) {
    console.error("Failed to fetch member for point adjustment", fetchError)
    return
  }

  const current = Number(member.points || 0)
  const nextPoints = mode === "remove" ? Math.max(0, current - points) : current + points
  const { error } = await supabase
    .from("profiles")
    .update({ points: nextPoints })
    .eq("id", profileId)

  if (error) {
    console.error("Failed to adjust points", error)
    return
  }
  revalidatePointPaths()
}

export async function createPointWorkRecord(formData: FormData) {
  const { supabase, user, profile } = await getCurrentAccessProfile()
  if (!user || !isMainAdmin(profile)) {
    return { error: "Only admins can manage points." }
  }

  const category = String(formData.get("category") || "").trim()
  const categoryConfig = getPointCategory(category)
  const title = String(formData.get("title") || "").trim()
  const profileId = String(formData.get("profile_id") || "").trim()
  const points = Number(formData.get("points") || 0)
  const mode = String(formData.get("mode") || categoryConfig?.defaultMode || "add")
  const note = String(formData.get("note") || "").trim()

  if (!categoryConfig) return { error: "Select a valid point category." }
  if (!title) return { error: "Work title is required." }
  if (!profileId) return { error: "Select a member." }
  if (!Number.isFinite(points) || points <= 0) return { error: "Points must be greater than zero." }
  if (mode !== "add" && mode !== "remove") return { error: "Select a valid point action." }

  const { data: member, error: fetchError } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", profileId)
    .maybeSingle()

  if (fetchError || !member) {
    console.error("Failed to fetch member for point work", fetchError)
    return { error: "Could not find selected member." }
  }

  const { error: insertError } = await supabase.from("point_work_records").insert({
    category,
    title,
    profile_id: profileId,
    points,
    mode,
    note: note || null,
    created_by: user.id,
  })

  if (insertError) {
    console.error("Failed to create point work record", insertError)
    return { error: "Failed to create work. Run scripts/034_create_point_work_records.sql if the table is not ready." }
  }

  const current = Number(member.points || 0)
  const nextPoints = mode === "remove" ? Math.max(0, current - points) : current + points
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ points: nextPoints })
    .eq("id", profileId)

  if (updateError) {
    console.error("Failed to apply point work record", updateError)
    return { error: "Work was saved but points could not be applied." }
  }

  revalidatePointPaths(category)
  return { success: true }
}

export async function deletePointWorkRecord(recordId: string) {
  const { supabase, user, profile } = await getCurrentAccessProfile()
  if (!user || !isMainAdmin(profile)) {
    return { error: "Only admins can manage points." }
  }

  const id = recordId.trim()
  if (!id) return { error: "Work record ID is required." }

  const { data: record, error: fetchError } = await supabase
    .from("point_work_records")
    .select("id, category, profile_id, points, mode")
    .eq("id", id)
    .maybeSingle()

  if (fetchError || !record) {
    console.error("Failed to fetch point work record", fetchError)
    return { error: "Could not find work record." }
  }

  const { data: member, error: memberError } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", record.profile_id)
    .maybeSingle()

  if (memberError || !member) {
    console.error("Failed to fetch member for point work delete", memberError)
    return { error: "Could not find work member." }
  }

  const { error: deleteError } = await supabase
    .from("point_work_records")
    .delete()
    .eq("id", id)

  if (deleteError) {
    console.error("Failed to delete point work record", deleteError)
    return { error: "Failed to delete work." }
  }

  const current = Number(member.points || 0)
  const nextPoints = record.mode === "remove" ? current + Number(record.points || 0) : Math.max(0, current - Number(record.points || 0))
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ points: nextPoints })
    .eq("id", record.profile_id)

  if (updateError) {
    console.error("Failed to reverse point work", updateError)
    return { error: "Work was deleted but points could not be reversed." }
  }

  revalidatePointPaths(record.category)
  return { success: true }
}
