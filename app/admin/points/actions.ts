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

export async function updatePointWork(formData: FormData) {
  const { user, profile } = await getCurrentAccessProfile()
  if (!user || !isMainAdmin(profile)) {
    return { error: "Only admins can manage points." }
  }

  const id = String(formData.get("id") || "").trim()
  const title = String(formData.get("title") || "").trim()
  const points = Number(formData.get("points") || 0)
  const mode = String(formData.get("mode") || "add")
  const note = String(formData.get("note") || "").trim()

  if (!id) return { error: "Work ID is required." }
  if (!title) return { error: "Work title is required." }
  if (!Number.isFinite(points) || points <= 0) return { error: "Points must be greater than zero." }
  if (mode !== "add" && mode !== "remove") return { error: "Select a valid point action." }

  const adminSupabase = getAdminSupabase()
  if (!adminSupabase) return { error: "Server config error." }

  const { data: work, error: workError } = await adminSupabase
    .from("point_works")
    .select("id, category, points, mode")
    .eq("id", id)
    .maybeSingle()

  if (workError || !work) {
    console.error("Failed to fetch point work for update", workError)
    return { error: "Could not find selected work." }
  }

  const { data: records, error: recordsError } = await adminSupabase
    .from("point_work_records")
    .select("id, profile_id, points, mode")
    .eq("work_id", id)

  if (recordsError) {
    console.error("Failed to fetch point work members for update", recordsError)
    return { error: "Could not load members under this work." }
  }

  const oldSigned = work.mode === "remove" ? -Number(work.points || 0) : Number(work.points || 0)
  const newSigned = mode === "remove" ? -points : points
  const delta = newSigned - oldSigned

  const { error: updateError } = await adminSupabase
    .from("point_works")
    .update({ title, points, mode, note: note || null, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (updateError) {
    console.error("Failed to update point work", updateError)
    return { error: "Failed to update work." }
  }

  const { error: recordUpdateError } = await adminSupabase
    .from("point_work_records")
    .update({ title, points, mode, note: note || null })
    .eq("work_id", id)

  if (recordUpdateError) {
    console.error("Failed to update point work records", recordUpdateError)
    return { error: "Work was updated, but member records could not be updated." }
  }

  if (delta !== 0 && records?.length) {
    const profileIds = records.map(record => record.profile_id).filter(Boolean)
    const { data: members, error: membersError } = await adminSupabase
      .from("profiles")
      .select("id, points")
      .in("id", profileIds)

    if (membersError) {
      console.error("Failed to fetch members for point adjustment", membersError)
      return { error: "Work was updated, but member points could not be adjusted." }
    }

    for (const member of members || []) {
      const nextPoints = Math.max(0, Number(member.points || 0) + delta)
      const { error: memberUpdateError } = await adminSupabase
        .from("profiles")
        .update({ points: nextPoints })
        .eq("id", member.id)

      if (memberUpdateError) {
        console.error("Failed to adjust member points for point work update", memberUpdateError)
        return { error: "Work was updated, but some member points could not be adjusted." }
      }
    }
  }

  revalidatePointPaths(work.category)
  return { success: true }
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

export async function deletePointWork(workId: string) {
  const { user, profile } = await getCurrentAccessProfile()
  if (!user || !isMainAdmin(profile)) {
    return { error: "Only admins can manage points." }
  }

  const id = workId.trim()
  if (!id) return { error: "Work ID is required." }

  const adminSupabase = getAdminSupabase()
  if (!adminSupabase) return { error: "Server config error." }

  const { data: work, error: workError } = await adminSupabase
    .from("point_works")
    .select("id, category")
    .eq("id", id)
    .maybeSingle()

  if (workError || !work) {
    console.error("Failed to fetch point work for delete", workError)
    return { error: "Could not find selected work." }
  }

  const { data: records, error: recordsError } = await adminSupabase
    .from("point_work_records")
    .select("id, profile_id, points, mode")
    .eq("work_id", id)

  if (recordsError) {
    console.error("Failed to fetch point work records for delete", recordsError)
    return { error: "Could not load members under this work." }
  }

  if (records?.length) {
    const profileIds = records.map(record => record.profile_id).filter(Boolean)
    const { data: members, error: membersError } = await adminSupabase
      .from("profiles")
      .select("id, points")
      .in("id", profileIds)

    if (membersError) {
      console.error("Failed to fetch members for point work delete", membersError)
      return { error: "Could not reverse member points." }
    }

    const memberPoints = new Map((members || []).map(member => [member.id, Number(member.points || 0)]))
    for (const record of records) {
      const current = memberPoints.get(record.profile_id)
      if (current === undefined) continue

      const nextPoints = record.mode === "remove"
        ? current + Number(record.points || 0)
        : Math.max(0, current - Number(record.points || 0))
      memberPoints.set(record.profile_id, nextPoints)
    }

    for (const [profileId, nextPoints] of Array.from(memberPoints.entries())) {
      const { error: updateError } = await adminSupabase
        .from("profiles")
        .update({ points: nextPoints })
        .eq("id", profileId)

      if (updateError) {
        console.error("Failed to reverse member points for point work delete", updateError)
        return { error: "Could not reverse all member points." }
      }
    }
  }

  const { error: deleteError } = await adminSupabase
    .from("point_works")
    .delete()
    .eq("id", id)

  if (deleteError) {
    console.error("Failed to delete point work", deleteError)
    return { error: "Failed to delete work." }
  }

  revalidatePointPaths(work.category)
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
