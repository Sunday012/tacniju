import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { FamilyLounge } from "@/components/admin/family-lounge"

export default async function LoungePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("family_id, is_admin")
    .eq("id", user.id)
    .maybeSingle()

  // Members without a family see an empty state with admin guidance.
  if (!profile?.family_id) {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto relative z-10">
        <div className="text-center py-16 bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5">
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">Family Lounge</h1>
          <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">
            You haven't been assigned to a family yet. An admin will place you into one shortly.
          </p>
          {profile?.is_admin && (
            <Link
              href="/admin/families"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-indigo-800 hover:bg-indigo-900 text-white text-sm font-semibold transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Manage families
            </Link>
          )}
        </div>
      </div>
    )
  }

  const adminSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const [{ data: family }, { data: members }] = await Promise.all([
    adminSupabase.from("families").select("id, name, head_id").eq("id", profile.family_id).maybeSingle(),
    adminSupabase
      .from("profiles")
      .select("id, full_name, reservation_number, avatar_url, rank, department, office_position, member_role")
      .eq("family_id", profile.family_id)
      .order("full_name", { ascending: true }),
  ])

  if (!family) {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto text-center text-slate-500">
        Could not load your family. Please refresh or contact an admin.
      </div>
    )
  }

  const head = (members || []).find(m => m.id === family.head_id) || null

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto relative z-10">
      <FamilyLounge family={family} members={members || []} head={head} isAdmin={!!profile.is_admin} />
    </div>
  )
}
