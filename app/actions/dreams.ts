"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"

export type DreamCategory = {
  id: string
  parent_id: string | null
  name: string
  description: string | null
  is_active: boolean
  is_group?: boolean
  created_at: string
  parent?: Pick<DreamCategory, "id" | "name"> | null
}

export type DreamOwner = {
  id: string
  full_name: string | null
  reservation_number: string | null
}

export type DreamScene = {
  id: string
  dream_id: string
  category_id: string | null
  scene_order: number
  body: string
  created_at: string
  updated_at: string
  category?: DreamCategory | null
}

export type DreamRecord = {
  id: string
  dream_date: string
  title: string
  body: string
  profile_id: string
  category_id: string | null
  created_at: string
  updated_at: string
  category?: DreamCategory | null
  owner?: DreamOwner | null
  scenes?: DreamScene[]
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] || null
  return value || null
}

function normalizeDreamRecord(row: any): DreamRecord {
  return {
    ...row,
    category: firstRelation<DreamCategory>(row.category),
    owner: firstRelation<DreamOwner>(row.owner),
    scenes: Array.isArray(row.scenes)
      ? row.scenes.map((scene: any) => ({
          ...scene,
          category: firstRelation<DreamCategory>(scene.category),
        }))
      : undefined,
  } as DreamRecord
}

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, user: null, error: "You must be signed in." }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.is_admin) {
    return { supabase, user, error: "Admins only." }
  }

  return { supabase, user, error: null }
}

export async function getDreamCategories(includeInactive = false) {
  const supabase = await createClient()
  let query = supabase
    .from("dream_categories")
    .select("id, parent_id, name, description, is_active, is_group, created_at, parent:dream_categories!parent_id(id, name)")
    .order("name", { ascending: true })

  if (!includeInactive) query = query.eq("is_active", true)

  const { data, error } = await query
  if (error) {
    console.error("Error fetching dream categories:", error)
    return { error: error.message, categories: [] as DreamCategory[] }
  }

  return {
    categories: (data || []).map((category: any) => ({
      ...category,
      parent: firstRelation(category.parent),
    })) as DreamCategory[],
  }
}

export async function getDreamOwners() {
  const { supabase, error } = await requireAdmin()
  if (error) return { error, owners: [] as DreamOwner[] }

  const { data, error: fetchError } = await supabase
    .from("profiles")
    .select("id, full_name, reservation_number")
    .order("full_name", { ascending: true })
    .limit(10000)

  if (fetchError) {
    console.error("Error fetching dream owners:", fetchError)
    return { error: fetchError.message, owners: [] as DreamOwner[] }
  }

  return { owners: (data || []) as DreamOwner[] }
}

export async function getAdminDreams() {
  const { supabase, error } = await requireAdmin()
  if (error) return { error, dreams: [] as DreamRecord[] }

  const { data, error: fetchError } = await supabase
    .from("dreams")
    .select(`
      id,
      dream_date,
      title,
      body,
      profile_id,
      category_id,
      created_at,
      updated_at,
      category:dream_categories(id, parent_id, name, description, is_active, created_at),
      owner:profiles!dreams_profile_id_fkey(id, full_name, reservation_number)
    `)
    .order("dream_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (fetchError) {
    console.error("Error fetching dreams:", fetchError)
    return { error: fetchError.message, dreams: [] as DreamRecord[] }
  }

  return { dreams: (data || []).map(normalizeDreamRecord) }
}

export async function getAdminDream(id: string) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error, dream: null }

  const { data, error: fetchError } = await supabase
    .from("dreams")
    .select(`
      id,
      dream_date,
      title,
      body,
      profile_id,
      category_id,
      created_at,
      updated_at,
      category:dream_categories(id, parent_id, name, description, is_active, created_at),
      owner:profiles!dreams_profile_id_fkey(id, full_name, reservation_number)
    `)
    .eq("id", id)
    .maybeSingle()

  if (fetchError) {
    console.error("Error fetching dream:", fetchError)
    return { error: fetchError.message, dream: null }
  }

  if (!data) return { dream: null }

  const { data: scenes, error: scenesError } = await supabase
    .from("dream_scenes")
    .select("id, dream_id, category_id, scene_order, body, created_at, updated_at, category:dream_categories(id, parent_id, name, description, is_active, created_at)")
    .eq("dream_id", id)
    .order("scene_order", { ascending: true })

  if (scenesError && !scenesError.message.includes("dream_scenes")) {
    console.error("Error fetching dream scenes:", scenesError)
    return { error: scenesError.message, dream: null }
  }

  return { dream: normalizeDreamRecord({ ...data, scenes: scenes || [] }) }
}

