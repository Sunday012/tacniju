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
    
    // Use service role to bypass RLS as the admin is acting ON BEHALF of the user
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        return { success: false, message: "Server configuration error: Missing service role key." }
    }
    const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

    const duplicateQuery = adminSupabase
        .from("member_attendance")
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

    // Mark Attendance — uses member_attendance table (individual tracking)
    const insertPayload: Record<string, any> = {
        user_id: userId,
        event_name: eventName,
        event_date: today,
        attended: true,
        marked_by: user.id,
    }

    if (eventId) {
        insertPayload.event_id = eventId
    }

    const { error: insertError } = await adminSupabase
        .from("member_attendance")
        .insert(insertPayload)

    if (insertError) {
        console.error("Attendance Insert Error:", insertError)
        return { success: false, message: "Failed to save attendance record: " + insertError.message }
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

export async function generateReservationNumberAction(memberId: string) {
    const supabase = await createClient()

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: "Unauthorized. Please login." }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
    if (!profile?.is_admin && user.email !== "sundayfavour997@gmail.com") {
        return { success: false, message: "Access denied. Admins only." }
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) return { success: false, message: "Server configuration error." }
    const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

    // Check if the user already has one
    const { data: memberData } = await adminSupabase.from("profiles").select("reservation_number").eq("id", memberId).single()
    if (memberData?.reservation_number) {
        return { success: false, message: "Member already has a reservation number." }
    }

    // Get max reservation number
    const { data: allProfiles } = await adminSupabase.from("profiles").select("reservation_number").not("reservation_number", "is", null)
    let maxNum = 1044 // start from 1045
    if (allProfiles) {
        for (const p of allProfiles) {
            const num = parseInt(p.reservation_number, 10)
            if (!isNaN(num) && num > maxNum) {
                maxNum = num
            }
        }
    }

    const newNum = String(maxNum + 1)
    
    const { error } = await adminSupabase.from("profiles").update({ reservation_number: newNum }).eq("id", memberId)
    if (error) {
        return { success: false, message: "Failed to update reservation number." }
    }

    revalidatePath("/admin")
    revalidatePath("/admin/reservations")
    return { success: true, message: `Assigned number ${newNum}` }
}

export async function bulkGenerateReservationNumbersAction() {
    const supabase = await createClient()

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: "Unauthorized. Please login." }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
    if (!profile?.is_admin && user.email !== "sundayfavour997@gmail.com") {
        return { success: false, message: "Access denied. Admins only." }
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) return { success: false, message: "Server configuration error." }
    const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

    // Get members missing a number
    const { data: missingProfiles } = await adminSupabase.from("profiles").select("id").or("reservation_number.is.null,reservation_number.eq.")
    if (!missingProfiles || missingProfiles.length === 0) {
        return { success: true, message: "All members already have a reservation number." }
    }

    // Get max reservation number
    const { data: allProfiles } = await adminSupabase.from("profiles").select("reservation_number").not("reservation_number", "is", null).not("reservation_number", "eq", "")
    let maxNum = 1044
    if (allProfiles) {
        for (const p of allProfiles) {
            if (p.reservation_number) {
                const num = parseInt(p.reservation_number, 10)
                if (!isNaN(num) && num > maxNum) {
                    maxNum = num
                }
            }
        }
    }

    let count = 0
    for (const p of missingProfiles) {
        maxNum++
        const newNum = String(maxNum)
        await adminSupabase.from("profiles").update({ reservation_number: newNum }).eq("id", p.id)
        count++
    }

    revalidatePath("/admin")
    revalidatePath("/admin/reservations")
    return { success: true, message: `Assigned reservation numbers to ${count} members.` }
}

export async function deleteReservationNumberAction(memberId: string) {
    const supabase = await createClient()

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: "Unauthorized. Please login." }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
    if (!profile?.is_admin && user.email !== "sundayfavour997@gmail.com") {
        return { success: false, message: "Access denied. Admins only." }
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) return { success: false, message: "Server configuration error." }
    const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

    const { error } = await adminSupabase.from("profiles").update({ reservation_number: null }).eq("id", memberId)
    
    if (error) {
        console.error("Failed to delete reservation number:", error)
        return { success: false, message: "Failed to delete reservation number." }
    }

    revalidatePath("/admin")
    revalidatePath("/admin/reservations")
    return { success: true, message: "Reservation number deleted." }
}
export async function giveMemberPointsAction(memberId: string, amount: number) {
    const supabase = await createClient()

    // Verify Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: "Unauthorized. Please login." }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
    if (!profile?.is_admin && user.email !== "sundayfavour997@gmail.com") {
        return { success: false, message: "Access denied. Admins only." }
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) return { success: false, message: "Server configuration error." }
    const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

    // Get current points
    const { data: memberProfile } = await adminSupabase.from("profiles").select("points").eq("id", memberId).single()
    const currentPoints = memberProfile?.points || 0
    const newPoints = currentPoints + amount

    const { error } = await adminSupabase.from("profiles").update({ points: newPoints }).eq("id", memberId)
    
    if (error) {
        console.error("Failed to give points:", error)
        return { success: false, message: "Failed to update points." }
    }

    revalidatePath("/admin")
    revalidatePath("/dashboard")
    return { success: true, message: `Successfully gave ${amount} points!` }
}
