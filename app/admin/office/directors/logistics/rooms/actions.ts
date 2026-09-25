"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"

const roomsPath = "/admin/office/directors/logistics/rooms"

async function context() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, orgId: null, error: "You must be signed in." }
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
  if (!profile?.is_admin) return { supabase, user, orgId: null, error: "Admin access is required." }
  return { supabase, user, orgId: await getAccountingOrgId(), error: null }
}

export async function createRoomAllocation(formData: FormData) {
  const { supabase, user, orgId, error } = await context()
  if (error || !user || !orgId) return { error: error || "Unable to open the room register." }

  const roomName = String(formData.get("room_name") || "").trim()
  const occupantName = String(formData.get("occupant_name") || "").trim()
  const reservationNumber = String(formData.get("reservation_number") || "").trim()
  const allocatedOn = String(formData.get("allocated_on") || "")
  const capacity = Number(formData.get("capacity") || 1)
  const notes = String(formData.get("notes") || "").trim()
  if (!roomName || !occupantName || !allocatedOn) return { error: "Room, occupant, and allocation date are required." }
  if (!Number.isInteger(capacity) || capacity < 1) return { error: "Capacity must be at least one." }

  const { error: insertError } = await supabase.from("logistics_room_allocations").insert({
    org_id: orgId,
    room_name: roomName,
    occupant_name: occupantName,
    reservation_number: reservationNumber || null,
    capacity,
    allocated_on: allocatedOn,
    notes: notes || null,
    created_by: user.id,
  })
  if (insertError) return { error: insertError.message }
  revalidatePath(roomsPath)
  return { success: true }
}

export async function setRoomAllocationStatus(id: string, status: "Allocated" | "Released") {
  const { supabase, orgId, error } = await context()
  if (error || !orgId) return { error: error || "Unable to update the room allocation." }
  const { error: updateError } = await supabase.from("logistics_room_allocations").update({
    status,
    released_on: status === "Released" ? new Date().toISOString().slice(0, 10) : null,
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("org_id", orgId)
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
