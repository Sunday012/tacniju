"use server"

import { revalidatePath } from "next/cache"
import { getCurrentAccessProfile, isMainAdmin } from "@/lib/access"

export async function adjustMemberPoints(formData: FormData) {
  const { supabase, user, profile } = await getCurrentAccessProfile()
  if (!user || !isMainAdmin(profile)) return

  const profileId = String(formData.get("profile_id") || "").trim()
  const points = Number(formData.get("points") || 0)
  const mode = String(formData.get("mode") || "add")

  if (!profileId) return
  if (!Number.isFinite(points) || points <= 0) return

  const { data: member, error: fetchError } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", profileId)
    .maybeSingle()

  if (fetchError || !member) {
    console.error("Failed to fetch member for point adjustment", fetchError)
    return
  }

  const current = Number(member.points || 0)
  const nextPoints = mode === "remove" ? Math.max(0, current - points) : current + points
  const { error } = await supabase
    .from("profiles")
    .update({ points: nextPoints })
    .eq("id", profileId)

  if (error) {
    console.error("Failed to adjust points", error)
    return
  }
  revalidatePath("/admin/points")
  revalidatePath("/dashboard")
}
