"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"

const basePath = "/admin/office/directors/logistics/order-of-service"

async function context() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user)
    return {
      supabase,
      user: null,
      orgId: null,
      error: "You must be signed in."
    }
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
  if (!profile?.is_admin) return { supabase, user, orgId: null, error: "Admin access is required." }
  return { supabase, user, orgId: await getAccountingOrgId(), error: null }
}

function refresh(id?: string) {
  revalidatePath(basePath)
  if (id) revalidatePath(`${basePath}/${id}`)
  revalidatePath("/admin/office/directors/logistics/anchor")
  revalidatePath("/dashboard/order-of-service")
}

export async function createOrderService(formData: FormData) {
  const { supabase, user, orgId, error } = await context()
  if (error || !user || !orgId) return { error: error || "Unable to create the order of service." }
  const eventId = String(formData.get("event_id") || "")
  const title = String(formData.get("title") || "").trim()
  if (!eventId || !title) return { error: "Event and title are required." }
  const { data, error: insertError } = await supabase.from("logistics_order_services").insert({ org_id: orgId, event_id: eventId, title, created_by: user.id }).select("id").single()
  if (insertError) return { error: insertError.message }
  refresh(data.id)
  return { success: true, id: data.id as string }
}

export async function addOrderServiceItem(serviceId: string, formData: FormData) {
  const { supabase, error } = await context()
  if (error) return { error }
  const itemType = String(formData.get("item_type") || "Custom")
  const customTitle = String(formData.get("title") || "").trim()
  const title = customTitle || itemType
  const scheduledTime = String(formData.get("scheduled_time") || "")
  const handlerProfileId = String(formData.get("handler_profile_id") || "").trim()
  if (!title) return { error: "Item title is required." }
  const { data: handler } = handlerProfileId && handlerProfileId !== "__none__"
    ? await supabase.from("profiles").select("id, full_name").eq("id", handlerProfileId).maybeSingle()
    : { data: null }
  const { data: last } = await supabase.from("logistics_order_service_items").select("sort_order").eq("order_service_id", serviceId).order("sort_order", { ascending: false }).limit(1).maybeSingle()
  const { error: insertError } = await supabase.from("logistics_order_service_items").insert({
    order_service_id: serviceId,
    item_type: itemType,
    title,
    scheduled_time: scheduledTime || null,
    handler_profile_id: handler?.id || null,
    handler_name: handler?.full_name || null,
    sort_order: (last?.sort_order || 0) + 1
  })
  if (insertError) return { error: insertError.message }
  refresh(serviceId)
  return { success: true }
}

export async function deleteOrderServiceItem(serviceId: string, itemId: string) {
  const { supabase, error } = await context()
  if (error) return { error }
  const { error: deleteError } = await supabase.from("logistics_order_service_items").delete().eq("id", itemId).eq("order_service_id", serviceId)
  if (deleteError) return { error: deleteError.message }
  refresh(serviceId)
  return { success: true }
}

export async function updateOrderServiceItemHandler(serviceId: string, itemId: string, profileId: string) {
  const { supabase, error } = await context()
  if (error) return { error }
  const cleanProfileId = profileId === "__none__" ? "" : profileId
  const { data: handler } = cleanProfileId
    ? await supabase.from("profiles").select("id, full_name").eq("id", cleanProfileId).maybeSingle()
    : { data: null }
  if (cleanProfileId && !handler) return { error: "Select a valid member." }
  const { error: updateError } = await supabase
    .from("logistics_order_service_items")
    .update({ handler_profile_id: handler?.id || null, handler_name: handler?.full_name || null, updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("order_service_id", serviceId)
  if (updateError) return { error: updateError.message }
  refresh(serviceId)
  return { success: true }
}

export async function moveOrderServiceItem(serviceId: string, itemId: string, direction: "up" | "down") {
  const { supabase, error } = await context()
  if (error) return { error }
  const { data: items } = await supabase.from("logistics_order_service_items").select("id, sort_order").eq("order_service_id", serviceId).order("sort_order")
  const index = (items || []).findIndex((item) => item.id === itemId)
  const target = direction === "up" ? index - 1 : index + 1
  if (index < 0 || target < 0 || target >= (items || []).length) return { success: true }
  const current = items![index]
  const other = items![target]
  const temporary = Math.max(...items!.map((item) => item.sort_order), 0) + 1000
  await supabase.from("logistics_order_service_items").update({ sort_order: temporary }).eq("id", current.id)
  await supabase.from("logistics_order_service_items").update({ sort_order: current.sort_order }).eq("id", other.id)
  const { error: updateError } = await supabase.from("logistics_order_service_items").update({ sort_order: other.sort_order }).eq("id", current.id)
  if (updateError) return { error: updateError.message }
  refresh(serviceId)
  return { success: true }
}

export async function setOrderServiceStatus(id: string, status: "Draft" | "Posted" | "Cleared") {
  const { supabase, orgId, error } = await context()
  if (error || !orgId) return { error }
  const { error: updateError } = await supabase.from("logistics_order_services").update({ status, updated_at: new Date().toISOString() }).eq("id", id).eq("org_id", orgId)
  if (updateError) return { error: updateError.message }
  refresh(id)
  return { success: true }
}

export async function sendOrderServiceToSecretariat(id: string) {
  const { supabase, user, orgId, error } = await context()
  if (error || !user || !orgId) return { error }
  const { data: service } = await supabase.from("logistics_order_services").select("title, events(name, event_date)").eq("id", id).eq("org_id", orgId).maybeSingle()
  if (!service) return { error: "Order of service not found." }
  const event = Array.isArray(service.events) ? service.events[0] : service.events
  const { error: insertError } = await supabase.from("admin_office_files").insert({
    org_id: orgId,
    office_unit: "Secretaries",
    title: service.title,
    description: `Order of Service for ${event?.name || "event"} (${event?.event_date || "date not set"}).\n\nOpen ${basePath}/${id} to review the linked document.`,
    file_type: "Order of Service",
    submitted_from: "Logistics Director",
    created_by: user.id
  })
  if (insertError) return { error: insertError.message }
  await supabase
    .from("logistics_order_services")
    .update({
      sent_to_secretariat_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
  refresh(id)
  revalidatePath("/admin/office/admin-office/files", "layout")
  return { success: true }
}
