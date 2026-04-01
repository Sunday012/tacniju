import { createClient } from "@/lib/server"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()

  // Initialize admin client to bypass RLS and access auth.admin methods
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  )

  try {
    // Check if user is admin using normal client context
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is perfectly missing in your .env file." }, { status: 500 })
    }

    // Find auth users that don't have corresponding profiles
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      throw authError
    }

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id")

    if (profilesError) {
      throw profilesError
    }

    const profileIds = new Set(profiles.map(p => p.id))
    const orphanedUsers = authUsers.users.filter(user => !profileIds.has(user.id))

    // Delete orphaned auth users
    const deletionResults = []
    for (const orphanedUser of orphanedUsers) {
      try {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(orphanedUser.id)
        if (deleteError) {
          deletionResults.push({ id: orphanedUser.id, email: orphanedUser.email, success: false, error: deleteError.message })
        } else {
          deletionResults.push({ id: orphanedUser.id, email: orphanedUser.email, success: true })
        }
      } catch (error) {
        deletionResults.push({
          id: orphanedUser.id,
          email: orphanedUser.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = deletionResults.filter(r => r.success).length
    const failureCount = deletionResults.filter(r => !r.success).length

    return NextResponse.json({
      message: `Cleanup completed. ${successCount} orphaned users deleted, ${failureCount} failed.`,
      results: deletionResults,
      summary: {
        total: orphanedUsers.length,
        successful: successCount,
        failed: failureCount
      }
    })

  } catch (error) {
    console.error("Error cleaning up orphaned users:", error)
    return NextResponse.json(
      { error: "Failed to cleanup orphaned users" },
      { status: 500 }
    )
  }
}