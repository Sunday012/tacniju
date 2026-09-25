import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"
import { MedicalVisitsManager, type MedicalVisit } from "./medical-visits-manager"

export const dynamic = "force-dynamic"

export default async function MedicalUnitPage() {
  const [supabase, orgId] = await Promise.all([createClient(), getAccountingOrgId()])
  const { data, error } = await supabase.from("medical_visits").select("id, patient_name, visit_date, complaint, treatment, status, notes").eq("org_id", orgId).order("visit_date", { ascending: false })

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full space-y-7">
        <div>
          <Link href="/admin/office/directors/welfare/desk" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700"><ArrowLeft className="h-4 w-4" />Back to Welfare Desk</Link>
          <p className="mt-8 text-xs font-black uppercase tracking-widest text-indigo-600">Welfare Director</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Medical Unit</h1>
          <p className="mt-2 text-slate-500">Record visits, treatment, referrals, and completed care.</p>
        </div>
        {error ? <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">Medical storage is not ready. Apply migration 061 in Supabase.</div> : <MedicalVisitsManager visits={(data || []) as MedicalVisit[]} />}
      </div>
    </main>
  )
}
