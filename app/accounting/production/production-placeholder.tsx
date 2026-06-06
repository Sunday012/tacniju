import { AccountingShell } from "@/components/accounting/accounting-shell"

export function ProductionPlaceholderPage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <AccountingShell title={title} backHref="/accounting/production" backLabel="Production">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-extrabold text-slate-800">{title}</h2>
        <p className="mt-2 max-w-3xl font-medium leading-7 text-slate-500">{description}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {["Date", "Reference", "Quantity"].map(label => (
            <label key={label} className="grid gap-1.5 text-sm font-bold text-slate-600">
              {label}
              <input className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" placeholder={label} />
            </label>
          ))}
        </div>
        <button className="mt-6 h-11 rounded-xl bg-indigo-600 px-5 font-black text-white shadow-sm hover:bg-indigo-700">
          Save Draft
        </button>
      </div>
    </AccountingShell>
  )
}
