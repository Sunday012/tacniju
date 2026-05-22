import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { BattlesManager } from "@/components/admin/battles-manager"
import { getBattles } from "@/app/actions/battles"

export default async function BattlesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
  if (!profile?.is_admin && user.email !== "sundayfavour997@gmail.com") redirect("/")

  const { battles } = await getBattles()
  
  // Fetch profiles for pairing
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, reservation_number, avatar_url")
    .order("full_name")

  return (
    <div className="p-6 md:p-10 relative">
      <div className="max-w-7xl mx-auto z-10 relative space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Head-to-Head Battles</h1>
          <p className="text-slate-600 mt-2">Create, manage, and decide winners for live match-ups.</p>
        </div>
        
        <BattlesManager battles={battles || []} profiles={profiles || []} />
      </div>
    </div>
  )
}
