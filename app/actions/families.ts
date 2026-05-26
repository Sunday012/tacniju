"use server"

import { createClient as createServerClient } from "@/lib/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

export async function getFamilies() {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("families").select("*").order("name")
  
  if (error) {
    console.error("Error fetching families:", error)
    return { families: [], error: error.message }
  }
  return { families: data, error: null }
}

export async function createFamilyAction(name: string, description: string = "", logoUrl: string = "") {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) return { success: false, error: "Server config error" }
  
  const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
  
  const { error } = await adminSupabase.from("families").insert([{
    name
  }])

  if (error) return { success: false, error: error.message }
  
  revalidatePath("/admin/families")
  return { success: true }
}

export async function deleteFamilyAction(id: string) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) return { success: false, error: "Server config error" }
  
  const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
  
  // First nullify family_id in profiles
  await adminSupabase.from("profiles").update({ family_id: null }).eq("family_id", id)
  
  const { error } = await adminSupabase.from("families").delete().eq("id", id)
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath("/admin/families")
  return { success: true }
}

export async function distributeUnassignedMembersAction() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) return { success: false, error: "Server config error" }

  const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

  const [{ data: families, error: famErr }, { data: unassigned, error: profErr }] = await Promise.all([
    adminSupabase.from("families").select("id"),
    adminSupabase.from("profiles").select("id").is("family_id", null),
  ])

  if (famErr) return { success: false, error: famErr.message }
  if (profErr) return { success: false, error: profErr.message }
  if (!families || families.length === 0) return { success: false, error: "Create at least one family first." }
  if (!unassigned || unassigned.length === 0) return { success: false, error: "No unassigned members to distribute." }

  // Shuffle members, then round-robin into families so the distribution stays even.
  const members = [...unassigned].sort(() => Math.random() - 0.5)
  const familyIds = families.map(f => f.id)

  const updates = members.map((m, idx) => ({ id: m.id, family_id: familyIds[idx % familyIds.length] }))

  // Group by target family so we can update in N queries instead of N members queries.
  const byFamily: Record<string, string[]> = {}
  for (const u of updates) {
    if (!byFamily[u.family_id]) byFamily[u.family_id] = []
    byFamily[u.family_id].push(u.id)
  }

  for (const familyId of Object.keys(byFamily)) {
    const { error } = await adminSupabase.from("profiles").update({ family_id: familyId }).in("id", byFamily[familyId])
    if (error) return { success: false, error: error.message }
  }

  revalidatePath("/admin/families")
  revalidatePath("/admin")
  return { success: true, assigned: updates.length, familiesUsed: Object.keys(byFamily).length }
}

export async function assignMemberToFamilyAction(profileId: string, familyId: string | null) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) return { success: false, error: "Server config error" }
  
  const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
  
  const { error } = await adminSupabase.from("profiles").update({ family_id: familyId }).eq("id", profileId)
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath("/admin/families")
  revalidatePath("/admin")
  return { success: true }
}
