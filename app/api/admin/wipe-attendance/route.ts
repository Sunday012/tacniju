import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const adminSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)

    // Using service role to delete all attendance records
    const { error, count } = await adminSupabase
      .from("member_attendance")
      .delete()
      .not("id", "is", null) // Select all
      .select('id')

    if (error) {
      console.error("Error wiping attendance:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully wiped ${count || 0} attendance records.`
    })
  } catch (error) {
    console.error("Wipe attendance endpoint error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
