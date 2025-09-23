import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Check if user is authenticated and is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { updates } = await request.json()

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: "Invalid updates data" }, { status: 400 })
    }

    // Perform bulk updates
    const results = []
    for (const update of updates) {
      const { memberId, newRank } = update

      if (!memberId || !newRank) {
        continue
      }

      const { error } = await supabase.from("profiles").update({ rank: newRank }).eq("id", memberId)

      if (error) {
        results.push({ memberId, success: false, error: error.message })
      } else {
        results.push({ memberId, success: true })
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Bulk rank update error:", error)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}
