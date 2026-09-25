import Link from "next/link"
import { ArrowLeft, Banknote, ChevronRight, Plus, ShoppingBag, Ticket } from "lucide-react"

import { getAdminStallOrders } from "@/app/actions/assets"
import { getAdminMealTickets } from "@/app/actions/meal-tickets"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"

export const dynamic = "force-dynamic"

type SalesVoucher = {
  id: string
  voucher_no: string
  date: string
  voucher_entries: Array<{
    debit_amount: number | string | null
    credit_amount: number | string | null
    ledgers: { name?: string | null } | null
  }> | null
}

function money(value: number) {
  return `NGN ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default async function SaleUnitPage() {
  const [supabase, orgId] = await Promise.all([createClient(), getAccountingOrgId()])
  const [{ data: salesData }, stallResult, ticketResult] = await Promise.all([
    supabase.from("vouchers").select("id, voucher_no, date, voucher_entries(debit_amount, credit_amount, ledgers(name))").eq("org_id", orgId).eq("voucher_type", "Sales").order("date", { ascending: false }).limit(10),
    getAdminStallOrders(),
    getAdminMealTickets(),
  ])
  const sales = ((salesData || []) as unknown as SalesVoucher[]).map((voucher) => {
    const entries = voucher.voucher_entries || []
    const debit = entries.filter((entry) => Number(entry.debit_amount || 0) > 0)
    const credit = entries.filter((entry) => Number(entry.credit_amount || 0) > 0)
    return {
      id: voucher.id,
      voucherNo: voucher.voucher_no,
      date: voucher.date,
      party: debit.map((entry) => entry.ledgers?.name || "Party").join(", ") || "-",
      amount: Math.max(
        debit.reduce((sum, entry) => sum + Number(entry.debit_amount || 0), 0),
        credit.reduce((sum, entry) => sum + Number(entry.credit_amount || 0), 0),
      ),
    }
  })
  const orders = stallResult.orders || []
  const tickets = ticketResult.tickets || []
  const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0)
  const pendingOrders = orders.filter((order: any) => order.status === "pending").length

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full space-y-8">
        <div>
          <Link href="/admin/office/secretariat/financial-secretary" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700"><ArrowLeft className="h-4 w-4" />Back to Financial Secretary</Link>
          <div className="mt-8 flex flex-col gap-4 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-black uppercase tracking-widest text-indigo-600">Financial Secretary</p><h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Sales Unit</h1><p className="mt-2 text-slate-500">Sales vouchers, stall orders, and meal tickets in one workspace.</p></div>
            <Link href="/accounting/vouchers/sales" className="inline-flex h-11 items-center justify-center gap-2 bg-indigo-600 px-5 text-sm font-black text-white shadow-sm hover:bg-indigo-700"><Plus className="h-4 w-4" />New Sale</Link>
          </div>
        </div>

        <div className="grid gap-px overflow-hidden border border-slate-300 bg-slate-300 sm:grid-cols-3">
          <Link href="/accounting/display/sales-register" className="bg-white p-5 hover:bg-slate-50"><Banknote className="h-5 w-5 text-indigo-600" /><p className="mt-6 text-xs font-black uppercase tracking-widest text-slate-400">Recent Sales Value</p><p className="mt-1 font-mono text-2xl font-black text-slate-900">{money(totalSales)}</p><p className="mt-2 text-xs text-slate-500">Latest {sales.length} vouchers</p></Link>
          <Link href="/admin/stalls" className="bg-white p-5 hover:bg-slate-50"><ShoppingBag className="h-5 w-5 text-amber-600" /><p className="mt-6 text-xs font-black uppercase tracking-widest text-slate-400">Stall Orders</p><p className="mt-1 text-2xl font-black text-slate-900">{orders.length.toLocaleString()}</p><p className="mt-2 text-xs text-slate-500">{pendingOrders} pending approval</p></Link>
          <Link href="/admin/meal-tickets" className="bg-white p-5 hover:bg-slate-50"><Ticket className="h-5 w-5 text-emerald-600" /><p className="mt-6 text-xs font-black uppercase tracking-widest text-slate-400">Meal Tickets</p><p className="mt-1 text-2xl font-black text-slate-900">{tickets.length.toLocaleString()}</p><p className="mt-2 text-xs text-slate-500">Issued tickets</p></Link>
        </div>

        <section className="border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="font-extrabold text-slate-900">Recent Sales</h2><p className="text-sm text-slate-500">The latest sales vouchers posted by Accounts.</p></div><Link href="/accounting/display/sales-register" className="inline-flex items-center gap-1 text-sm font-bold text-indigo-700">View all <ChevronRight className="h-4 w-4" /></Link></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Voucher No.</th><th className="px-5 py-3">Party</th><th className="px-5 py-3 text-right">Amount</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {sales.length === 0 ? <tr><td colSpan={4} className="px-5 py-12 text-center font-semibold text-slate-500">No sales vouchers have been posted.</td></tr> : sales.map((sale) => <tr key={sale.id} className="odd:bg-white even:bg-slate-50/60"><td className="px-5 py-3 text-slate-600">{new Date(`${sale.date}T00:00:00`).toLocaleDateString()}</td><td className="px-5 py-3 font-black"><Link href={`/accounting/vouchers/sales?edit=${sale.id}`} className="hover:text-indigo-700">{sale.voucherNo}</Link></td><td className="px-5 py-3 font-semibold text-slate-700">{sale.party}</td><td className="px-5 py-3 text-right font-mono font-black">{money(sale.amount)}</td></tr>)}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
