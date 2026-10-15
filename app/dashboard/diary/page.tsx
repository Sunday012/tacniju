import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProfileImagePreview } from "@/components/profile-image-preview"
import { isGuestProfile } from "@/lib/profile-kind"

export default async function DiaryPage() {
  const adminSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get all active members securely using admin client
  // Only selecting necessary public fields to avoid exposing sensitive data
  const [{ data: profiles }, { data: directoryLocations }, { data: directoryAssemblies }] = await Promise.all([
    adminSupabase
      .from("profiles")
      .select("id, full_name, member_role, office_position, department, awards, avatar_url, rank, district, assembly, date_of_birth, email")
      .eq("member_status", "Active")
      .order("full_name", { ascending: true }),
    adminSupabase.from("diary_locations").select("id, name").order("name"),
    adminSupabase.from("diary_assemblies").select("id, location_id, name").order("name"),
  ])
    
  const members = (profiles || []).filter(profile => !isGuestProfile(profile))
  const executives = members.filter(m => m.member_role === 'Executive')
  const workers = members.filter(m => m.member_role === 'Worker')
  const generalMembers = members.filter(m => !m.member_role || m.member_role === 'Member')
  const locations = (directoryLocations?.length
    ? directoryLocations.map(location => location.name)
    : Array.from(new Set(members.map(member => member.district?.trim()).filter(Boolean) as string[])).sort())
  const birthdays = members
    .filter(member => member.date_of_birth)
    .map(member => ({ ...member, birthday: new Date(`${member.date_of_birth}T00:00:00`) }))
    .sort((a, b) => a.birthday.getMonth() - b.birthday.getMonth() || a.birthday.getDate() - b.birthday.getDate())

  const MemberCard = ({ member }: { member: any }) => (
    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-5 flex gap-4">
        <ProfileImagePreview imageUrl={member.avatar_url} name={member.full_name} className="h-12 w-12" fallbackClassName="bg-indigo-100 text-indigo-700 font-bold" />
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800 leading-tight">{member.full_name}</h3>
          {member.office_position && (
             <p className="text-sm font-semibold text-indigo-600 mt-0.5">{member.office_position}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="text-xs">{member.department || "No Dept"}</Badge>
            {member.awards && member.awards.split(',').map((award: string, i: number) => (
                <Badge key={i} className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                    🏆 {award.trim()}
                </Badge>
            ))}
        </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto relative z-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Organization Diary</h1>
        <p className="text-slate-500 mt-2 font-medium">Directory of all active executives, workers, and members.</p>
      </div>
      
      <div className="space-y-16">
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-violet-100 pb-3">
            <div className="p-2.5 bg-violet-50 rounded-lg border border-violet-100"><span className="text-xl">📍</span></div>
            <h2 className="text-2xl font-extrabold text-slate-800">Locations</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {locations.map(locationName => {
              const districtMembers = members.filter(member => member.district?.trim() === locationName)
              const directoryLocation = directoryLocations?.find(location => location.name.trim().toLowerCase() === locationName.trim().toLowerCase())
              const assemblies = directoryLocation
                ? (directoryAssemblies || [])
                    .filter(assembly => assembly.location_id === directoryLocation.id)
                    .map(assembly => assembly.name)
                : Array.from(new Set(districtMembers.map(member => member.assembly?.trim()).filter(Boolean) as string[])).sort()
              return (
                <div key={locationName} className="border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                    <h3 className="font-extrabold text-slate-900">{locationName}</h3>
                    <p className="text-xs text-slate-500">{districtMembers.length} members</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {assemblies.map(assembly => (
                      <div key={assembly} className="flex items-center justify-between px-5 py-3 text-sm">
                        <span className="font-semibold text-slate-700">{assembly}</span>
                        <span className="text-slate-400">{districtMembers.filter(member => member.assembly?.trim() === assembly).length}</span>
                      </div>
                    ))}
                    {!assemblies.length && <p className="px-5 py-4 text-sm text-slate-400">No assemblies listed.</p>}
                  </div>
                </div>
              )
            })}
            {!locations.length && <p className="text-slate-500">No member locations have been added yet.</p>}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-rose-100 pb-3">
            <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-100"><span className="text-xl">🎂</span></div>
            <h2 className="text-2xl font-extrabold text-slate-800">Birthdays</h2>
          </div>
          <div className="overflow-x-auto border border-slate-200 bg-white">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Member</th><th className="px-5 py-3">Assembly</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {birthdays.map(member => (
                  <tr key={member.id}><td className="px-5 py-4 font-semibold text-rose-700">{member.birthday.toLocaleDateString("en-NG", { month: "long", day: "numeric" })}</td><td className="px-5 py-4 font-semibold text-slate-900">{member.full_name}</td><td className="px-5 py-4 text-slate-600">{member.assembly || "-"}</td></tr>
                ))}
                {!birthdays.length && <tr><td colSpan={3} className="px-5 py-10 text-center text-slate-400">No birthdays are available yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        {/* Executives Section */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-indigo-100 pb-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm border border-indigo-100">
              <span className="text-xl">👑</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">Executives</h2>
          </div>
          {executives.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {executives.map(m => <MemberCard key={m.id} member={m} />)}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-500">
              No executives listed yet.
            </div>
          )}
        </section>

        {/* Workers Section */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-blue-100 pb-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-sm border border-blue-100">
              <span className="text-xl">⚒️</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">Workers</h2>
          </div>
          {workers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {workers.map(m => <MemberCard key={m.id} member={m} />)}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-500">
              No workers listed yet.
            </div>
          )}
        </section>

        {/* Members Section */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-emerald-100 pb-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow-sm border border-emerald-100">
              <span className="text-xl">👥</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">Members</h2>
          </div>
          {generalMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {generalMembers.map(m => <MemberCard key={m.id} member={m} />)}
            </div>
          ) : (
             <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-500">
              No general members listed yet.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
