"use server"

import { revalidatePath } from "next/cache"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/server"

const METRO_PATH = "/metro"

async function getAdminClient() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.is_admin) throw new Error("Admin access required")

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getMetroWorkspaceData() {
  const adminSupabase = await getAdminClient()

  const [
    areasResult,
    membersResult,
    memosResult,
    eventsResult,
    attendanceResult,
    duesResult,
    transactionsResult,
  ] = await Promise.all([
    adminSupabase.from("metro_areas").select("*").order("name"),
    adminSupabase.from("metro_members").select("*, area:metro_areas(*)").order("full_name"),
    adminSupabase.from("metro_memos").select("*").order("updated_at", { ascending: false }),
    adminSupabase.from("metro_events").select("*").order("event_date", { ascending: false }),
    adminSupabase.from("metro_attendance").select("*"),
    adminSupabase.from("metro_dues").select("*"),
    adminSupabase.from("metro_transactions").select("*").order("created_at", { ascending: false }),
  ])

  const error = areasResult.error || membersResult.error || memosResult.error || eventsResult.error ||
    attendanceResult.error || duesResult.error || transactionsResult.error

  if (error) throw new Error(error.message)

  return {
    areas: areasResult.data || [],
    members: membersResult.data || [],
    memos: memosResult.data || [],
    events: eventsResult.data || [],
    attendance: attendanceResult.data || [],
    dues: duesResult.data || [],
    transactions: transactionsResult.data || [],
  }
}

export async function createMetroArea(name: string) {
  const adminSupabase = await getAdminClient()
  const { error } = await adminSupabase.from("metro_areas").insert({ name: name.trim() })
  if (error) return { success: false, message: error.message }
  revalidatePath(METRO_PATH)
  return { success: true }
}

export async function updateMetroArea(id: string, name: string) {
  const adminSupabase = await getAdminClient()
  const { error } = await adminSupabase
    .from("metro_areas")
    .update({ name: name.trim() })
    .eq("id", id)

  if (error) return { success: false, message: error.message }
  revalidatePath(METRO_PATH)
  return { success: true }
}

export async function deleteMetroArea(id: string) {
  const adminSupabase = await getAdminClient()
  const { error } = await adminSupabase.from("metro_areas").delete().eq("id", id)
  if (error) return { success: false, message: error.message }
  revalidatePath(METRO_PATH)
  return { success: true }
}

export async function createMetroMember(input: {
  full_name: string
  sex?: string
  area_id?: string
  phone_number?: string
}) {
  const adminSupabase = await getAdminClient()
  const { error } = await adminSupabase.from("metro_members").insert({
    full_name: input.full_name.trim(),
    sex: input.sex || null,
    area_id: input.area_id || null,
    phone_number: input.phone_number?.trim() || null,
  })
  if (error) return { success: false, message: error.message }
  revalidatePath(METRO_PATH)
  return { success: true }
}

export async function updateMetroMember(id: string, input: {
  full_name: string
  sex?: string
  area_id?: string
  phone_number?: string
}) {
  const adminSupabase = await getAdminClient()
  const { error } = await adminSupabase
    .from("metro_members")
    .update({
      full_name: input.full_name.trim(),
      sex: input.sex || null,
      area_id: input.area_id || null,
      phone_number: input.phone_number?.trim() || null,
    })
    .eq("id", id)

  if (error) return { success: false, message: error.message }
  revalidatePath(METRO_PATH)
  return { success: true }
}

export async function deleteMetroMember(id: string) {
  const adminSupabase = await getAdminClient()
  const { error } = await adminSupabase.from("metro_members").delete().eq("id", id)
  if (error) return { success: false, message: error.message }
  revalidatePath(METRO_PATH)
  return { success: true }
}

export async function createMetroMemo(input: { title: string; body: string }) {
  const adminSupabase = await getAdminClient()
  const { error } = await adminSupabase.from("metro_memos").insert({
    title: input.title.trim(),
    body: input.body,
  })
  if (error) return { success: false, message: error.message }
  revalidatePath(METRO_PATH)
  return { success: true }
}

export async function updateMetroMemo(id: string, input: { title: string; body: string }) {
  const adminSupabase = await getAdminClient()
  const { error } = await adminSupabase
    .from("metro_memos")
    .update({ title: input.title.trim(), body: input.body, updated_at: new Date().toISOString() })
    .eq("id", id)
  if (error) return { success: false, message: error.message }
  revalidatePath(METRO_PATH)
  return { success: true }
}

export async function createMetroEvent(input: { name: string; event_date: string; description?: string }) {
  const adminSupabase = await getAdminClient()
  const { error } = await adminSupabase.from("metro_events").insert({
    name: input.name.trim(),
    event_date: input.event_date,
    description: input.description?.trim() || null,
  })
  if (error) return { success: false, message: error.message }
  revalidatePath(METRO_PATH)
  return { success: true }
}

export async function saveMetroAttendance(eventId: string, memberIds: string[]) {
  const adminSupabase = await getAdminClient()
  const { error: deleteError } = await adminSupabase
    .from("metro_attendance")
    .delete()
    .eq("event_id", eventId)

  if (deleteError) return { success: false, message: deleteError.message }

  if (memberIds.length > 0) {
    const { error } = await adminSupabase
      .from("metro_attendance")
      .insert(memberIds.map((member_id) => ({ event_id: eventId, member_id })))
    if (error) return { success: false, message: error.message }
  }

  revalidatePath(METRO_PATH)
  return { success: true }
}

export async function saveMetroDues(eventId: string, entries: { member_id: string; amount: number }[]) {
  const adminSupabase = await getAdminClient()
  const { error: deleteError } = await adminSupabase
    .from("metro_dues")
    .delete()
    .eq("event_id", eventId)

  if (deleteError) return { success: false, message: deleteError.message }

  if (entries.length > 0) {
    const { error } = await adminSupabase
      .from("metro_dues")
      .insert(entries.map((entry) => ({ event_id: eventId, member_id: entry.member_id, amount: entry.amount })))
    if (error) return { success: false, message: error.message }
  }

  revalidatePath(METRO_PATH)
  return { success: true }
}

export async function createMetroTransaction(input: {
  event_id?: string
  kind: "income" | "expense"
  title: string
  amount: number
  people_count?: number
  notes?: string
}) {
  const adminSupabase = await getAdminClient()
  const { error } = await adminSupabase.from("metro_transactions").insert({
    event_id: input.event_id || null,
    kind: input.kind,
    title: input.title.trim(),
    amount: input.amount,
    people_count: input.people_count || 0,
    notes: input.notes?.trim() || null,
  })
  if (error) return { success: false, message: error.message }
  revalidatePath(METRO_PATH)
  return { success: true }
}
