"use server"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

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
