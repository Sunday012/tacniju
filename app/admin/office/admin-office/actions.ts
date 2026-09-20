"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, orgId: null, error: "You must be signed in." }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
  if (!profile?.is_admin) return { supabase, user, orgId: null, error: "Admins only." }

  const orgId = await getAccountingOrgId()
  return { supabase, user, orgId, error: null }
}

export async function updateAdminOfficeFileStatus(id: string, status: string) {
  const allowed = ["New", "Approved", "Rejected", "Sent Back"]
  if (!allowed.includes(status)) return { error: "Invalid file status." }

  const { supabase, orgId, error } = await requireAdmin()
  if (error || !orgId) return { error }
  const { error: updateError } = await supabase
    .from("admin_office_files")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("org_id", orgId)
  if (updateError) return { error: updateError.message }

  revalidatePath("/admin/office/admin-office/files", "layout")
  return { success: true }
}

export async function saveAdminAppointment(formData: FormData) {
  const { supabase, user, orgId, error } = await requireAdmin()
  if (error || !user || !orgId) return { error }

  const id = String(formData.get("id") || "")
  const personName = String(formData.get("person_name") || "").trim()
  const officeTitle = String(formData.get("office_title") || "").trim()
  const appointedOn = String(formData.get("appointed_on") || "")
  const notes = String(formData.get("notes") || "").trim()
  if (!personName || !officeTitle || !appointedOn) return { error: "Name, office, and appointment date are required." }

  if (id) {
    const { error: updateError } = await supabase
      .from("admin_appointments")
      .update({
        person_name: personName,
        office_title: officeTitle,
        appointed_on: appointedOn,
        notes: notes || null,
        status: "Changed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("org_id", orgId)
    if (updateError) return { error: updateError.message }
  } else {
    const { error: insertError } = await supabase.from("admin_appointments").insert({
      org_id: orgId,
      person_name: personName,
      office_title: officeTitle,
      appointed_on: appointedOn,
      notes: notes || null,
      created_by: user.id,
    })
    if (insertError) return { error: insertError.message }
  }

  revalidatePath("/admin/office/admin-office/appointments")
  return { success: true }
}

export async function terminateAdminAppointment(id: string) {
  const { supabase, orgId, error } = await requireAdmin()
  if (error || !orgId) return { error }

  const { error: updateError } = await supabase
    .from("admin_appointments")
    .update({ status: "Terminated", ended_on: new Date().toISOString().slice(0, 10), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("org_id", orgId)
  if (updateError) return { error: updateError.message }

  revalidatePath("/admin/office/admin-office/appointments")
  return { success: true }
}
