import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { BattlesManager } from "@/components/admin/battles-manager"
import { getBattles } from "@/app/actions/battles"
import { isGuestProfile } from "@/lib/profile-kind"

export default async function BattlesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
  if (!profile?.is_admin && user.email !== "sundayfavour997@gmail.com") redirect("/")

  const { battles } = await getBattles()
  
  const [{ data: competitions }, { data: entries }] = await Promise.all([
    supabase
      .from("competitions")
      .select("id, name")
      .order("created_at", { ascending: false }),
    supabase
      .from("competition_entries")
      .select(`
        competition_id,
        profile:profiles!profile_id(id, full_name, reservation_number, avatar_url, rank, district, assembly, email)
      `)
      .order("entered_at", { ascending: false }),
  ])

  const competitionEntries = (entries || [])
    .map((entry: any) => ({
      competitionId: entry.competition_id as string,
      profile: Array.isArray(entry.profile) ? entry.profile[0] : entry.profile,
    }))
    .filter(entry => entry.profile && !isGuestProfile(entry.profile))

  return (
    <div className="p-6 md:p-10 relative">
      <div className="max-w-7xl mx-auto z-10 relative space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Head-to-Head Battles</h1>
          <p className="text-slate-600 mt-2">Create, manage, and decide winners for live match-ups.</p>
        </div>
        
        <BattlesManager battles={battles || []} competitions={competitions || []} entries={competitionEntries} />
      </div>
    </div>
  )
}
