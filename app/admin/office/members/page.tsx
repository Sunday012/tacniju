import Link from "next/link"
import { ArrowLeft, CalendarDays, ClipboardList, UserPlus, UsersRound } from "lucide-react"
import { getAccountingOrgId } from "@/lib/accounting-org"
import { ProfileImagePreview } from "@/components/profile-image-preview"
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

const officeTerms: Record<keyof typeof memberListContexts, string[]> = {
  logistics: ["logistic"],
  ushering: ["usher"],
  assistants: ["assistant"],
  welfare: ["welfare"],
}

function normalized(value: string | null | undefined) {
  return (value || "").trim().toLowerCase()
}

export default async function OfficeMembersPage({ searchParams }: { searchParams: { from?: string } }) {
  const context = memberListContexts[searchParams.from as keyof typeof memberListContexts] || memberListContexts.logistics
  const contextKey = (searchParams.from && searchParams.from in memberListContexts ? searchParams.from : "logistics") as keyof typeof memberListContexts
  const supabase = await createClient()
  const orgId = await getAccountingOrgId()
  const [{ data: profiles }, { data: appointments }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, reservation_number, phone, avatar_url").order("full_name", { ascending: true }),
    supabase.from("admin_appointments").select("id, profile_id, person_name, office_title, appointed_on, status").eq("org_id", orgId).neq("status", "Terminated").order("appointed_on", { ascending: false }),
  ])
  const matchingAppointments = (appointments || []).filter((appointment) => officeTerms[contextKey].some((term) => normalized(appointment.office_title).includes(term)))
  const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]))
  const profileByName = new Map((profiles || []).map((profile) => [normalized(profile.full_name), profile]))
  const roster = matchingAppointments.map((appointment) => ({ appointment, profile: (appointment.profile_id ? profileById.get(appointment.profile_id) : null) || profileByName.get(normalized(appointment.person_name)) }))

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
          <p className="mt-2 text-slate-500">Members appear here when their active appointment belongs to this office.</p>
        </div>

        <section className="mt-6 overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-extrabold text-slate-900">Appointed Members</h2>
              <p className="mt-1 text-sm text-slate-500">{roster.length} active {roster.length === 1 ? "appointment" : "appointments"} in this unit.</p>
            </div>
            <Link href="/admin/office/admin-office/appointments" className="inline-flex h-10 items-center gap-2 border border-indigo-600 bg-indigo-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-indigo-700">
              <UserPlus className="h-4 w-4" />Manage Appointments
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {roster.map(({ appointment, profile }) => (
              <article key={appointment.id} className="grid gap-4 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.7fr)_auto] sm:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <ProfileImagePreview imageUrl={profile?.avatar_url} name={profile?.full_name || appointment.person_name} />
                  <div className="min-w-0">
                    <p className="truncate font-extrabold text-slate-900">{profile?.full_name || appointment.person_name}</p>
                    <p className="mt-1 text-sm text-slate-500">{profile?.reservation_number || "No reservation number"}{profile?.phone ? ` · ${profile.phone}` : ""}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                  <span className="font-semibold">{appointment.office_title}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 sm:justify-end">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(`${appointment.appointed_on}T00:00:00`).toLocaleDateString("en-GB")}
                </div>
              </article>
            ))}
            {!roster.length && <div className="px-6 py-14 text-center"><UsersRound className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 font-bold text-slate-700">No members appointed to this unit</p><p className="mt-1 text-sm text-slate-500">Use Appointments to add members to {context.label}.</p></div>}
          </div>
        </section>
      </div>
    </main>
  )
}
