import { createClient } from "@/lib/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProfileImagePreview } from "@/components/profile-image-preview"
import Link from "next/link"
import { isGuestProfile } from "@/lib/profile-kind"

export default async function AdminDiaryPage() {
  const supabase = await createClient()

  // Get all members for admin
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name", { ascending: true })
    
  const members = (profiles || []).filter(profile => !isGuestProfile(profile))
  const transferred = members.filter(m => m.member_status === 'Transferred')
  const terminated = members.filter(m => m.member_status === 'Terminated')

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
      <main className="max-w-7xl mx-auto z-10 relative">
        <div className="mb-8 flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Admin Diary View</h1>
                <p className="text-slate-500 mt-2 font-medium">Complete directory including transferred and terminated members.</p>
            </div>
            <Link href="/admin" className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-medium hover:bg-slate-50 transition-colors">
                Back to Admin Dashboard
            </Link>
        </div>
        
        <div className="space-y-12">
            {/* Transferred Section */}
            <section className="bg-white/70 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] transition-all">
                <div className="flex items-center gap-3 mb-6 border-b border-blue-100 pb-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-sm border border-blue-100">
                    <span className="text-xl">✈️</span>
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
                    <span className="text-xl">🛑</span>
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
