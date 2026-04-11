"use server"

import { createClient } from "@/lib/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function markAttendance(userId: string, eventId: string, eventName: string) {
    const supabase = await createClient()

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, message: "Unauthorized. Please login." }
    }

    // Check if admin
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
    if (!profile?.is_admin) {
        if (user.email !== "sundayfavour997@gmail.com") {
            return { success: false, message: "Access denied. Admins only." }
        }
    }

    // Verify Target User Exists
    const { data: targetUser, error: userError } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId.trim())
        .maybeSingle()

    if (userError || !targetUser) {
        return { success: false, message: "Invalid QR Code. User not found." }
    }

    // Check for duplicate attendance for this same event
    const today = new Date().toISOString().split("T")[0]
    const duplicateQuery = supabase
        .from("attendance")
        .select("id")
        .eq("user_id", userId)
        .eq("event_date", today)

    // Check by event_id if provided, otherwise by event_name for backwards compat
    if (eventId) {
        duplicateQuery.eq("event_id", eventId)
    } else {
        duplicateQuery.eq("event_name", eventName)
    }

    const { data: existing } = await duplicateQuery.maybeSingle()

    if (existing) {
        return { success: false, message: `${targetUser.full_name} is already marked present!` }
    }

    // Mark Attendance
    const insertPayload: Record<string, any> = {
        user_id: userId,
        event_name: eventName,
        event_date: today,
        attended: true,
    }

    if (eventId) {
        insertPayload.event_id = eventId
    }

    const { error: insertError } = await supabase
        .from("attendance")
        .insert(insertPayload)

    if (insertError) {
        console.error(insertError)
        return { success: false, message: "Failed to save attendance record." }
    }

    revalidatePath("/admin")
    revalidatePath("/dashboard")

    return { success: true, message: `${targetUser.full_name} marked PRESENT.` }
}

export async function updateMemberRankAction(memberId: string, newRank: string) {
    const supabase = await createClient()

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: "Unauthorized. Please login." }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
    if (!profile?.is_admin && user.email !== "sundayfavour997@gmail.com") {
        return { success: false, message: "Access denied. Admins only." }
    }

    // Bypass RLS to update rank reliably since the admin RLS policy has recursion blocks
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        return { success: false, message: "Server configuration error: Missing service role key." }
    }

    const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
    
    const { error } = await adminSupabase.from("profiles").update({ rank: newRank }).eq("id", memberId)
    
    if (error) {
        console.error("Failed to update rank:", error)
        return { success: false, message: "Failed to update rank in database." }
    }

    revalidatePath("/admin")
    return { success: true }
}

