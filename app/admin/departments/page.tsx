import { Users } from "lucide-react"
import { createClient } from "@/lib/server"

export const dynamic = "force-dynamic"

export default async function AdminDepartmentsPage() {
  const supabase = await createClient()
  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, department, member_role, office_position")
    .not("department", "is", null)
    .order("department", { ascending: true })
    .order("full_name", { ascending: true })

  const groups = new Map<string, typeof members>()
  for (const member of members || []) {
    const department = member.department || "No Department"
    groups.set(department, [...(groups.get(department) || []), member])
  }

  return (
    <main className="mx-auto w-full max-w-[1600px] flex-1 p-5 sm:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Departments</h1>
        <p className="mt-2 font-medium text-slate-500">Members grouped by department for operations planning.</p>
      </div>

      <section className="space-y-5">
        {Array.from(groups.entries()).length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">No department members found.</div>
        ) : Array.from(groups.entries()).map(([department, rows]) => (
          <div key={department} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
              <h2 className="font-black text-slate-900">{department}</h2>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-black text-indigo-700">{rows?.length || 0}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {(rows || []).map(member => (
                <article key={member.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-slate-900">{member.full_name || "Unnamed Member"}</h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{member.office_position || member.member_role || "Member"}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}
