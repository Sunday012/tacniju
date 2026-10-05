import Link from "next/link"
import { CalendarDays } from "lucide-react"
import { OrderServiceDocument } from "@/components/admin/order-service-document"
import { PrintOrderButton } from "@/components/admin/print-order-button"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"

export const dynamic = "force-dynamic"

export default async function MemberOrderOfServicePage({ searchParams }: { searchParams?: { id?: string } }) {
  const supabase = await createClient()
  const orgId = await getAccountingOrgId()
  const { data: services } = await supabase.from("logistics_order_services").select("id, title, events(name, event_date)").eq("org_id", orgId).eq("status", "Posted").order("updated_at", { ascending: false })
  const selectedId = searchParams?.id && services?.some((service) => service.id === searchParams.id) ? searchParams.id : services?.[0]?.id
  const selected = services?.find((service) => service.id === selectedId)
  const { data: items } = selectedId ? await supabase.from("logistics_order_service_items").select("id, title, item_type, scheduled_time, sort_order").eq("order_service_id", selectedId).order("sort_order") : { data: [] }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white">Order of Service</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Posted orders available to members.</p>
        </div>
        {selected && <PrintOrderButton />}
      </header>
      {services && services.length > 1 && (
        <nav className="flex gap-2 overflow-x-auto pb-1">
          {services.map((service) => (
            <Link key={service.id} href={`/dashboard/order-of-service?id=${service.id}`} className={`whitespace-nowrap border px-4 py-2 text-sm font-bold ${service.id === selectedId ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-700"}`}>
              {service.title}
            </Link>
          ))}
        </nav>
      )}
      {selected ? (
        <OrderServiceDocument service={{ ...selected, items: items || [] }} />
      ) : (
        <div className="border border-slate-200 bg-white px-6 py-16 text-center text-slate-400 dark:border-slate-800 dark:bg-slate-950">
          <CalendarDays className="mx-auto mb-3 h-8 w-8" />
          No current order of service has been posted.
        </div>
      )}
    </div>
  )
}
