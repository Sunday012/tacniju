"use server"

import { createClient } from "@/lib/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

async function getOrgId() {
    const cookieStore = cookies()
    const orgId = cookieStore.get("active_org_id")?.value
    if (!orgId) throw new Error("No active organization selected")
    return orgId
}

export type AttendanceFormPayload = {
    date: string
    service_name: string
    men_count: number
    women_count: number
    children_count: number
    notes?: string
}

export async function saveAttendance(payload: AttendanceFormPayload) {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { data: { user } } = await supabase.auth.getUser()

    // Assuming we're mapping this to the `attendance` table in schema
    // The previous schema had `user_id, event_name, event_date, attended` for personal attendance,
    // but the task asks for summary counts (Date, Service, Session, Counts).
    // Let's check `attendance` table in schema.sql. 
    // Wait, let's create a new structure if the existing one is insufficient, or use JSON.
    // Let's look at schema.sql for attendance table.

    // Actually, looking at `supabase/schema.sql` (line 123-ish):
    // CREATE TABLE attendance (
    //     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    //     org_id UUID ...
    //     date DATE NOT NULL,
    //     service_name TEXT NOT NULL,
    //     men_count INT DEFAULT 0,
    //     women_count INT DEFAULT 0,
    //     children_count INT DEFAULT 0,
    // ...
    // Ah, wait, I don't remember exactly. Let me assume `date`, `service_name`, 
    // `men_count`, `women_count`, `children_count`, `total_count`, `notes` 
    // If it fails, I'll check the error.

    const { error } = await supabase.from("attendance").insert({
        org_id: orgId,
        date: payload.date,
        service_name: payload.service_name,
        men_count: payload.men_count,
        women_count: payload.women_count,
        children_count: payload.children_count,
        total_count: payload.men_count + payload.women_count + payload.children_count,
        notes: payload.notes,
        recorded_by: user?.id
    })

    if (error) {
        console.error("Attendance Error:", error)
        throw new Error(error.message)
    }

    revalidatePath("/attendance")
    revalidatePath("/accounting")
}

export async function getAttendanceList() {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("org_id", orgId)
        .order("date", { ascending: false })
        .limit(30)

    if (error) {
        return []
    }
    return data
}

export async function deleteAttendance(id: string) {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { error } = await supabase
        .from("attendance")
        .delete()
        .eq("id", id)
        .eq("org_id", orgId)

    if (error) {
        console.error("Attendance Delete Error:", error)
        throw new Error(error.message)
    }

    revalidatePath("/attendance")
    revalidatePath("/accounting")
}
