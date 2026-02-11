import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { ProfileForm } from "@/components/profile-form"
import { AttendanceHistory } from "@/components/attendance-history"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

// Modern glassmorphism utility for cards
const modernCard =
  "bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl transition-shadow hover:shadow-2xl"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  // Get recent attendance
  const { data: attendance } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", user.id)
    .order("event_date", { ascending: false })
    .limit(5)

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50 py-2 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-row justify-between items-center h-auto sm:h-16 gap-4 sm:gap-0">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-400 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">My Dashboard</h1>
                <p className="text-xs text-gray-500">Church Family Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {profile?.is_admin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="rounded-full border-indigo-200 shadow">
                    Admin Portal
                  </Button>
                </Link>
              )}
              <form action={handleSignOut}>
                <Button variant="ghost" size="sm" type="submit" className="rounded-full">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Section */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row items-center md:justify-between gap-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20 border-4 border-white shadow-xl ring-2 ring-indigo-200">
                <AvatarImage src={profile?.profile_picture_url || undefined} alt={profile?.full_name || "User"} />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-2xl font-bold">
                  {getInitials(profile?.full_name || "User")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Welcome back, {profile?.full_name || "Member"}!</h1>
                <p className="text-gray-500 mt-1 text-base">Manage your profile and track your spiritual journey</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-6 md:mt-0">
              {profile?.rank && (
                <Badge
                  variant="secondary"
                  className={`px-4 py-2 text-base font-semibold rounded-full shadow-sm ${profile.rank === "A-Chosen"
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      : profile.rank === "B-Called"
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                >
                  {profile.rank}
                </Badge>
              )}
              {profile?.department && (
                <Badge variant="outline" className="px-4 py-2 text-base rounded-full border-indigo-200 shadow-sm">
                  {profile.department}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card className={modernCard}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-indigo-700">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription className="text-gray-500">Update your personal information and ministry preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm profile={profile} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <Card className={modernCard}>
              <CardHeader>
                <CardTitle className="text-lg text-indigo-700 font-semibold">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Current Rank</span>
                  <Badge
                    variant="secondary"
                    className={`rounded-full px-3 py-1 text-sm font-semibold shadow ${profile?.rank === "A-Chosen"
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        : profile?.rank === "B-Called"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-gray-100 text-gray-800 border border-gray-200"
                      }`}
                  >
                    {profile?.rank || "C-Multitude"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Department</span>
                  <span className="text-sm font-medium text-gray-700">{profile?.department || "Not assigned"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Assembly</span>
                  <span className="text-sm font-medium text-gray-700">{profile?.assembly || "Not specified"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Recent Events</span>
                  <span className="text-sm font-medium text-gray-700">{attendance?.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Attendance */}
            <Card className={modernCard}>
              <CardHeader>
                <CardTitle className="text-lg text-indigo-700 font-semibold">Recent Attendance</CardTitle>
                <CardDescription className="text-gray-500">Your latest church activities</CardDescription>
              </CardHeader>
              <CardContent>
                <AttendanceHistory attendance={attendance || []} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Subtle background blur effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] bg-indigo-100/60 rounded-full blur-3xl opacity-60" />
      </div>
    </div>
  )
}
