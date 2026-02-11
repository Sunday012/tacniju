"use server"

import { createClient } from "@/lib/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function markAttendance(userId: string, eventName: string) {
    const supabase = await createClient()

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, message: "Unauthorized. Please login." }
    }

    // Check if admin
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
    if (!profile?.is_admin) {
        // Allow implicit admin via email fallback just in case
        if (user.email !== "sundayfavour997@gmail.com") {
            return { success: false, message: "Access denied. Admins only." }
        }
    }

    // Verify Target User Exists
    const { data: targetUser, error: userError } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle()

    if (userError || !targetUser) {
        return { success: false, message: "Invalid QR Code. User not found." }
    }

    // Check for duplicate attendance today
    const today = new Date().toISOString().split("T")[0]
    const { data: existing } = await supabase
        .from("attendance")
        .select("id")
        .eq("user_id", userId)
        .eq("event_date", today)
        .eq("event_name", eventName)
        .maybeSingle()

    if (existing) {
        return { success: false, message: `${targetUser.full_name} is already marked present!` }
    }

    // Mark Attendance
    const { error: insertError } = await supabase
        .from("attendance")
        .insert({
            user_id: userId,
            event_name: eventName,
            event_date: today,
            attended: true
        })

    if (insertError) {
        console.error(insertError)
        return { success: false, message: "Failed to save attendance record." }
    }

    revalidatePath("/admin")
    revalidatePath("/dashboard")

    return { success: true, message: `${targetUser.full_name} marked PRESENT.` }
}
