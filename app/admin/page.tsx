/*
================================================================================
FILE 1: ADMIN PAGE COMPONENT
================================================================================

📁 FILE LOCATION: /app/admin/page.tsx (or wherever your admin page is)
🎯 WHAT THIS REPLACES: Your existing AdminPage component
📋 COPY INSTRUCTIONS: Replace your entire admin page.tsx file with this code

This is your SERVER COMPONENT (no changes needed to your original admin page logic)
================================================================================
*/

import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { MembersTable } from "@/components/members-table"
import { AdminStats } from "@/components/admin-stats"
import { AdminCleanup } from "@/components/admin-cleanup"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/admin-login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()

  if (!profile?.is_admin) {
    redirect("/dashboard")
  }

  // Get all members
  const { data: members } = await supabase.from("profiles").select("*")
  console.log("users", members)

  // Get attendance stats
  const { data: attendanceStats } = await supabase
    .from("attendance")
    .select("event_name, event_date, attended")
    .order("event_date", { ascending: false })

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-gray-900 leading-none">Admin Portal</h1>
                <p className="text-xs text-gray-500 mt-0.5">Church Management</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/admin/scanner">
                <Button variant="ghost" size="sm" className="h-9 px-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <span className="hidden sm:inline ml-2">Scanner</span>
                </Button>
              </Link>

              <Link href="/tac-book">
                <Button variant="ghost" size="sm" className="h-9 px-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="hidden sm:inline ml-2">Tac-Book</span>
                </Button>
              </Link>

              <div className="h-6 w-px bg-gray-200 mx-1"></div>

              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full text-gray-500 hover:text-gray-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </Button>
              </Link>

              <form action={handleSignOut}>
                <Button variant="ghost" size="sm" type="submit" className="h-9 w-9 p-0 rounded-full text-gray-500 hover:text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Church Administration</h1>
          <p className="text-gray-600 mt-1">Manage members, track attendance, and oversee youth activities</p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <AdminStats members={members || []} attendance={attendanceStats || []} />
        </div>

        {/* System Cleanup */}
        <div className="mb-8">
          <AdminCleanup />
        </div>

        {/* Members Management */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>Members Management</span>
            </CardTitle>
            <CardDescription>View and manage all church youth members</CardDescription>
          </CardHeader>
          <CardContent>
            <MembersTable members={members || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}