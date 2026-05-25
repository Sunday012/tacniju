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
