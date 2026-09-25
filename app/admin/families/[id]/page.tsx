import { createClient } from "@/lib/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getFamilyDetails } from "@/app/actions/families"
import { FamilyLounge } from "@/components/admin/family-lounge"

export default async function FamilyLoungePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
  if (!profile?.is_admin && user.email !== "sundayfavour997@gmail.com") redirect("/")

  const { family, members } = await getFamilyDetails(params.id)
  if (!family) notFound()

  const head = members.find(m => m.id === family.head_id) || null

  return (
    <div className="p-6 md:p-10 relative">
      <div className="relative z-10 w-full space-y-6">
        <Link
          href="/admin/families"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to families
        </Link>

        <FamilyLounge family={family} members={members} head={head} isAdmin />
      </div>
    </div>
  )
}
