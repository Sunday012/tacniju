import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"
import { OrderServiceBuilder } from "./order-service-builder"

export const dynamic = "force-dynamic"
export default async function OrderServiceDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const orgId = await getAccountingOrgId()
  const [{ data: service, error }, { data: items }] = await Promise.all([supabase.from("logistics_order_services").select("id, title, status, sent_to_secretariat_at, events(name, event_date)").eq("id", params.id).eq("org_id", orgId).maybeSingle(), supabase.from("logistics_order_service_items").select("id, title, item_type, scheduled_time, sort_order").eq("order_service_id", params.id).order("sort_order")])
  if (error || !service) notFound()
  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full">
        <Link href="/admin/office/directors/logistics/order-of-service" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <OrderServiceBuilder service={{ ...service, items: items || [] }} />
      </div>
    </main>
  )
}
