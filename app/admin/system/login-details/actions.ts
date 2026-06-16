"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export async function saveLoginDetails(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized." }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
  if (!profile?.is_admin && user.email !== "sundayfavour997@gmail.com") {
    return { error: "Access denied." }
  }

  const profileId = String(formData.get("profile_id") || "").trim()
  const username = String(formData.get("username") || "").trim()
  const password = String(formData.get("password_text") || "").trim()

  if (!profileId) return { error: "Member is required." }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) return { error: "Server configuration error." }

  const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
  const { error } = await adminSupabase
    .from("login_details")
    .upsert({
      profile_id: profileId,
      username: username || null,
      password_text: password || null,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: "profile_id" })

  if (error) {
    console.error("Failed to save login details", error)
    return { error: error.message.includes("login_details") ? "Run scripts/036_create_login_details.sql first." : "Failed to save login details." }
  }

  revalidatePath("/admin/system/login-details")
  return { success: true }
}
