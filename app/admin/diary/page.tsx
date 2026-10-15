import { createClient } from "@/lib/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProfileImagePreview } from "@/components/profile-image-preview"
import Link from "next/link"
import { isGuestProfile } from "@/lib/profile-kind"
import { Cake, MapPin, ArrowRight, UsersRound, Plane, Ban } from "lucide-react"

export default async function AdminDiaryPage({ searchParams }: { searchParams: { from?: string } }) {
  const supabase = await createClient()

  // Get all members for admin
  const [{ data: profiles }, { data: locations }, { data: assemblies }] = await Promise.all([
    supabase.from("profiles").select("*").order("full_name", { ascending: true }),
    supabase.from("diary_locations").select("id, name").order("name"),
    supabase.from("diary_assemblies").select("id, location_id, name").order("name"),
  ])
    
  const members = (profiles || []).filter(profile => !isGuestProfile(profile))
  const transferred = members.filter(m => m.member_status === 'Transferred')
  const terminated = members.filter(m => m.member_status === 'Terminated')
  const activeMembers = members.filter(m => !['Transferred', 'Terminated'].includes(m.member_status || ''))
  const birthdays = activeMembers
    .filter(m => m.date_of_birth)
    .map(m => ({ ...m, date: new Date(`${m.date_of_birth}T00:00:00`) }))
    .sort((a, b) => a.date.getMonth() - b.date.getMonth() || a.date.getDate() - b.date.getDate())
  const fromSecretaries = searchParams.from === "secretaries"

  const AdminMemberCard = ({ member }: { member: any }) => (
    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-start gap-4 mb-2">
            <ProfileImagePreview imageUrl={member.avatar_url} name={member.full_name} />
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-800 leading-tight">{member.full_name}</h3>
                    <Badge variant="outline" className={`
                        ${member.member_status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                        ${member.member_status === 'Transferred' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                        ${member.member_status === 'Terminated' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                    `}>
                        {member.member_status || 'Active'}
                    </Badge>
                </div>
                {member.office_position && (
                   <p className="text-sm font-semibold text-indigo-600 mt-0.5">{member.office_position}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Role: {member.member_role || 'Member'}</p>
            </div>
        </div>
        
        {(member.member_status === 'Transferred' || member.member_status === 'Terminated') && member.status_reason && (
            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs font-semibold text-slate-700 mb-1">Reason:</p>
                <p className="text-sm text-slate-600">{member.status_reason}</p>
            </div>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="text-xs">{member.department || "No Dept"}</Badge>
            {member.awards && member.awards.split(',').map((award: string, i: number) => (
                <Badge key={i} className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                    🏆 {award.trim()}
                </Badge>
            ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 md:p-10 relative">
      <main className="relative z-10 w-full">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Admin Diary View</h1>
                <p className="text-slate-500 mt-2 font-medium">Complete directory including transferred and terminated members.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/diary/locations" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-medium hover:bg-slate-50 transition-colors">
                <MapPin className="h-4 w-4" /> Locations
              </Link>
              <Link href="/admin/diary/birthdays" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-medium hover:bg-slate-50 transition-colors">
                <Cake className="h-4 w-4" /> Birthdays
              </Link>
              <Link href={fromSecretaries ? "/admin/office/secretariat/secretaries/records-reports" : "/admin"} className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-medium hover:bg-slate-50 transition-colors">
                  {fromSecretaries ? "Back to Records & Reports" : "Back to Admin"}
              </Link>
            </div>
        </div>
        
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Members", count: activeMembers.length, href: "/admin/office/members", icon: UsersRound },
            { label: "Birthdays", count: birthdays.length, href: "/admin/diary/birthdays", icon: Cake },
            { label: "Locations", count: locations?.length || 0, href: "/admin/diary/locations", icon: MapPin },
            { label: "Transferred / Terminated", count: transferred.length + terminated.length, href: "#status-history", icon: ArrowRight },
          ].map(({ label, count, href, icon: Icon }) => (
            <Link key={label} href={href} className="group flex items-center justify-between border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-indigo-300 hover:shadow-md">
              <span className="flex items-center gap-3 text-sm font-bold text-slate-700"><Icon className="h-5 w-5 text-indigo-600" />{label}</span>
              <span className="text-xl font-black text-slate-900 group-hover:text-indigo-700">{count}</span>
            </Link>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-800"><Cake className="h-5 w-5 text-rose-600" />Birthdays</h2><Link href="/admin/diary/birthdays" className="text-sm font-bold text-indigo-700">Open full list</Link></div>
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {birthdays.slice(0, 12).map(member => <div key={member.id} className="flex items-center justify-between px-5 py-3 text-sm"><span className="font-semibold text-slate-800">{member.full_name}</span><span className="text-slate-500">{member.date.toLocaleDateString("en-NG", { month: "short", day: "numeric" })}</span></div>)}
              {!birthdays.length && <p className="px-5 py-8 text-center text-sm text-slate-400">No birthdays are available.</p>}
            </div>
          </section>
          <section className="border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-800"><MapPin className="h-5 w-5 text-indigo-600" />Locations</h2><Link href="/admin/diary/locations" className="text-sm font-bold text-indigo-700">Manage locations</Link></div>
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {(locations || []).map(location => { const locationAssemblies = (assemblies || []).filter(assembly => assembly.location_id === location.id); return <div key={location.id} className="flex items-center justify-between px-5 py-3 text-sm"><span className="font-semibold text-slate-800">{location.name}</span><span className="text-slate-500">{locationAssemblies.length} assemblies</span></div> })}
              {!locations?.length && <p className="px-5 py-8 text-center text-sm text-slate-400">No locations have been added.</p>}
            </div>
          </section>
        </div>

        <div id="status-history" className="space-y-12">
            {/* Transferred Section */}
            <section className="bg-white/70 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] transition-all">
                <div className="flex items-center gap-3 mb-6 border-b border-blue-100 pb-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-sm border border-blue-100">
                    <Plane className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-800">Transferred Members</h2>
                </div>
                {transferred.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {transferred.map(m => <AdminMemberCard key={m.id} member={m} />)}
                    </div>
                ) : (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-500">
                    No transferred members found.
                    </div>
                )}
            </section>

            {/* Terminated Section */}
            <section className="bg-white/70 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] transition-all">
                <div className="flex items-center gap-3 mb-6 border-b border-red-100 pb-3">
                    <div className="p-2.5 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl shadow-sm border border-red-100">
                    <Ban className="h-5 w-5 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-800">Terminated Members</h2>
                </div>
                {terminated.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {terminated.map(m => <AdminMemberCard key={m.id} member={m} />)}
                    </div>
                ) : (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-500">
                    No terminated members found.
                    </div>
                )}
            </section>
        </div>
      </main>
    </div>
  )
}
