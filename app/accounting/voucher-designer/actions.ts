"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/lib/server"

export type CreationTemplateScope = "accounting" | "admin" | "both"
export type CreationTemplateKind = "voucher" | "page"

export type CreationTemplateBlock = {
  id: string
  module: string
  label: string
  value: string
}

export type CreationTemplate = {
  id: string
  org_id: string
  name: string
  description: string | null
  template_kind: CreationTemplateKind
  scope: CreationTemplateScope
  icon_name: string | null
  blocks: CreationTemplateBlock[]
  active: boolean
  created_at: string
  updated_at: string
}

async function getOrgId() {
  const supabase = await createClient()
  const cookieStore = cookies()
  const orgId = cookieStore.get("active_org_id")?.value
  if (!orgId) redirect("/select-church")

  const { data: org, error } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", orgId)
    .maybeSingle()

  if (error || !org?.id) redirect("/select-church")
  return orgId
}

async function canManageTemplates() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { supabase, user: null, error: "You must be signed in." }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, department")
    .eq("id", user.id)
    .maybeSingle()

  const allowed = Boolean(profile?.is_admin || profile?.department === "Account Unit")
  return { supabase, user, error: allowed ? null : "Admins and Account Unit members only." }
}

function cleanScope(value: FormDataEntryValue | null): CreationTemplateScope {
  return value === "admin" || value === "accounting" || value === "both" ? value : "both"
}

function cleanKind(value: FormDataEntryValue | null): CreationTemplateKind {
  return value === "page" ? "page" : "voucher"
}

function cleanBlocks(value: FormDataEntryValue | null): CreationTemplateBlock[] {
  try {
    const parsed = JSON.parse(String(value || "[]"))
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((block: any) => ({
        id: String(block.id || crypto.randomUUID()),
        module: String(block.module || "text"),
        label: String(block.label || "Field"),
        value: String(block.value || ""),
      }))
      .filter(block => block.label.trim() || block.value.trim())
  } catch {
    return []
  }
}

export async function getCreationTemplates(scope: CreationTemplateScope = "accounting") {
  const supabase = await createClient()
  const orgId = await getOrgId()
  const scopes = scope === "both" ? ["both"] : [scope, "both"]

  const { data, error } = await supabase
    .from("custom_creation_templates")
    .select("id, org_id, name, description, template_kind, scope, icon_name, blocks, active, created_at, updated_at")
    .eq("org_id", orgId)
    .eq("active", true)
    .in("scope", scopes)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching creation templates:", error)
    return { error: error.message, templates: [] as CreationTemplate[] }
  }

  return { templates: (data || []) as CreationTemplate[] }
}

export async function saveCreationTemplate(formData: FormData) {
  const { supabase, user, error } = await canManageTemplates()
  if (error || !user) return { error }

  const orgId = await getOrgId()
  const id = String(formData.get("id") || "").trim()
  const name = String(formData.get("name") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const templateKind = cleanKind(formData.get("template_kind"))
  const scope = cleanScope(formData.get("scope"))
  const iconName = String(formData.get("icon_name") || "").trim()
  const blocks = cleanBlocks(formData.get("blocks"))

  if (!name) return { error: "Template name is required." }
  if (blocks.length === 0) return { error: "Add at least one module before saving." }

  const payload = {
    org_id: orgId,
    name,
    description: description || null,
    template_kind: templateKind,
    scope,
    icon_name: iconName || null,
    blocks,
    updated_at: new Date().toISOString(),
  }

  if (id) {
    const { error: updateError } = await supabase
      .from("custom_creation_templates")
      .update(payload)
      .eq("id", id)
      .eq("org_id", orgId)

    if (updateError) return { error: updateError.message }
  } else {
    const { error: insertError } = await supabase
      .from("custom_creation_templates")
      .insert({ ...payload, created_by: user.id })

    if (insertError) return { error: insertError.message }
  }

  revalidatePath("/accounting/voucher-designer")
  revalidatePath("/admin/new-creation")
  return { success: true }
}

export async function deleteCreationTemplate(id: string) {
  const { supabase, error } = await canManageTemplates()
  if (error) return { error }

  const orgId = await getOrgId()
  const { error: updateError } = await supabase
    .from("custom_creation_templates")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("org_id", orgId)

  if (updateError) return { error: updateError.message }

  revalidatePath("/accounting/voucher-designer")
  revalidatePath("/admin/new-creation")
  return { success: true }
}