export async function getMyDreams() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data, error } = await supabase
    .from("dreams")
    .select(`
      id,
      dream_date,
      title,
      body,
      profile_id,
      category_id,
      created_at,
      updated_at,
      category:dream_categories(id, parent_id, name, description, is_active, created_at)
    `)
    .eq("profile_id", user.id)
    .order("dream_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching member dreams:", error)
    return { error: error.message, dreams: [] as DreamRecord[] }
  }

  return { dreams: (data || []).map(normalizeDreamRecord) }
}

export async function getMyDream(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data, error } = await supabase
    .from("dreams")
    .select(`
      id,
      dream_date,
      title,
      body,
      profile_id,
      category_id,
      created_at,
      updated_at,
      category:dream_categories(id, parent_id, name, description, is_active, created_at)
    `)
    .eq("id", id)
    .eq("profile_id", user.id)
    .maybeSingle()

  if (error) {
    console.error("Error fetching member dream:", error)
    return { error: error.message, dream: null }
  }

  return { dream: data ? normalizeDreamRecord(data) : null }
}

export async function createDreamCategory(formData: FormData) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error }

  const name = String(formData.get("name") || "").trim()
  const parentId = String(formData.get("parent_id") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const isGroup = String(formData.get("is_group") || "") === "true"

  if (!name) return { error: "Category name is required." }

  const { error: insertError } = await supabase.from("dream_categories").insert({
    name,
    parent_id: parentId || null,
    description: description || null,
    is_group: isGroup,
  })

  if (insertError) {
    console.error("Error creating dream category:", insertError)
    return { error: insertError.message }
  }

  revalidatePath("/admin/records/dreams/category")
  revalidatePath("/admin/records/dreams/new")
  return { success: true }
}

export async function updateDreamCategoryStatus(id: string, isActive: boolean) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error }

  const { error: updateError } = await supabase
    .from("dream_categories")
    .update({ is_active: isActive })
    .eq("id", id)

  if (updateError) {
    console.error("Error updating dream category:", updateError)
    return { error: updateError.message }
  }

  revalidatePath("/admin/records/dreams/category")
  revalidatePath("/admin/records/dreams/new")
  return { success: true }
}

export async function updateDreamCategory(id: string, formData: FormData) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error }

  const name = String(formData.get("name") || "").trim()
  const parentId = String(formData.get("parent_id") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const isGroup = String(formData.get("is_group") || "") === "true"

  if (!name) return { error: "Category name is required." }
  if (parentId === id) return { error: "A category cannot be under itself." }

  const { error: updateError } = await supabase
    .from("dream_categories")
    .update({ name, parent_id: parentId || null, description: description || null, is_group: isGroup && !parentId })
    .eq("id", id)

  if (updateError) {
    console.error("Error updating dream category:", updateError)
    return { error: updateError.message }
  }

  revalidatePath("/admin/records/dreams/category")
  revalidatePath("/admin/records/dreams/new")
  return { success: true }
}

export async function deleteDreamCategory(id: string) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error }

  const { data: existingCategory, error: existingError } = await supabase
    .from("dream_categories")
    .select("id")
    .eq("id", id)
    .maybeSingle()

  if (existingError) {
    console.error("Error checking dream category:", existingError)
    return { error: existingError.message }
  }
  if (!existingCategory) {
    return { error: "This category is already gone. Refresh the page to update the list." }
  }

  const { count, error: deleteError } = await supabase
    .from("dream_categories")
    .delete({ count: "exact" })
    .eq("id", id)

  if (deleteError) {
    console.error("Error deleting dream category:", deleteError)
    return { error: deleteError.message }
  }
  if (!count) {
    return { error: "Dream category was not deleted because the database is missing the admin delete policy. Run scripts/049_dream_category_delete_policy.sql in Supabase." }
  }

  revalidatePath("/admin/records/dreams/category")
  revalidatePath("/admin/records/dreams/new")
  return { success: true }
}

export async function createDream(formData: FormData) {
  const { supabase, user, error } = await requireAdmin()
  if (error || !user) return { error }

  const dreamDate = String(formData.get("dream_date") || "").trim()
  const profileId = String(formData.get("profile_id") || "").trim()
  const categoryId = String(formData.get("category_id") || "").trim()
  const title = String(formData.get("title") || "").trim()
  const body = String(formData.get("body") || "").trim()

  if (!dreamDate) return { error: "Dream date is required." }
  if (!profileId) return { error: "Select the owner of this dream." }
  if (!title) return { error: "Dream title is required." }
  if (!body) return { error: "Dream details are required." }

  const { error: insertError } = await supabase.from("dreams").insert({
    dream_date: dreamDate,
    profile_id: profileId,
    category_id: categoryId || null,
    title,
    body,
    created_by: user.id,
  })

  if (insertError) {
    console.error("Error creating dream:", insertError)
    return { error: insertError.message }
  }

  revalidatePath("/admin/records/dreams")
  revalidatePath("/admin/records/dreams/summary")
  revalidatePath("/dashboard/dreams")
  redirect("/admin/records/dreams/summary")
}

