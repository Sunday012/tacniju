import Link from "next/link"
import { Building2, CalendarDays, MapPin, UsersRound } from "lucide-react"
import { createClient } from "@/lib/server"
import { isGuestProfile } from "@/lib/profile-kind"

export const dynamic = "force-dynamic"

export default async function OfficeOverviewPage() {
  const supabase = await createClient()
  const [{ data: profiles }, { data: events }, { data: locations }, { data: assemblies }] = await Promise.all([
    supabase.from("profiles").select("id, member_status, email, full_name"),
    supabase.from("events").select("id", { count: "exact" }),
    supabase.from("diary_locations").select("id", { count: "exact" }),
    supabase.from("diary_assemblies").select("id", { count: "exact" }),
  ])
  const members = (profiles || []).filter((profile) => !isGuestProfile(profile) && !["Transferred", "Terminated"].includes(profile.member_status || ""))
  const stats = [
    { label: "Active Members", value: members.length, icon: UsersRound, href: "/admin/office/members?from=assistants" },
    { label: "Events", value: events?.length || 0, icon: CalendarDays, href: "/admin/events" },
    { label: "Locations", value: locations?.length || 0, icon: MapPin, href: "/admin/diary/locations" },
    { label: "Assemblies", value: assemblies?.length || 0, icon: Building2, href: "/admin/diary/locations" },
  ]

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full">
        <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Admin Office & Secretariat</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Overview</h1>
        <p className="mt-2 text-slate-500">A shared view of the records both offices use.</p>
        <div className="mt-7 grid gap-2 sm:grid-cols-2">
          {stats.map((stat) => {
            const Icon = stat.icon
            return <Link key={stat.label} href={stat.href} className="flex items-center justify-between border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-300"><div><p className="text-xs font-black uppercase tracking-wider text-slate-500">{stat.label}</p><p className="mt-2 text-2xl font-black text-slate-900">{stat.value.toLocaleString()}</p></div><Icon className="h-5 w-5 text-indigo-600" /></Link>
          })}
        </div>
      </div>
    </main>
  )
}
