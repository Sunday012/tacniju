import { AccountingShell } from "@/components/accounting/accounting-shell"
import { getItems } from "@/app/inventory/actions"
import { saveProductionJournal } from "./actions"
import { ArrowDownToLine, ArrowUpFromLine, Save } from "lucide-react"

const entryRows = Array.from({ length: 10 }, (_, index) => index)

export async function ProductionJournalPage({
  journalType,
  title,
  subtitle,
}: {
  journalType: "Production" | "Raw Material"
  title: string
  subtitle: string
}) {
  const items = await getItems()
  const innerTitle = journalType === "Raw Material" ? "Raw Materials" : "Production"
  const leftSide = journalType === "Raw Material"
    ? { title: "Material Received / Source", icon: "in" as const, prefix: "in" as const }
    : { title: "Raw Materials / Source", icon: "in" as const, prefix: "out" as const }
  const rightSide = journalType === "Raw Material"
    ? { title: "Material Issued / Consumed", icon: "out" as const, prefix: "out" as const }
    : { title: "Produced Items / Output", icon: "out" as const, prefix: "in" as const }

  return (
    <AccountingShell title={title} backHref="/accounting/production" backLabel="Production" framed={false}>
      <form action={saveProductionJournal} className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] backdrop-blur-3xl sm:p-7">
        <input type="hidden" name="journal_type" value={journalType} />
        <div className="mb-6 flex flex-col gap-5 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-lg border border-slate-200 bg-slate-50" />
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">{title}</h1>
              <p className="mt-1 text-sm font-bold text-slate-500">Production</p>
            </div>
          </div>

          <div className="grid w-full min-w-0 gap-3 sm:grid-cols-2 lg:max-w-[420px]">
            <label className="grid min-w-0 gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500">
              Voucher No
              <input name="voucher_no" className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-300 focus:bg-white" placeholder="Auto if blank" />
            </label>
            <label className="grid min-w-0 gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500">
              Batch No
              <input name="batch_no" className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-300 focus:bg-white" />
            </label>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-800">
            No production items were found for the selected assembly. Use Production Inventory to create items, or switch to the assembly where the items were created.
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="/accounting/production/inventory/items" className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-black text-white hover:bg-amber-700">
                Create Production Items
              </a>
              <a href="/select-church" className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-black text-amber-800 hover:bg-amber-100">
                Switch Assembly
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5 text-center">
              <h2 className="text-xl font-black text-slate-800">{innerTitle}</h2>
            </div>

            <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white lg:grid-cols-2">
              <JournalSide title={leftSide.title} icon={leftSide.icon} prefix={leftSide.prefix} items={items} />
              <JournalSide title={rightSide.title} icon={rightSide.icon} prefix={rightSide.prefix} items={items} />
            </div>

            <div className="grid gap-4 border-x border-b border-slate-200 bg-white p-4 lg:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-sm font-black uppercase tracking-widest text-slate-500">Total</span>
                <input className="h-9 w-32 rounded-lg border border-slate-200 bg-white px-3 text-right text-sm font-bold text-slate-700 outline-none focus:border-indigo-300" />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-sm font-black uppercase tracking-widest text-slate-500">Total</span>
                <input className="h-9 w-32 rounded-lg border border-slate-200 bg-white px-3 text-right text-sm font-bold text-slate-700 outline-none focus:border-indigo-300" />
              </div>
            </div>

            <div className="mt-5 grid gap-2">
              <label className="text-sm font-black uppercase tracking-widest text-slate-500">Narration</label>
              <textarea name="narration" className="min-h-24 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 outline-none focus:border-indigo-300" />
            </div>

            <div className="mt-6 flex justify-end">
              <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 font-black text-white shadow-sm hover:bg-indigo-700">
                <Save className="h-4 w-4" />
                Save {title}
              </button>
            </div>
          </>
        )}
      </form>
    </AccountingShell>
  )
}

function JournalSide({ title, icon, prefix, items }: { title: string; icon: "in" | "out"; prefix: "in" | "out"; items: Awaited<ReturnType<typeof getItems>> }) {
  const Icon = icon === "in" ? ArrowDownToLine : ArrowUpFromLine

  return (
    <section className="border-b border-slate-200 lg:border-b-0 lg:border-r last:lg:border-r-0">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <Icon className="h-4 w-4 text-indigo-600" />
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-600">{title}</h3>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_120px] border-b border-slate-200 bg-white text-xs font-black uppercase tracking-widest text-slate-400">
        <div className="px-4 py-3">Name of Item</div>
        <div className="border-l border-slate-200 px-4 py-3 text-right">Qty</div>
      </div>
      <div>
        {entryRows.map(row => (
          <div key={row} className="grid grid-cols-[minmax(0,1fr)_120px] border-b border-slate-100 last:border-b-0">
            <select name={`${prefix}_item_${row}`} className="h-11 min-w-0 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:bg-indigo-50/50">
              <option value="">Select item</option>
              {items.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <input name={`${prefix}_qty_${row}`} type="number" min="0" step="0.01" className="h-11 border-l border-slate-100 px-4 text-right text-sm font-bold text-slate-700 outline-none focus:bg-indigo-50/50" />
          </div>
        ))}
      </div>
    </section>
  )
}
