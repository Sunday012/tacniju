import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { OrderServiceDocument } from "@/components/admin/order-service-document"
import { PrintOrderButton } from "@/components/admin/print-order-button"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"

export const dynamic = "force-dynamic"

export default async function AnchorOrderPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const orgId = await getAccountingOrgId()
  const [{ data: service }, { data: items }] = await Promise.all([
    supabase.from("logistics_order_services").select("id, title, status, events(name, event_date)").eq("id", params.id).eq("org_id", orgId).maybeSingle(),
    supabase.from("logistics_order_service_items").select("id, title, item_type, scheduled_time, handler_profile_id, handler_name, sort_order").eq("order_service_id", params.id).order("sort_order"),
  ])
  if (!service) notFound()

  return (
    <main className="min-h-screen bg-slate-100 p-3 sm:p-8">
      <div className="mx-auto mb-4 flex w-full max-w-4xl items-center justify-between gap-3 print:hidden">
        <Link href="/admin/office/directors/logistics/anchor" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600">
          <ArrowLeft className="h-4 w-4" />
          Back to Anchor Unit
        </Link>
        <PrintOrderButton />
      </div>
      <OrderServiceDocument service={{ ...service, items: items || [] }} />
    </main>
  )
}
