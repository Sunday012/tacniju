import Link from "next/link"
import { ArrowLeft, UsersRound } from "lucide-react"
import { getAllAssetAssignments } from "@/app/actions/assets"
import { MembersTable } from "@/components/members-table"
import { isGuestProfile } from "@/lib/profile-kind"
import { createClient } from "@/lib/server"

const memberListContexts = {
  logistics: {
    label: "Logistics",
    href: "/admin/office/directors/logistics",
  },
  ushering: {
    label: "Ushering Desk",
    href: "/admin/office/directors/ushering/desk",
  },
  assistants: {
    label: "Assistants",
    href: "/admin/office/secretariat/assistants",
  },
  welfare: {
    label: "Welfare Desk",
    href: "/admin/office/directors/welfare/desk",
  },
} as const

export default async function OfficeMembersPage({ searchParams }: { searchParams: { from?: string } }) {
  const context = memberListContexts[searchParams.from as keyof typeof memberListContexts] || memberListContexts.logistics
  const supabase = await createClient()
  const [{ data: profiles }, { data: awards }, { assignments: gifts }] = await Promise.all([
    supabase.from("profiles").select("*").order("full_name", { ascending: true }),
    supabase.from("awards").select("*").order("created_at", { ascending: true }),
    getAllAssetAssignments(),
  ])
  const members = (profiles || []).filter((profile) => !isGuestProfile(profile) && profile.member_status !== "Transferred")

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full">
        <Link href={context.href} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700">
          <ArrowLeft className="h-4 w-4" />
          Back to {context.label}
        </Link>
        <div className="mt-6 border-b border-slate-200 pb-6">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">{context.label}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center border border-indigo-100 bg-indigo-50 text-indigo-700">
              <UsersRound className="h-5 w-5" />
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900">List of Members</h1>
          </div>
          <p className="mt-2 text-slate-500">Search, filter, and switch between the familiar table and card views.</p>
        </div>

        <section className="mt-6 overflow-hidden border border-slate-200 bg-white shadow-sm">
          <MembersTable members={members} availableAwards={awards || []} gifts={gifts || []} />
        </section>
      </div>
    </main>
  )
}