export async function createDreamHeader(formData: FormData) {
  const { supabase, user, error } = await requireAdmin()
  if (error || !user) return { error }

  const dreamDate = String(formData.get("dream_date") || "").trim()
  const profileId = String(formData.get("profile_id") || "").trim()
  const title = String(formData.get("title") || "").trim()

  if (!dreamDate) return { error: "Dream date is required." }
  if (!profileId) return { error: "Select the owner of this dream." }
  if (!title) return { error: "Dream title is required." }

  const { data, error: insertError } = await supabase
    .from("dreams")
    .insert({
      dream_date: dreamDate,
      profile_id: profileId,
      category_id: null,
      title,
      body: "",
      created_by: user.id,
    })
    .select("id")
    .single()

  if (insertError || !data) {
    console.error("Error creating dream header:", insertError)
    return { error: insertError?.message || "Dream could not be created." }
  }

  revalidatePath("/admin/records/dreams")
  revalidatePath("/admin/records/dreams/summary")
  redirect(`/admin/records/dreams/${data.id}/edit`)
}

export async function saveDreamScenes(id: string, formData: FormData) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error }

  const dreamId = id.trim()
  const dreamDate = String(formData.get("dream_date") || "").trim()
  const profileId = String(formData.get("profile_id") || "").trim()
  const title = String(formData.get("title") || "").trim()
  const scenesValue = String(formData.get("scenes") || "[]")

  if (!dreamId || !dreamDate || !profileId || !title) return { error: "Complete the dream details first." }

  let parsedScenes: Array<{ category_id: string | null; body: string }> = []
  try {
    const value = JSON.parse(scenesValue)
    if (!Array.isArray(value)) throw new Error("Scenes must be a list.")
    parsedScenes = value
      .map((scene) => ({
        category_id: typeof scene?.category_id === "string" && scene.category_id ? scene.category_id : null,
        body: typeof scene?.body === "string" ? scene.body.trim() : "",
      }))
      .filter((scene) => scene.body)
  } catch {
    return { error: "The dream scenes could not be read. Please try again." }
  }

  if (!parsedScenes.length) return { error: "Add at least one dream scene." }

  const firstScene = parsedScenes[0]
  const { error: updateError } = await supabase
    .from("dreams")
    .update({
      dream_date: dreamDate,
      profile_id: profileId,
      title,
      category_id: firstScene.category_id,
      body: firstScene.body,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dreamId)

  if (updateError) return { error: updateError.message }

  const { error: deleteError } = await supabase.from("dream_scenes").delete().eq("dream_id", dreamId)
  if (deleteError) return { error: deleteError.message }

  const { error: insertError } = await supabase.from("dream_scenes").insert(
    parsedScenes.map((scene, index) => ({
      dream_id: dreamId,
      category_id: scene.category_id,
      scene_order: index + 1,
      body: scene.body,
    })),
  )
  if (insertError) return { error: insertError.message }

  revalidatePath("/admin/records/dreams")
  revalidatePath("/admin/records/dreams/summary")
  revalidatePath(`/admin/records/dreams/summary/${dreamId}`)
  revalidatePath(`/admin/records/dreams/${dreamId}/edit`)
  revalidatePath("/dashboard/dreams")
  redirect(`/admin/records/dreams/summary/${dreamId}`)
}

export async function updateDream(id: string, formData: FormData) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error }

  const dreamId = id.trim()
  const dreamDate = String(formData.get("dream_date") || "").trim()
  const profileId = String(formData.get("profile_id") || "").trim()
  const categoryId = String(formData.get("category_id") || "").trim()
  const title = String(formData.get("title") || "").trim()
  const body = String(formData.get("body") || "").trim()

  if (!dreamId) return { error: "Dream ID is required." }
  if (!dreamDate) return { error: "Dream date is required." }
  if (!profileId) return { error: "Select the owner of this dream." }
  if (!title) return { error: "Dream title is required." }
  if (!body) return { error: "Dream details are required." }

  const { error: updateError } = await supabase
    .from("dreams")
    .update({
      dream_date: dreamDate,
      profile_id: profileId,
      category_id: categoryId || null,
      title,
      body,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dreamId)

  if (updateError) {
    console.error("Error updating dream:", updateError)
    return { error: updateError.message }
  }

  revalidatePath("/admin/records/dreams")
  revalidatePath("/admin/records/dreams/summary")
  revalidatePath(`/admin/records/dreams/summary/${dreamId}`)
  revalidatePath("/dashboard/dreams")
  redirect(`/admin/records/dreams/summary/${dreamId}`)
}

export async function deleteDream(id: string) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error }

  const { error: deleteError } = await supabase.from("dreams").delete().eq("id", id)
  if (deleteError) {
    console.error("Error deleting dream:", deleteError)
    return { error: deleteError.message }
  }

  revalidatePath("/admin/records/dreams/summary")
  revalidatePath("/dashboard/dreams")
  return { success: true }
}
