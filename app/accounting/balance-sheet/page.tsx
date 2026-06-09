import { AccountingShell } from "@/components/accounting/accounting-shell"
import { getBalanceSheetReport, ReportLine } from "../report-actions"

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
          <span className="font-semibold text-slate-800">{line.name}</span>
          <span className="text-right font-mono font-semibold text-slate-900">{money(line.amount)}</span>
        </div>
      ))}
    </div>
  )
}

export default async function BalanceSheetPage() {
  const report = await getBalanceSheetReport()

  return (
    <AccountingShell title="Balance Sheet" framed={false}>
      <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
        <div className="grid border-b border-slate-300 bg-slate-50 md:grid-cols-2">
          <div className="border-b border-slate-300 px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-700 md:border-b-0 md:border-r">Liabilities</div>
          <div className="px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-700">Assets</div>
        </div>
        <div className="grid min-h-[520px] md:grid-cols-2">
          <div className="border-b border-slate-300 md:border-b-0 md:border-r">
            <Lines lines={report.liabilities} />
            {report.difference > 0 && report.assetTotal > report.liabilityTotal ? (
              <div className="grid grid-cols-[1fr_160px] border-t border-slate-200 px-3 py-2 text-sm">
                <span className="font-semibold text-slate-800">Difference in opening balances</span>
                <span className="text-right font-mono font-semibold text-slate-900">{money(report.difference)}</span>
              </div>
            ) : null}
          </div>
          <div>
            <Lines lines={report.assets} />
            {report.difference > 0 && report.liabilityTotal > report.assetTotal ? (
              <div className="grid grid-cols-[1fr_160px] border-t border-slate-200 px-3 py-2 text-sm">
                <span className="font-semibold text-slate-800">Difference in opening balances</span>
                <span className="text-right font-mono font-semibold text-slate-900">{money(report.difference)}</span>
              </div>
            ) : null}
          </div>
        </div>
        <div className="grid border-t border-slate-300 bg-slate-50 text-sm font-black md:grid-cols-2">
          <div className="grid grid-cols-[1fr_160px] border-b border-slate-300 px-3 py-2 md:border-b-0 md:border-r">
            <span>Total</span>
            <span className="text-right font-mono">{money(Math.max(report.liabilityTotal, report.assetTotal))}</span>
          </div>
          <div className="grid grid-cols-[1fr_160px] px-3 py-2">
            <span>Total</span>
            <span className="text-right font-mono">{money(Math.max(report.liabilityTotal, report.assetTotal))}</span>
          </div>
        </div>
      </div>
    </AccountingShell>
  )
}
