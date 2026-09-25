import { PrintButton } from "@/components/ui/print-button"

export function ReportSheet({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden border border-slate-300 bg-white shadow-sm print:border-black print:shadow-none">
      <header className="flex flex-col gap-3 border-b-2 border-slate-800 px-5 py-5 sm:flex-row sm:items-end sm:justify-between print:px-0 print:pt-0">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Official Report</p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-950 sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          <p className="text-xs font-semibold text-slate-500">Prepared {new Date().toLocaleDateString("en-GB")}</p>
          <div className="print:hidden"><PrintButton /></div>
        </div>
      </header>
      <div className="report-sheet overflow-x-auto [&_table]:min-w-[720px] [&_thead]:border-b [&_thead]:border-slate-300 [&_thead]:bg-slate-100 [&_th]:h-auto [&_th]:px-4 [&_th]:py-3 [&_th]:text-[11px] [&_th]:font-black [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600 [&_td]:px-4 [&_td]:py-3 [&_tbody_tr:nth-child(even)]:bg-slate-50/70 print:[&_table]:min-w-0">
        {children}
      </div>
    </section>
  )
}
