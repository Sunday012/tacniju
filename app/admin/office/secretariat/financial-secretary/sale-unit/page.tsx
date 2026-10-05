import Link from "next/link"
import { ArrowLeft, ShoppingBag, Ticket } from "lucide-react"

import { getAdminStallOrders } from "@/app/actions/assets"
import { getAdminMealTickets } from "@/app/actions/meal-tickets"
import { getAccountingOrgId } from "@/lib/accounting-org"
import { createClient } from "@/lib/server"
import { DeleteSalesOrderButton, SalesOrderManager } from "./sales-order-manager"

export const dynamic = "force-dynamic"

type SalesOrder = {
  id: string
  order_no: string
  order_date: string
  party_name: string
  status: "Draft" | "Sent"
  total_amount: number | string
  sales_unit_order_items: Array<{ id: string; item_name: string; quantity: number | string; amount: number | string }> | null
}

function money(value: number) {
  return `NGN ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default async function SaleUnitPage() {
  const [supabase, orgId] = await Promise.all([createClient(), getAccountingOrgId()])
  const [{ data }, stallResult, ticketResult] = await Promise.all([
    supabase.from("sales_unit_orders").select("id, order_no, order_date, party_name, status, total_amount, sales_unit_order_items(id, item_name, quantity, amount)").eq("org_id", orgId).order("order_date", { ascending: false }).order("created_at", { ascending: false }),
    getAdminStallOrders(),
    getAdminMealTickets(),
  ])
  const sales = (data || []) as unknown as SalesOrder[]
  const orders = stallResult.orders || []
  const tickets = ticketResult.tickets || []

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full space-y-8">
        <div>
          <Link href="/admin/office/secretariat/financial-secretary" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700"><ArrowLeft className="h-4 w-4" />Back to Financial Secretary</Link>
          <div className="mt-8 flex flex-col gap-4 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-black uppercase tracking-widest text-indigo-600">Financial Secretary</p><h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Sales Unit</h1><p className="mt-2 text-slate-500">Sales orders, stall orders, and meal tickets in one workspace.</p></div>
            <SalesOrderManager />
          </div>
        </div>

        <div className="grid gap-px overflow-hidden border border-slate-300 bg-slate-300 sm:grid-cols-3">
          <div className="bg-white p-5"><p className="text-xs font-black uppercase tracking-widest text-slate-400">Sales Orders</p><p className="mt-2 text-2xl font-black text-slate-900">{sales.length.toLocaleString()}</p><p className="mt-1 font-mono text-sm font-bold text-slate-600">{money(sales.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0))}</p></div>
          <Link href="/admin/stalls" className="bg-white p-5 hover:bg-slate-50"><ShoppingBag className="h-5 w-5 text-amber-600" /><p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400">Stall Orders</p><p className="mt-1 text-2xl font-black text-slate-900">{orders.length.toLocaleString()}</p></Link>
          <Link href="/admin/meal-tickets" className="bg-white p-5 hover:bg-slate-50"><Ticket className="h-5 w-5 text-emerald-600" /><p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400">Meal Tickets</p><p className="mt-1 text-2xl font-black text-slate-900">{tickets.length.toLocaleString()}</p></Link>
        </div>

        <section className="border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-extrabold text-slate-900">Sales Orders</h2><p className="text-sm text-slate-500">Independent Sales Unit records. Sent orders go to the Financial Secretary.</p></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Order No.</th><th className="px-5 py-3">Party</th><th className="px-5 py-3">Items</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Amount</th><th className="w-14" /></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {sales.length === 0 ? <tr><td colSpan={7} className="px-5 py-12 text-center font-semibold text-slate-500">No Sales Unit orders have been created.</td></tr> : sales.map((sale) => <tr key={sale.id} className="odd:bg-white even:bg-slate-50/60"><td className="px-5 py-3 text-slate-600">{new Date(`${sale.order_date}T00:00:00`).toLocaleDateString("en-GB")}</td><td className="px-5 py-3 font-black">{sale.order_no}</td><td className="px-5 py-3 font-semibold text-slate-700">{sale.party_name}</td><td className="px-5 py-3 text-slate-600">{sale.sales_unit_order_items?.length || 0}</td><td className="px-5 py-3"><span className={sale.status === "Sent" ? "font-bold text-emerald-700" : "font-bold text-amber-700"}>{sale.status}</span></td><td className="px-5 py-3 text-right font-mono font-black">{money(Number(sale.total_amount || 0))}</td><td><DeleteSalesOrderButton id={sale.id} /></td></tr>)}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
