import { createClient } from "@/lib/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()

  try {
    // Check if user is admin
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

    // Find auth users that don't have corresponding profiles
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      throw authError
    }

    const { data: profiles, error: profilesError } = await supabase
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
        const { error: deleteError } = await supabase.auth.admin.deleteUser(orphanedUser.id)
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