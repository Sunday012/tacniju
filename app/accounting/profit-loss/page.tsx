import { AccountingShell } from "@/components/accounting/accounting-shell"
import { getProfitLossReport, ReportLine } from "../report-actions"

function money(value: number) {
  return value ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"
}

function Lines({ lines }: { lines: ReportLine[] }) {
  return (
    <div className="divide-y divide-slate-100">
      {lines.length === 0 ? (
        <div className="grid grid-cols-[1fr_160px] px-3 py-2 text-sm text-slate-400">
          <span>No entries</span><span />
        </div>
      ) : lines.map(line => (
        <div key={line.name} className="grid grid-cols-[1fr_160px] px-3 py-2 text-sm">
          <span className={`font-semibold ${line.name.startsWith("Net ") ? "text-slate-950" : "text-slate-800"}`}>{line.name}</span>
          <span className="text-right font-mono font-semibold text-slate-900">{money(line.amount)}</span>
        </div>
      ))}
    </div>
  )
}

export default async function ProfitLossPage() {
  const report = await getProfitLossReport()

  return (
    <AccountingShell title="Profit & Loss A/c" framed={false}>
      <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
        <div className="grid border-b border-slate-300 bg-slate-50 md:grid-cols-2">
          <div className="border-b border-slate-300 px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-700 md:border-b-0 md:border-r">Particulars</div>
          <div className="px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-700">Particulars</div>
        </div>
        <div className="grid min-h-[520px] md:grid-cols-2">
          <div className="border-b border-slate-300 md:border-b-0 md:border-r">
            <Lines lines={report.left} />
          </div>
          <div>
            <Lines lines={report.right} />
          </div>
        </div>
        <div className="grid border-t border-slate-300 bg-slate-50 text-sm font-black md:grid-cols-2">
          <div className="grid grid-cols-[1fr_160px] border-b border-slate-300 px-3 py-2 md:border-b-0 md:border-r">
            <span>Total</span>
            <span className="text-right font-mono">{money(report.leftTotal)}</span>
          </div>
          <div className="grid grid-cols-[1fr_160px] px-3 py-2">
            <span>Total</span>
            <span className="text-right font-mono">{money(report.rightTotal)}</span>
          </div>
        </div>
      </div>
    </AccountingShell>
  )
}
