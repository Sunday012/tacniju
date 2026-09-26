"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"

const roomsPath = "/admin/office/directors/logistics/rooms"

async function context() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, orgId: null, error: "You must be signed in." }
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
  if (!profile?.is_admin) return { supabase, user, orgId: null, error: "Admin access is required." }
  return { supabase, user, orgId: await getAccountingOrgId(), error: null }
}

export async function createRoomAllocation(formData: FormData) {
  const { supabase, user, orgId, error } = await context()
  if (error || !user || !orgId) return { error: error || "Unable to open the room register." }

  const roomId = String(formData.get("room_id") || "").trim()
  const occupantName = String(formData.get("occupant_name") || "").trim()
  const reservationNumber = String(formData.get("reservation_number") || "").trim()
  const allocatedOn = String(formData.get("allocated_on") || "")
  const notes = String(formData.get("notes") || "").trim()
  if (!roomId || !occupantName || !allocatedOn) return { error: "Room, occupant, and allocation date are required." }

  const { data: room } = await supabase.from("logistics_rooms").select("id, name, room_number, capacity").eq("id", roomId).eq("org_id", orgId).maybeSingle()
  if (!room) return { error: "Select a valid room." }
  const { count } = await supabase.from("logistics_room_allocations").select("id", { count: "exact", head: true }).eq("room_id", roomId).eq("status", "Allocated")
  if ((count || 0) >= room.capacity) return { error: "This room has no available spaces." }

  const { error: insertError } = await supabase.from("logistics_room_allocations").insert({ org_id: orgId, room_id: roomId, room_name: `${room.name} (${room.room_number})`, occupant_name: occupantName, reservation_number: reservationNumber || null, capacity: room.capacity, allocated_on: allocatedOn, notes: notes || null, created_by: user.id })
  if (insertError) return { error: insertError.message }
  revalidatePath(roomsPath)
  return { success: true }
}

export async function createLogisticsRoom(formData: FormData) {
  const { supabase, user, orgId, error } = await context()
  if (error || !user || !orgId) return { error: error || "Unable to open the room directory." }
  const name = String(formData.get("name") || "").trim()
  const roomNumber = String(formData.get("room_number") || "").trim()
  const location = String(formData.get("location") || "").trim()
  const headOfRoom = String(formData.get("head_of_room") || "").trim()
  const capacity = Number(formData.get("capacity") || 1)
  if (!name || !roomNumber || !location) return { error: "Room name, number, and location are required." }
  if (!Number.isInteger(capacity) || capacity < 1) return { error: "Capacity must be at least one." }
  const { error: insertError } = await supabase.from("logistics_rooms").insert({ org_id: orgId, name, room_number: roomNumber, location, head_of_room: headOfRoom || null, capacity, created_by: user.id })
  if (insertError) return { error: insertError.message }
  revalidatePath(roomsPath)
  return { success: true }
}

export async function updateLogisticsRoom(id: string, formData: FormData) {
  const { supabase, orgId, error } = await context()
  if (error || !orgId) return { error: error || "Unable to update the room." }
  const name = String(formData.get("name") || "").trim()
  const roomNumber = String(formData.get("room_number") || "").trim()
  const location = String(formData.get("location") || "").trim()
  const headOfRoom = String(formData.get("head_of_room") || "").trim()
  const capacity = Number(formData.get("capacity") || 1)
  if (!name || !roomNumber || !location) return { error: "Room name, number, and location are required." }
  if (!Number.isInteger(capacity) || capacity < 1) return { error: "Capacity must be at least one." }
  const { count } = await supabase.from("logistics_room_allocations").select("id", { count: "exact", head: true }).eq("room_id", id).eq("status", "Allocated")
  if ((count || 0) > capacity) return { error: `Capacity cannot be below the ${count} people currently allocated.` }

  const { error: updateError } = await supabase
    .from("logistics_rooms")
    .update({ name, room_number: roomNumber, location, head_of_room: headOfRoom || null, capacity, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("org_id", orgId)
  if (updateError) return { error: updateError.message }

  const { error: allocationError } = await supabase
    .from("logistics_room_allocations")
    .update({ room_name: `${name} (${roomNumber})`, capacity, updated_at: new Date().toISOString() })
    .eq("room_id", id)
    .eq("org_id", orgId)
  if (allocationError) return { error: allocationError.message }
  revalidatePath(roomsPath)
  return { success: true }
}

export async function deleteLogisticsRoom(id: string) {
  const { supabase, orgId, error } = await context()
  if (error || !orgId) return { error: error || "Unable to delete the room." }
  const { count } = await supabase.from("logistics_room_allocations").select("id", { count: "exact", head: true }).eq("room_id", id).eq("status", "Allocated")
  if ((count || 0) > 0) return { error: "Release every active occupant before deleting this room." }
  const { error: deleteError } = await supabase.from("logistics_rooms").delete().eq("id", id).eq("org_id", orgId)
  if (deleteError) return { error: deleteError.message }
  revalidatePath(roomsPath)
  return { success: true }
}

export async function setRoomAllocationStatus(id: string, status: "Allocated" | "Released") {
  const { supabase, orgId, error } = await context()
  if (error || !orgId) return { error: error || "Unable to update the room allocation." }
  const { error: updateError } = await supabase
    .from("logistics_room_allocations")
    .update({ status, released_on: status === "Released" ? new Date().toISOString().slice(0, 10) : null, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("org_id", orgId)
  if (updateError) return { error: updateError.message }
  revalidatePath(roomsPath)
  return { success: true }
}

export async function deleteRoomAllocation(id: string) {
  const { supabase, orgId, error } = await context()
  if (error || !orgId) return { error: error || "Unable to delete the room allocation." }
  const { error: deleteError } = await supabase.from("logistics_room_allocations").delete().eq("id", id).eq("org_id", orgId)
  if (deleteError) return { error: deleteError.message }
  revalidatePath(roomsPath)
  return { success: true }
}
