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
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 sm:flex-none">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-bold text-gray-900 truncate">Admin Portal</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Church Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <Link href="/dashboard" className="hidden xs:block">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard" className="xs:hidden">
                <Button variant="outline" size="sm" className="p-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </Button>
              </Link>
              <form action={handleSignOut}>
                <Button variant="ghost" size="sm" type="submit" className="text-xs sm:text-sm px-2 sm:px-3">
                  <span className="hidden xs:inline">Sign Out</span>
                  <span className="xs:hidden">Exit</span>
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