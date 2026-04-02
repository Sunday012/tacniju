import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Profile {
  id: string
  rank?: string
  department?: string
  created_at: string
}

interface AttendanceRecord {
  event_name: string
  event_date: string
  attended: boolean
}

interface AdminStatsProps {
  members: Profile[]
  attendance: AttendanceRecord[]
}

export function AdminStats({ members, attendance }: AdminStatsProps) {
  const totalMembers = members.length
  const servantMembers = members.filter((m) => m.rank === "S-Servant").length
  const chosenMembers = members.filter((m) => m.rank === "A-Chosen").length
  const calledMembers = members.filter((m) => m.rank === "B-Called").length
  const multitudeMembers = members.filter((m) => m.rank === "C-Multitude" || !m.rank).length

  const departmentCounts = members.reduce(
    (acc, member) => {
      if (member.department) {
        acc[member.department] = (acc[member.department] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const recentAttendance = attendance.filter((a) => a.attended).length
  const totalEvents = attendance.length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-indigo-50 border border-indigo-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-bold text-indigo-800">Total Members</CardTitle>
          <div className="h-9 w-9 rounded-[10px] bg-white text-indigo-600 shadow-sm border border-indigo-100 flex items-center justify-center">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-indigo-950">{totalMembers}</div>
          <p className="text-xs font-medium text-indigo-600/80 mt-1">Registered youth members</p>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-bold text-amber-800">Rank Distribution</CardTitle>
          <div className="h-9 w-9 rounded-[10px] bg-white text-amber-500 shadow-sm border border-amber-100 flex items-center justify-center">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-amber-950">{servantMembers}</div>
          <p className="text-xs font-medium text-amber-700/80 mt-1">
            S-Servant: {servantMembers}, A-Chosen: {chosenMembers}, B-Called: {calledMembers}, C-Multitude: {multitudeMembers}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-purple-50 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-bold text-purple-800">Active Departments</CardTitle>
          <div className="h-9 w-9 rounded-[10px] bg-white text-purple-600 shadow-sm border border-purple-100 flex items-center justify-center">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-purple-950">{Object.keys(departmentCounts).length}</div>
          <p className="text-xs font-medium text-purple-600/80 mt-1">
            Music: {departmentCounts.Music || 0}, Ushering: {departmentCounts.Ushering || 0}, Others:{" "}
            {Object.values(departmentCounts).reduce((a, b) => a + b, 0) -
              (departmentCounts.Music || 0) -
              (departmentCounts.Ushering || 0)}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-emerald-50 border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-bold text-emerald-800">Attendance Rate</CardTitle>
          <div className="h-9 w-9 rounded-[10px] bg-white text-emerald-600 shadow-sm border border-emerald-100 flex items-center justify-center">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
            </svg>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-emerald-950">
            {totalEvents > 0 ? Math.round((recentAttendance / totalEvents) * 100) : 0}%
          </div>
          <p className="text-xs font-medium text-emerald-700/80 mt-1">
            {recentAttendance} attended out of {totalEvents} events
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
