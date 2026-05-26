"use server"

import { createClient as createServerClient } from "@/lib/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

export async function getBattles() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("battles")
    .select(`
      *,
      player1:profiles!participant1_id(full_name, reservation_number, avatar_url),
      player2:profiles!participant2_id(full_name, reservation_number, avatar_url)
    `)
    .order("created_at", { ascending: false })
  
  if (error) {
    console.error("Error fetching battles:", error)
    return { battles: [], error: error.message }
  }
  return { battles: data, error: null }
}

export async function getActiveBattles() {
  // Use service role so the profile joins resolve for non-admin dashboard viewers
  // (regular RLS would block other users' profile rows and leave player1/player2 null).
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) return { battles: [], error: "Server config error" }

  const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
  const { data, error } = await adminSupabase
    .from("battles")
    .select(`
      *,
      player1:profiles!participant1_id(full_name, reservation_number, avatar_url),
      player2:profiles!participant2_id(full_name, reservation_number, avatar_url)
    `)
    .eq("status", "live")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching active battles:", error)
    return { battles: [], error: error.message }
  }
  return { battles: data, error: null }
}

export async function createBattleAction(title: string, player1Id: string, player2Id: string, category: string = "General") {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) return { success: false, error: "Server config error" }
  
  const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
  
  const { error } = await adminSupabase.from("battles").insert([{
    title,
    participant1_id: player1Id,
    participant2_id: player2Id,
    status: 'live'
  }])

  if (error) return { success: false, error: error.message }
  
  revalidatePath("/admin/battles")
  revalidatePath("/dashboard") // top news update
  return { success: true }
}

export async function updateBattleAction(id: string, updates: any) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) return { success: false, error: "Server config error" }
  
  const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
  
  const { error } = await adminSupabase.from("battles").update(updates).eq("id", id)
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath("/admin/battles")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteBattleAction(id: string) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) return { success: false, error: "Server config error" }
  
  const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
  
  const { error } = await adminSupabase.from("battles").delete().eq("id", id)
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath("/admin/battles")
  revalidatePath("/dashboard")
  return { success: true }
}
