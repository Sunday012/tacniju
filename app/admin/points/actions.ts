"use server"

import { revalidatePath } from "next/cache"
import { getCurrentAccessProfile, isMainAdmin } from "@/lib/access"
import { getPointCategory } from "@/lib/point-categories"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

function revalidatePointPaths(category?: string) {
  revalidatePath("/admin/points")
  if (category) {
    revalidatePath(`/admin/points/${category}`)
    revalidatePath(`/admin/points/${category}/works`)
    revalidatePath(`/admin/points/${category}/members`)
    revalidatePath(`/admin/points/${category}/summary`)
  }
  revalidatePath("/dashboard")
  revalidatePath("/admin")
}

function getAdminSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) return null
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
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

export async function createPointWork(formData: FormData) {
  const { supabase, user, profile } = await getCurrentAccessProfile()
  if (!user || !isMainAdmin(profile)) {
    return { error: "Only admins can manage points." }
  }

  const category = String(formData.get("category") || "").trim()
  const categoryConfig = getPointCategory(category)
  const title = String(formData.get("title") || "").trim()
  const points = Number(formData.get("points") || 0)
  const mode = String(formData.get("mode") || categoryConfig?.defaultMode || "add")
  const note = String(formData.get("note") || "").trim()

  if (!categoryConfig) return { error: "Select a valid point category." }
  if (!title) return { error: "Work title is required." }
  if (!Number.isFinite(points) || points <= 0) return { error: "Points must be greater than zero." }
  if (mode !== "add" && mode !== "remove") return { error: "Select a valid point action." }

  const adminSupabase = getAdminSupabase()
  if (!adminSupabase) return { error: "Server config error." }

  const { error: insertError } = await adminSupabase.from("point_works").insert({
    category,
    title,
    points,
    mode,
    note: note || null,
    created_by: user.id,
  })

  if (insertError) {
    console.error("Failed to create point work", insertError)
    return { error: "Failed to create work. Run scripts/037_point_works_and_bulk_members.sql if the table is not ready." }
  }

  revalidatePointPaths(category)
  return { success: true }
}

export async function createPointWorkRecord(formData: FormData) {
  return createPointWork(formData)
}

export async function addMembersToPointWork(formData: FormData) {
  const { supabase, user, profile } = await getCurrentAccessProfile()
  if (!user || !isMainAdmin(profile)) {
    return { error: "Only admins can manage points." }
  }

  const workId = String(formData.get("work_id") || "").trim()
  const memberIds = formData.getAll("profile_ids").map(value => String(value).trim()).filter(Boolean)

  if (!workId) return { error: "Select a work." }
  if (memberIds.length === 0) return { error: "Select at least one member." }

  const { data: work, error: workError } = await supabase
    .from("point_works")
    .select("id, category, title, points, mode, note")
    .eq("id", workId)
    .maybeSingle()

  if (workError || !work) {
    console.error("Failed to fetch point work", workError)
    return { error: "Could not find selected work." }
  }

  const { data: existing } = await supabase
    .from("point_work_records")
    .select("profile_id")
    .eq("work_id", workId)
    .in("profile_id", memberIds)

  const existingIds = new Set((existing || []).map(row => row.profile_id))
  const newMemberIds = memberIds.filter(id => !existingIds.has(id))
  if (newMemberIds.length === 0) return { error: "Selected members are already under this work." }

  const { data: members, error: memberError } = await supabase
    .from("profiles")
    .select("id, points")
    .in("id", newMemberIds)

  if (memberError || !members?.length) {
    console.error("Failed to fetch members for point work", memberError)
    return { error: "Could not find selected members." }
  }

  const records = members.map(member => ({
    category: work.category,
    title: work.title,
    work_id: work.id,
    profile_id: member.id,
    points: work.points,
    mode: work.mode,
    note: work.note || null,
    created_by: user.id,
  }))

  const { error: insertError } = await supabase.from("point_work_records").insert(records)
  if (insertError) {
    console.error("Failed to add members to point work", insertError)
    return { error: "Failed to add members to work." }
  }

  for (const member of members) {
    const current = Number(member.points || 0)
    const nextPoints = work.mode === "remove" ? Math.max(0, current - Number(work.points || 0)) : current + Number(work.points || 0)
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ points: nextPoints })
      .eq("id", member.id)

    if (updateError) {
      console.error("Failed to apply points to member", updateError)
      return { error: "Members were added, but some points could not be applied." }
    }
  }

  revalidatePointPaths(work.category)
  return { success: true, added: members.length }
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
