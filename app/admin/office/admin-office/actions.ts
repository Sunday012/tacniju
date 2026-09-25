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

export async function submitDirectorProgramProposal(formData: FormData) {
  const { supabase, user, orgId, error } = await requireAdmin()
  if (error || !user || !orgId) return { error }

  const director = String(formData.get("director") || "").trim()
  const title = String(formData.get("title") || "").trim()
  const eventName = String(formData.get("event_name") || "").trim()
  const memo = String(formData.get("memo") || "").trim()
  const recipient = String(formData.get("recipient") || "Secretaries").trim()
  if (!director || !title || !eventName || !memo) return { error: "Director, title, event, and memo are required." }
  if (!["Secretaries", "Finance Officer"].includes(recipient)) return { error: "Select a valid recipient." }

  const { error: insertError } = await supabase.from("admin_office_files").insert({
    org_id: orgId,
    office_unit: recipient,
    title,
    description: `Event: ${eventName}\n\n${memo}`,
    file_type: "Program Proposal",
    submitted_from: `${director} Director`,
    created_by: user.id,
  })
  if (insertError) return { error: insertError.message }

  revalidatePath("/admin/office/admin-office/files", "layout")
  revalidatePath("/admin/office/secretariat/secretaries/desk")
  revalidatePath("/admin/office/secretariat/financial-secretary/finance-officer")
  return { success: true }
}

export async function submitAdminOfficeMemo(formData: FormData) {
  const { supabase, user, orgId, error } = await requireAdmin()
  if (error || !user || !orgId) return { error }

  const title = String(formData.get("title") || "").trim()
  const subject = String(formData.get("subject") || "").trim()
  const body = String(formData.get("body") || "").trim()
  const fileType = String(formData.get("file_type") || "Memo").trim()
  const submittedFrom = String(formData.get("submitted_from") || "Secretaries").trim()
  const recipient = String(formData.get("recipient") || "Secretaries").trim()
  const allowedRecipients = ["Secretaries", "Finance Officer"]
  const allowedTypes = ["Memo", "Meeting Note", "Invitation Letter", "Received Letter", "Transport Report"]

  if (!title || !body) return { error: "Title and memo content are required." }
  if (!allowedRecipients.includes(recipient)) return { error: "Select a valid recipient." }
  if (!allowedTypes.includes(fileType)) return { error: "Select a valid memo type." }

  const description = [subject ? `Subject: ${subject}` : "", body].filter(Boolean).join("\n\n")
  const { error: insertError } = await supabase.from("admin_office_files").insert({
    org_id: orgId,
    office_unit: recipient,
    title,
    description,
    file_type: fileType,
    submitted_from: submittedFrom || "Admin Office",
    created_by: user.id,
  })
  if (insertError) return { error: insertError.message }

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
