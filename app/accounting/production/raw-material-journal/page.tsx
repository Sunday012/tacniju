import { AccountingShell } from "@/components/accounting/accounting-shell"
import { ArrowDownToLine, ArrowUpFromLine, Save } from "lucide-react"

const entryRows = Array.from({ length: 10 }, (_, index) => index)

export default function RawMaterialJournalPage() {
  return (
    <AccountingShell title="Raw Material Journal" backHref="/accounting/production" backLabel="Production" framed={false}>
      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] backdrop-blur-3xl sm:p-7">
        <div className="mb-6 flex flex-col gap-5 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-lg border border-slate-200 bg-slate-50" />
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Raw Material Journal</h1>
              <p className="mt-1 text-sm font-bold text-slate-500">Production</p>
            </div>
          </div>

          <div className="grid w-full min-w-0 gap-3 sm:grid-cols-2 lg:max-w-[420px]">
            <label className="grid min-w-0 gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500">
              Voucher No
              <input className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-300 focus:bg-white" />
            </label>
            <label className="grid min-w-0 gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500">
              Batch No
              <input className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-300 focus:bg-white" />
            </label>
          </div>
        </div>

        <div className="mb-5 text-center">
          <h2 className="text-xl font-black text-slate-800">Raw Materials</h2>
        </div>

        <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white lg:grid-cols-2">
          <JournalSide title="Material Received / Source" icon="in" />
          <JournalSide title="Material Issued / Consumed" icon="out" />
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
          <textarea className="min-h-24 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 outline-none focus:border-indigo-300" />
        </div>

        <div className="mt-6 flex justify-end">
          <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 font-black text-white shadow-sm hover:bg-indigo-700">
            <Save className="h-4 w-4" />
            Save Raw Material Journal
          </button>
        </div>
      </div>
    </AccountingShell>
  )
}

function JournalSide({ title, icon }: { title: string; icon: "in" | "out" }) {
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
            <input className="h-11 min-w-0 px-4 text-sm font-medium text-slate-700 outline-none focus:bg-indigo-50/50" />
            <input type="number" min="0" step="0.01" className="h-11 border-l border-slate-100 px-4 text-right text-sm font-bold text-slate-700 outline-none focus:bg-indigo-50/50" />
          </div>
        ))}
      </div>
    </section>
  )
}
