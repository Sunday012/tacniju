import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PrintButton } from "@/components/admin/print-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function EventAttendancePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
  if (!profile?.is_admin) redirect("/dashboard")

  // Fetch Event
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .maybeSingle()

  if (eventError || !event) {
    return (
      <div className="min-h-screen p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">Event Not Found</h1>
        <Link href="/admin/events"><Button className="mt-4">Back to Events</Button></Link>
      </div>
    )
  }

  // Use service role to bypass RLS — admin needs to see ALL members' attendance, not just their own
  const adminSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: attendanceRecords } = await adminSupabase
    .from("member_attendance")
    .select("*")
    .eq("event_id", params.id)
    .order("created_at", { ascending: false })

  const userIds = attendanceRecords?.map(r => r.user_id) || []
  
  let profiles: Record<string, any> = {}
  if (userIds.length > 0) {
    const { data: usersData } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds)

    if (usersData) {
      usersData.forEach(u => {
        profiles[u.id] = u
      })
    }
  }

  const records = attendanceRecords?.map(record => ({
    ...record,
    profile: profiles[record.user_id] || { full_name: "Unknown User", email: "N/A" }
  })) || []

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white p-6 sm:p-10">
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between print:hidden">
          <Link href="/admin/events">
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-800 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Events
            </Button>
          </Link>
          <PrintButton />
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 print:shadow-none print:border-none print:p-0">
          <div className="pb-6 border-b border-slate-100 mb-6 flex flex-col items-center sm:items-start text-center sm:text-left print:border-black print:mb-8">
            <h1 className="text-3xl font-bold text-slate-800">{event.name}</h1>
            <p className="text-slate-500 mt-1 uppercase tracking-widest text-sm">Attendance List • {new Date(event.event_date).toLocaleDateString()}</p>
          </div>

          <div className="space-y-4">
               {records.length === 0 ? (
                 <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl print:border-none">
                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No attendance records for this event yet.</p>
                 </div>
               ) : (
                 <Table className="print:text-sm">
                    <TableHeader className="print:border-b-2 print:border-black">
                        <TableRow className="bg-slate-50 print:bg-white">
                            <TableHead className="w-12 text-center text-slate-600 font-bold print:text-black">#</TableHead>
                            <TableHead className="text-slate-600 font-bold print:text-black">Member Name</TableHead>
                            <TableHead className="text-slate-600 font-bold print:text-black">Rank</TableHead>
                            <TableHead className="text-slate-600 font-bold print:text-black hidden sm:table-cell">Gender & Dept</TableHead>
                            <TableHead className="text-slate-600 font-bold print:text-black hidden md:table-cell">Phone</TableHead>
                            <TableHead className="text-right text-slate-600 font-bold print:text-black">Time Marked</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.map((record, index) => (
                            <TableRow key={record.id} className="hover:bg-slate-50 border-b border-slate-100 print:border-gray-300">
                                <TableCell className="text-center text-slate-500 font-medium print:text-black">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="font-semibold text-slate-800 print:text-black">
                                    {record.profile?.full_name}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="print:border-gray-400 print:text-black">{record.profile?.rank || "Member"}</Badge>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell text-slate-600 print:text-black">
                                    {record.profile?.sex && <span>{record.profile.sex.charAt(0)}</span>}
                                    {record.profile?.department && <span className="ml-2 text-xs opacity-70">({record.profile.department})</span>}
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-slate-600 print:text-black">
                                    {record.profile?.phone_number || "-"}
                                </TableCell>
                                <TableCell className="text-right text-slate-500 text-sm print:text-black">
                                    {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
               )}
          </div>
        </div>
      </div>
    </div>
  )
}
