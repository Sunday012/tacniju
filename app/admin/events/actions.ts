"use server"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAdminOfficeAccess, getCurrentAccessProfile } from "@/lib/access"

export async function getEventsWithAttendance() {
    const supabase = await createClient()

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Use service role to bypass RLS
    const adminSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: events } = await adminSupabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: false })

    if (!events) return []

    // Get attendance counts from member_attendance for each event (bypasses RLS)
    const eventsWithCounts = await Promise.all(
        events.map(async (e: any) => {
            const { count } = await adminSupabase
                .from("member_attendance")
                .select("*", { count: "exact", head: true })
                .eq("event_id", e.id)
            return { ...e, attendance_count: count ?? 0 }
        })
    )

    return eventsWithCounts
}

export async function createEvent(name: string, description: string, eventDate: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: "Unauthorized" }

    const { error } = await supabase.from("events").insert({
        name,
        description,
        event_date: eventDate,
        created_by: user.id
    })

    if (error) return { success: false, message: error.message }
    revalidatePath("/admin/events")
    return { success: true }
}

export async function deleteEvent(eventId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: "Unauthorized" }

    const adminSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await adminSupabase.from("events").delete().eq("id", eventId)
    if (error) return { success: false, message: error.message }

    revalidatePath("/admin/events")
    return { success: true }
}

export async function markManualEventAttendance(eventId: string, profileId: string) {
    const { supabase, user, profile } = await getCurrentAccessProfile()
    if (!user) return { success: false, message: "Unauthorized" }

    const access = await getAdminOfficeAccess(profile)
    if (!access.canEnterAdmin) return { success: false, message: "Admin access is required." }

    const adminSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const [{ data: event }, { data: member }] = await Promise.all([
        adminSupabase.from("events").select("id, name, event_date").eq("id", eventId).maybeSingle(),
        adminSupabase.from("profiles").select("id, full_name").eq("id", profileId).maybeSingle(),
    ])
    if (!event) return { success: false, message: "Event not found." }
    if (!member) return { success: false, message: "Select a valid member." }

    const { data: existing } = await adminSupabase
        .from("member_attendance")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", profileId)
        .maybeSingle()
    if (existing) return { success: false, message: `${member.full_name || "This member"} is already marked present.` }

    const { error } = await adminSupabase.from("member_attendance").insert({
        user_id: profileId,
        event_id: event.id,
        event_name: event.name,
        event_date: event.event_date,
        attended: true,
        marked_by: user.id,
    })
    if (error) return { success: false, message: error.message }

    revalidatePath(`/admin/events/${eventId}`)
    revalidatePath("/admin/events")
    return { success: true }
}
