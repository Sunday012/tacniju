"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"

const path = "/admin/office/directors/welfare/desk/medical-unit"

async function context() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, orgId: null, error: "You must be signed in." }
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
  if (!profile?.is_admin) return { supabase, user, orgId: null, error: "Admins only." }
  return { supabase, user, orgId: await getAccountingOrgId(), error: null }
}

export async function saveMedicalVisit(formData: FormData) {
  const { supabase, user, orgId, error } = await context()
  if (error || !user || !orgId) return { error }
  const id = String(formData.get("id") || "")
  const payload = {
    patient_name: String(formData.get("patient_name") || "").trim(),
    visit_date: String(formData.get("visit_date") || ""),
    complaint: String(formData.get("complaint") || "").trim(),
    treatment: String(formData.get("treatment") || "").trim() || null,
    status: String(formData.get("status") || "Open"),
    notes: String(formData.get("notes") || "").trim() || null,
    updated_at: new Date().toISOString(),
  }
  if (!payload.patient_name || !payload.visit_date || !payload.complaint) return { error: "Patient, date, and complaint are required." }

  const result = id
    ? await supabase.from("medical_visits").update(payload).eq("id", id).eq("org_id", orgId)
    : await supabase.from("medical_visits").insert({ ...payload, org_id: orgId, created_by: user.id })
  if (result.error) return { error: result.error.message }
  revalidatePath(path)
  return { success: true }
}

export async function deleteMedicalVisit(id: string) {
  const { supabase, orgId, error } = await context()
  if (error || !orgId) return { error }
  const result = await supabase.from("medical_visits").delete().eq("id", id).eq("org_id", orgId)
  if (result.error) return { error: result.error.message }
  revalidatePath(path)
  return { success: true }
}
