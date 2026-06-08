import { createClient } from "@/lib/server"
import { Award, CheckCircle, Users, CalendarCheck, PlusCircle } from "lucide-react"
import { adjustMemberPoints } from "./actions"

export const dynamic = "force-dynamic"

export default async function PointsAdminPage() {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, reservation_number, department, points")
    .order("points", { ascending: false })
    .limit(25)

  const pointTypes = [
    { name: "Point Validation", icon: CheckCircle, description: "Approve, correct, and confirm point entries." },
    { name: "Work Force", icon: Users, description: "Award points for assigned camp service and labour." },
    { name: "Attendance", icon: CalendarCheck, description: "Connect points to attendance and punctuality." },
    { name: "Etc", icon: PlusCircle, description: "Reserve space for future point categories." },
  ]

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Points</h1>
              <p className="mt-1 font-medium text-slate-500">Manage point validation, workforce points, attendance points, and other point rules.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pointTypes.map(type => {
            const Icon = type.icon
            return (
              <section key={type.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-800">{type.name}</h2>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{type.description}</p>
              </section>
            )
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-800">Adjust Member Points</h2>
            <form action={adjustMemberPoints} className="mt-5 grid gap-4">
              <label className="grid gap-1.5 text-sm font-bold text-slate-600">
                Member
                <select name="profile_id" required className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white">
                  <option value="">Select member</option>
                  {(profiles || []).map(profile => (
                    <option key={profile.id} value={profile.id}>{profile.full_name || "Unnamed"} ({profile.points || 0} pts)</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-slate-600">
                Points
                <input name="points" type="number" min="1" required className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" placeholder="10" />
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-slate-600">
                Action
                <select name="mode" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white">
                  <option value="add">Add points</option>
                  <option value="remove">Remove points</option>
                </select>
              </label>
              <button className="mt-2 h-11 rounded-xl bg-indigo-600 font-black text-white shadow-sm hover:bg-indigo-700">
                Save Points
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-lg font-extrabold text-slate-800">Current Point Standings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">Reservation</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(profiles || []).map(profile => (
                    <tr key={profile.id} className="font-medium text-slate-600">
                      <td className="px-6 py-4 font-bold text-slate-800">{profile.full_name || "Unnamed"}</td>
                      <td className="px-6 py-4 font-mono">{profile.reservation_number || "-"}</td>
                      <td className="px-6 py-4">{profile.department || "-"}</td>
                      <td className="px-6 py-4 text-right font-black text-indigo-600">{profile.points || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
