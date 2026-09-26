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

export async function updateAdminOfficeFile(id: string, title: string, description: string) {
  const { supabase, orgId, error } = await requireAdmin()
  if (error || !orgId) return { error }
  const cleanTitle = title.trim()
  if (!cleanTitle) return { error: "File title is required." }

  const { error: updateError } = await supabase
    .from("admin_office_files")
    .update({ title: cleanTitle, description: description.trim() || null, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("org_id", orgId)
  if (updateError) return { error: updateError.message }

  revalidatePath("/admin/office/admin-office/files", "layout")
  return { success: true }
}

export async function deleteAdminOfficeFile(id: string) {
  const { supabase, orgId, error } = await requireAdmin()
  if (error || !orgId) return { error }

  const { error: deleteError } = await supabase
    .from("admin_office_files")
    .delete()
    .eq("id", id)
    .eq("org_id", orgId)
  if (deleteError) return { error: deleteError.message }

  revalidatePath("/admin/office/admin-office/files", "layout")
  return { success: true }
}

export async function sendApprovedFileToHeadOffice(id: string) {
  const { supabase, orgId, error } = await requireAdmin()
  if (error || !orgId) return { error }

  const { data, error: updateError } = await supabase
    .from("admin_office_files")
    .update({ office_unit: "Head Office", status: "New", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("org_id", orgId)
    .eq("office_unit", "Secretaries")
    .eq("status", "Approved")
    .select("id")
    .maybeSingle()
  if (updateError) return { error: updateError.message }
  if (!data) return { error: "Only approved Secretariat files can be sent to Head Office." }

  revalidatePath("/admin/office/admin-office/files", "layout")
  return { success: true }
}

export async function sendProgramReportToHeadOffice(report: string) {
  const reports: Record<string, string> = {
    events: "Events Report",
    attendance: "Attendance Report",
    expenses: "Expenses Report",
    income: "Income Report",
    debtors: "Debtor's Report",
    creditors: "Creditor's Report",
  }
  const title = reports[report]
  if (!title) return { error: "Select a valid program report." }
  const { supabase, user, orgId, error } = await requireAdmin()
  if (error || !user || !orgId) return { error }
  const { error: insertError } = await supabase.from("admin_office_files").insert({
    org_id: orgId,
    office_unit: "Head Office",
    title,
    description: `Program report submitted for review. Open /accounting/programs/reports/${report} to view the live report.`,
    file_type: "Program Report",
    submitted_from: "Finance Officer",
    created_by: user.id,
  })
  if (insertError) return { error: insertError.message }
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
  if (recipient !== "Secretaries") return { error: "Directors can only send proposals to the Secretariat." }

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
  const allowedRecipients = ["Secretaries", "Finance Officer", "Head Office"]
  const allowedTypes = ["Memo", "Meeting Note", "Invitation Letter", "Received Letter", "Transport Report", "Announcement Memo", "Program Proposal"]

  if (!title || !body) return { error: "Title and memo content are required." }
  if (!allowedRecipients.includes(recipient)) return { error: "Select a valid recipient." }
  if (!allowedTypes.includes(fileType)) return { error: "Select a valid memo type." }
  if (fileType === "Announcement Memo" && (submittedFrom !== "Admin Control Unit" || recipient !== "Secretaries")) {
    return { error: "Announcement memos must be sent from Admin Control Unit to the Secretariat." }
  }
  if (fileType === "Program Proposal" && (submittedFrom !== "Secretaries" || recipient !== "Head Office")) {
    return { error: "Secretariat program proposals must be sent to Head Office." }
  }

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
  const profileId = String(formData.get("profile_id") || "").trim()
  if (!personName || !officeTitle || !appointedOn) return { error: "Name, office, and appointment date are required." }

  if (id) {
    const { error: updateError } = await supabase
      .from("admin_appointments")
      .update({
        person_name: personName,
        office_title: officeTitle,
        appointed_on: appointedOn,
        notes: notes || null,
        profile_id: profileId || null,
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
      profile_id: profileId || null,
      created_by: user.id,
    })
    if (insertError) return { error: insertError.message }
  }

  revalidatePath("/admin/office/admin-office/appointments")
  revalidatePath("/admin/office/members")
  revalidatePath("/admin/office/overview")
  return { success: true }
}

export async function deleteAdminAppointment(id: string) {
  const { supabase, orgId, error } = await requireAdmin()
  if (error || !orgId) return { error }

  const { error: deleteError } = await supabase
    .from("admin_appointments")
    .delete()
    .eq("id", id)
    .eq("org_id", orgId)
  if (deleteError) return { error: deleteError.message }

  revalidatePath("/admin/office/admin-office/appointments")
  revalidatePath("/admin/office/members")
  revalidatePath("/admin/office/overview")
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
  revalidatePath("/admin/office/members")
  revalidatePath("/admin/office/overview")
  return { success: true }
}
