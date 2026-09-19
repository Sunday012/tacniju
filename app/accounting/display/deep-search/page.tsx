import Link from "next/link"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { DeepSearchCriterion, DeepSearchField, DeepSearchOperator, getDeepSearchResults } from "./actions"

const fields: Array<{ value: DeepSearchField; label: string }> = [
  { value: "attendance_type", label: "Attendance Type" },
  { value: "batch_number", label: "Batch Number" },
  { value: "party_name", label: "Party Name" },
  { value: "ledger", label: "Ledger" },
  { value: "narration", label: "Narration" },
  { value: "stock_item", label: "Stock Item" },
  { value: "tracking_number", label: "Tracking Number" },
  { value: "voucher_type", label: "Voucher Type" },
  { value: "voucher_number", label: "Voucher Number" },
  { value: "amount", label: "Amount" },
]

const operators: Array<{ value: DeepSearchOperator; label: string }> = [
  { value: "contains", label: "Containing" },
  { value: "starts_with", label: "Starting With" },
  { value: "ends_with", label: "Ending With" },
  { value: "equals", label: "Equal To" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Lesser Than" },
  { value: "not_contains", label: "Not Contained" },
]

function paramValue(value: string | string[] | undefined, index: number, fallback = "") {
  if (Array.isArray(value)) return value[index] || fallback
  return index === 0 ? value || fallback : fallback
}

function buildCriteria(searchParams: Record<string, string | string[] | undefined>): DeepSearchCriterion[] {
  return Array.from({ length: 4 }).flatMap((_, index) => {
    const field = paramValue(searchParams.field, index, index === 0 ? "voucher_number" : "") as DeepSearchField | ""
    const operator = paramValue(searchParams.operator, index, "contains") as DeepSearchOperator
    const value = paramValue(searchParams.value, index, "")
    return field && value.trim() ? [{ field, operator, value }] : []
  })
}

function formatDate(dateValue: string) {
  const [year, month, day] = String(dateValue || "").split("-")
  if (!year || !month || !day) return dateValue || "-"
  return `${day}/${month}/${year}`
}

function formatNumber(value: number) {
  return value ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-"
}

export default async function DeepSearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const criteria = buildCriteria(searchParams)
  const results = await getDeepSearchResults(criteria)

  return (
    <AccountingShell title="Deep Search" backHref="/accounting/display" backLabel="Display">
      <div className="space-y-4">
        <form className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3">
            {Array.from({ length: 4 }).map((_, index) => {
              const selectedField = paramValue(searchParams.field, index, index === 0 ? "voucher_number" : "")
              const selectedOperator = paramValue(searchParams.operator, index, "contains")
              const selectedValue = paramValue(searchParams.value, index, "")

              return (
                <div key={index} className="grid gap-2 sm:grid-cols-[220px_190px_minmax(0,1fr)]">
                  <select
                    name="field"
                    defaultValue={selectedField}
                    className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-300 focus:bg-white"
                  >
                    <option value="">Select Search List</option>
                    {fields.map(field => <option key={field.value} value={field.value}>{field.label}</option>)}
                  </select>
                  <select
                    name="operator"
                    defaultValue={selectedOperator}
                    className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-300 focus:bg-white"
                  >
                    {operators.map(operator => <option key={operator.value} value={operator.value}>{operator.label}</option>)}
                  </select>
                  <input
                    name="value"
                    defaultValue={selectedValue}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-300"
                    placeholder="Search"
                  />
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Link href="/accounting/display/deep-search" className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 hover:bg-slate-50">
              Clear
            </Link>
            <button className="inline-flex h-10 items-center rounded-lg bg-indigo-600 px-4 text-sm font-black text-white shadow-sm hover:bg-indigo-700">
              Search
            </button>
          </div>
        </form>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
            Deep Search Reports
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-white text-xs uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Record</th>
                  <th className="px-4 py-3">Voucher No.</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {criteria.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm font-semibold text-slate-500">
                      Choose a search list and enter a value to begin.
                    </td>
                  </tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm font-semibold text-slate-500">
                      No matching accounting records found.
                    </td>
                  </tr>
                ) : results.map(result => (
                  <tr key={`${result.recordType}-${result.id}`} className="font-semibold text-slate-700 hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(result.date)}</td>
                    <td className="min-w-[220px] px-4 py-3">
                      <Link href={result.href} className="font-black text-slate-900 hover:text-indigo-700">
                        {result.title}
                      </Link>
                      <span className="mt-0.5 block text-xs text-slate-500">{result.recordType}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono font-black text-slate-900">{result.voucherNo}</td>
                    <td className="whitespace-nowrap px-4 py-3">{result.voucherType}</td>
                    <td className="min-w-[260px] px-4 py-3 text-slate-600">{result.details}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono font-black text-slate-900">{formatNumber(result.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AccountingShell>
  )
}
