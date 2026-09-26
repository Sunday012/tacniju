import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"
import { OrderServiceManager } from "./order-service-manager"

export const dynamic = "force-dynamic"

export default async function OrderServicePage() {
  const supabase = await createClient()
  const orgId = await getAccountingOrgId()
  const [{ data: events }, { data: services, error }] = await Promise.all([supabase.from("events").select("id, name, event_date").order("event_date", { ascending: false }), supabase.from("logistics_order_services").select("id, title, status, sent_to_secretariat_at, created_at, events(name, event_date)").eq("org_id", orgId).order("created_at", { ascending: false })])
  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full">
        <Link href="/admin/office/directors/logistics/desk" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Logistics Desk
        </Link>
        <div className="mb-6 mt-6 border-b pb-6">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Logistics Director</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Order of Service</h1>
          <p className="mt-2 text-slate-500">Build an event program, send it to the Secretariat, and post it for members and anchors.</p>
        </div>
        {error ? <div className="border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">Apply migration 063 to enable Order of Service.</div> : <OrderServiceManager events={events || []} services={services || []} />}
      </div>
    </main>
  )
}
