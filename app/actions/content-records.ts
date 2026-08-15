"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { isContentRecordType, type ContentRecordType } from "@/lib/content-records"

export type ContentCategory = {
  id: string
  record_type: ContentRecordType
  parent_id: string | null
  name: string
  description: string | null
  is_active: boolean
  is_group?: boolean
  created_at: string
  parent?: Pick<ContentCategory, "id" | "name"> | null
}

export type ContentRecord = {
  id: string
  record_type: ContentRecordType
  record_date: string
  title: string
  body: string
  profile_id: string | null
  category_id: string | null
  created_at: string
  updated_at: string
  category?: ContentCategory | null
  owner?: { id: string; full_name: string | null; reservation_number: string | null } | null
}

export async function requireContentRecordType(value: string) {
  if (!isContentRecordType(value)) redirect("/admin/records")
  return value
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] || null
  return value || null
}

function normalizeContentRecord(row: any): ContentRecord {
  return {
    ...row,
    category: firstRelation<ContentCategory>(row.category),
    owner: firstRelation(row.owner),
  } as ContentRecord
}

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { supabase, user: null, error: "You must be signed in." }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.is_admin) return { supabase, user, error: "Admins only." }

  return { supabase, user, error: null }
}

export async function getContentOwners() {
  const { supabase, error } = await requireAdmin()
  if (error) return { error, owners: [] as ContentRecord["owner"][] }

  const { data, error: fetchError } = await supabase
    .from("profiles")
    .select("id, full_name, reservation_number")
    .order("full_name", { ascending: true })
    .limit(10000)

  if (fetchError) return { error: fetchError.message, owners: [] as ContentRecord["owner"][] }
  return { owners: data || [] }
}

export async function getContentCategories(recordType: ContentRecordType, includeInactive = false) {
  const supabase = await createClient()
  let query = supabase
    .from("content_record_categories")
    .select("id, record_type, parent_id, name, description, is_active, is_group, created_at, parent:content_record_categories!parent_id(id, name)")
    .eq("record_type", recordType)
    .order("name", { ascending: true })

  if (!includeInactive) query = query.eq("is_active", true)

  const { data, error } = await query
  if (error) return { error: error.message, categories: [] as ContentCategory[] }
  return {
    categories: (data || []).map((category: any) => ({
      ...category,
      parent: firstRelation(category.parent),
    })) as ContentCategory[],
  }
}

export async function getContentRecords(recordType: ContentRecordType) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error, records: [] as ContentRecord[] }

  const { data, error: fetchError } = await supabase
    .from("content_records")
    .select(`
      id,
      record_type,
      record_date,
      title,
      body,
      profile_id,
      category_id,
      created_at,
      updated_at,
      category:content_record_categories(id, record_type, parent_id, name, description, is_active, created_at),
      owner:profiles!content_records_profile_id_fkey(id, full_name, reservation_number)
    `)
    .eq("record_type", recordType)
    .order("record_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (fetchError) return { error: fetchError.message, records: [] as ContentRecord[] }
  return { records: (data || []).map(normalizeContentRecord) }
}

export async function getContentRecord(recordType: ContentRecordType, id: string) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error, record: null }

  const { data, error: fetchError } = await supabase
    .from("content_records")
    .select(`
      id,
      record_type,
      record_date,
      title,
      body,
      profile_id,
      category_id,
      created_at,
      updated_at,
      category:content_record_categories(id, record_type, parent_id, name, description, is_active, created_at),
      owner:profiles!content_records_profile_id_fkey(id, full_name, reservation_number)
    `)
    .eq("record_type", recordType)
    .eq("id", id)
    .maybeSingle()

  if (fetchError) return { error: fetchError.message, record: null }
  return { record: data ? normalizeContentRecord(data) : null }
}

export async function createContentCategory(recordType: ContentRecordType, formData: FormData) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error }

  const name = String(formData.get("name") || "").trim()
  const parentId = String(formData.get("parent_id") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const isGroup = String(formData.get("is_group") || "") === "true"
  if (!name) return { error: "Category name is required." }

  const { error: insertError } = await supabase.from("content_record_categories").insert({
    record_type: recordType,
    parent_id: parentId || null,
    name,
    description: description || null,
    is_group: isGroup,
  })

  if (insertError) return { error: insertError.message }
  revalidatePath(`/admin/records/${recordType}/category`)
  revalidatePath(`/admin/records/${recordType}/new`)
  return { success: true }
}

export async function updateContentCategoryStatus(recordType: ContentRecordType, id: string, isActive: boolean) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error }

  const { error: updateError } = await supabase
    .from("content_record_categories")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("record_type", recordType)

  if (updateError) return { error: updateError.message }
  revalidatePath(`/admin/records/${recordType}/category`)
  revalidatePath(`/admin/records/${recordType}/new`)
  return { success: true }
}

export async function updateContentCategory(recordType: ContentRecordType, id: string, formData: FormData) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error }

  const name = String(formData.get("name") || "").trim()
  const parentId = String(formData.get("parent_id") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const isGroup = String(formData.get("is_group") || "") === "true"

  if (!name) return { error: "Category name is required." }
  if (parentId === id) return { error: "A category cannot be under itself." }

  const { error: updateError } = await supabase
    .from("content_record_categories")
    .update({ name, parent_id: parentId || null, description: description || null, is_group: isGroup && !parentId })
    .eq("id", id)
    .eq("record_type", recordType)

  if (updateError) return { error: updateError.message }
  revalidatePath(`/admin/records/${recordType}/category`)
  revalidatePath(`/admin/records/${recordType}/new`)
  revalidatePath(`/admin/records/${recordType}/summary`)
  return { success: true }
}

