import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"
import { AdminAppointmentsManager, type AdminAppointment } from "@/components/admin/admin-appointments-manager"

export const dynamic = "force-dynamic"

export default async function AdminAppointmentsPage() {
  const supabase = await createClient()
  const orgId = await getAccountingOrgId()
  const [{ data, error }, { data: members }] = await Promise.all([
    supabase
      .from("admin_appointments")
      .select("id, profile_id, person_name, office_title, appointed_on, ended_on, status, notes")
      .eq("org_id", orgId)
      .order("appointed_on", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name, reservation_number")
      .or("member_status.is.null,member_status.neq.Terminated")
      .order("full_name"),
  ])

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full space-y-6">
        <div>
          <Link href="/admin/office/admin-office/desk" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700"><ArrowLeft className="h-4 w-4" />Back to Desk</Link>
          <h1 className="mt-5 text-3xl font-extrabold text-slate-900">Appointments</h1>
          <p className="mt-2 text-slate-500">Create, change, and terminate office appointments.</p>
        </div>
        {error ? <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">Appointment storage is not ready. Apply migrations 055 and 064 in Supabase.</div> : <AdminAppointmentsManager appointments={(data || []) as AdminAppointment[]} members={members || []} />}
      </div>
    </main>
  )
}