export async function deleteContentCategory(recordType: ContentRecordType, id: string) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error }

  const { data: existingCategory, error: existingError } = await supabase
    .from("content_record_categories")
    .select("id")
    .eq("id", id)
    .eq("record_type", recordType)
    .maybeSingle()

  if (existingError) return { error: existingError.message }
  if (!existingCategory) return { error: "This category is already gone. Refresh the page to update the list." }

  const { count, error: deleteError } = await supabase
    .from("content_record_categories")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("record_type", recordType)

  if (deleteError) return { error: deleteError.message }
  if (!count) return { error: "Category was not deleted. Your database policy may not allow category deletes for this account." }

  revalidatePath(`/admin/records/${recordType}/category`)
  revalidatePath(`/admin/records/${recordType}/new`)
  revalidatePath(`/admin/records/${recordType}/summary`)
  return { success: true }
}

export async function createContentRecord(recordType: ContentRecordType, formData: FormData) {
  const { supabase, user, error } = await requireAdmin()
  if (error || !user) return { error }

  const recordDate = String(formData.get("record_date") || "").trim()
  const profileId = String(formData.get("profile_id") || "").trim()
  const categoryId = String(formData.get("category_id") || "").trim()
  const title = String(formData.get("title") || "").trim()
  const body = String(formData.get("body") || "").trim()

  if (!recordDate) return { error: "Date is required." }
  if (!title) return { error: "Title is required." }
  if (!body) return { error: "Details are required." }

  const { error: insertError } = await supabase.from("content_records").insert({
    record_type: recordType,
    record_date: recordDate,
    profile_id: profileId || null,
    category_id: categoryId || null,
    title,
    body,
    created_by: user.id,
  })

  if (insertError) return { error: insertError.message }
  revalidatePath(`/admin/records/${recordType}`)
  revalidatePath(`/admin/records/${recordType}/summary`)
  redirect(`/admin/records/${recordType}/summary`)
}

export async function updateContentRecord(recordType: ContentRecordType, id: string, formData: FormData) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error }

  const recordDate = String(formData.get("record_date") || "").trim()
  const profileId = String(formData.get("profile_id") || "").trim()
  const categoryId = String(formData.get("category_id") || "").trim()
  const title = String(formData.get("title") || "").trim()
  const body = String(formData.get("body") || "").trim()

  if (!recordDate) return { error: "Date is required." }
  if (!title) return { error: "Title is required." }
  if (!body) return { error: "Details are required." }

  const { error: updateError } = await supabase
    .from("content_records")
    .update({
      record_date: recordDate,
      profile_id: profileId || null,
      category_id: categoryId || null,
      title,
      body,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("record_type", recordType)

  if (updateError) return { error: updateError.message }
  revalidatePath(`/admin/records/${recordType}/summary`)
  redirect(`/admin/records/${recordType}/summary`)
}

export async function deleteContentRecord(recordType: ContentRecordType, id: string) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error }

  const { error: deleteError } = await supabase
    .from("content_records")
    .delete()
    .eq("id", id)
    .eq("record_type", recordType)

  if (deleteError) return { error: deleteError.message }
  revalidatePath(`/admin/records/${recordType}/summary`)
  return { success: true }
}

export async function getMyContentRecords(recordType: ContentRecordType) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data, error } = await supabase
    .from("content_records")
    .select(`
      id,
      record_type,
      record_date,
      title,
      body,
      profile_id,
      category_id,
      created_at,
      updated_at,
      category:content_record_categories(id, record_type, parent_id, name, description, is_active, created_at)
    `)
    .eq("record_type", recordType)
    .eq("profile_id", user.id)
    .order("record_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error(`Error fetching member ${recordType}:`, error)
    return { error: error.message, records: [] as ContentRecord[] }
  }

  return { records: (data || []).map(normalizeContentRecord) }
}

export async function getVisibleContentRecords(recordType: ContentRecordType) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data, error } = await supabase
    .from("content_records")
    .select(`
      id,
      record_type,
      record_date,
      title,
      body,
      profile_id,
      category_id,
      created_at,
      updated_at,
      category:content_record_categories(id, record_type, parent_id, name, description, is_active, created_at),
      owner:profiles!content_records_profile_id_fkey(id, full_name, reservation_number)
    `)
    .eq("record_type", recordType)
    .order("record_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error(`Error fetching visible ${recordType}:`, error)
    return { error: error.message, records: [] as ContentRecord[] }
  }

  return { records: (data || []).map(normalizeContentRecord) }
}

export async function getMyContentRecord(recordType: ContentRecordType, id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data, error } = await supabase
    .from("content_records")
    .select(`
      id,
      record_type,
      record_date,
      title,
      body,
      profile_id,
      category_id,
      created_at,
      updated_at,
      category:content_record_categories(id, record_type, parent_id, name, description, is_active, created_at)
    `)
    .eq("id", id)
    .eq("record_type", recordType)
    .eq("profile_id", user.id)
    .maybeSingle()

  if (error) {
    console.error(`Error fetching member ${recordType}:`, error)
    return { error: error.message, record: null }
  }

  return { record: data ? normalizeContentRecord(data) : null }
}

export async function getVisibleContentRecord(recordType: ContentRecordType, id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data, error } = await supabase
    .from("content_records")
    .select(`
      id,
      record_type,
      record_date,
      title,
      body,
      profile_id,
      category_id,
      created_at,
      updated_at,
      category:content_record_categories(id, record_type, parent_id, name, description, is_active, created_at),
      owner:profiles!content_records_profile_id_fkey(id, full_name, reservation_number)
    `)
    .eq("id", id)
    .eq("record_type", recordType)
    .maybeSingle()

  if (error) {
    console.error(`Error fetching visible ${recordType}:`, error)
    return { error: error.message, record: null }
  }

  return { record: data ? normalizeContentRecord(data) : null }
}
