import Link from "next/link"
import { Archive, ArrowLeft, CalendarDays, Database } from "lucide-react"
import { createClient } from "@/lib/server"

export const dynamic = "force-dynamic"

const archiveSources = [
  { label: "Meal Tickets", table: "meal_tickets", dateColumn: "created_at" },
  { label: "Meal Register", table: "dining_hall_servings", dateColumn: "served_at" },
  { label: "Stock Records", table: "assets", dateColumn: "created_at" },
  { label: "Families", table: "families", dateColumn: "created_at" },
  { label: "Gifts and Records", table: "asset_assignments", dateColumn: "assigned_at" },
  { label: "Stall and Records", table: "stall_orders", dateColumn: "created_at" },
  { label: "Events", table: "events", dateColumn: "event_date" },
  { label: "Competition Records", table: "competition_entries", dateColumn: "entered_at" },
]

function getRecordTitle(record: Record<string, any>) {
  return record.name || record.ticket_code || record.payment_method || record.status || record.id
}

function getRecordDate(record: Record<string, any>, dateColumn: string) {
  const value = record[dateColumn]
  if (!value) return "-"
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

export default async function SystemArchivePage({ searchParams }: { searchParams: { year?: string } }) {
  const supabase = await createClient()
  const selectedYear = Number(searchParams.year || 0)
  const currentYear = new Date().getFullYear()
  const { data: archivedYears, error: archiveYearsError } = await supabase
    .from("yearly_archives")
    .select("archive_year")
    .order("archive_year", { ascending: false })
  const archiveStorageReady = !archiveYearsError

  const candidateYears = Array.from({ length: 8 }, (_, index) => currentYear - index).filter(year => year < currentYear)
  const years = Array.from(new Set([
    ...(archivedYears || []).map(row => Number(row.archive_year)),
    ...candidateYears,
  ])).filter(Boolean).sort((a, b) => b - a)
  const sections = selectedYear
    ? archiveStorageReady ? await Promise.all(archiveSources.map(async source => {
      const { data, count, error } = await supabase
        .from("yearly_archives")
        .select("id, source_id, record, archived_at", { count: "exact" })
        .eq("archive_year", selectedYear)
        .eq("source_table", source.table)
        .order("archived_at", { ascending: false })
        .limit(10)

      return {
        ...source,
        rows: (data || []).map((row: any) => ({ id: row.source_id || row.id, ...(row.record || {}) })),
        count: count || 0,
        error: error ? "Archive records are not available yet." : null,
      }
    })) : archiveSources.map(source => ({
      ...source,
      rows: [],
      count: 0,
      error: null,
    }))
    : []

  return (
    <div className="p-6 md:p-10">
      <div className="w-full space-y-8">
        <div>
          <Link href="/admin/system" className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 text-sm font-black text-indigo-700 shadow-sm hover:bg-indigo-50">
            <ArrowLeft className="h-4 w-4" />
            Back to System
          </Link>
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Archive className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Archive</h1>
              <p className="mt-1 font-medium text-slate-500">Yearly records are shown only after an admin selects a year.</p>
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-white/70 bg-white p-5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]">
          <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500">
            <CalendarDays className="h-4 w-4" />
            Years
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {years.map(year => (
              <Link
                key={year}
                href={`/admin/system/archive?year=${year}`}
                className={`rounded-xl border px-4 py-3 font-black shadow-sm transition ${selectedYear === year ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
              >
                {year}
              </Link>
            ))}
          </div>
        </section>

        {selectedYear && !archiveStorageReady ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-800">
            Archive storage is not ready yet. Run `scripts/039_yearly_archive_reset.sql` in Supabase to enable saved yearly records.
          </div>
        ) : null}

        {selectedYear ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {sections.map(section => (
              <section key={section.table} className="rounded-2xl border border-white/70 bg-white p-5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                      <Database className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-slate-900">{section.label}</h2>
                      <p className="text-xs font-bold text-slate-400">{section.count} record{section.count === 1 ? "" : "s"} in {selectedYear}</p>
                    </div>
                  </div>
                </div>
                {section.error ? (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">{section.error}</p>
                ) : section.rows.length === 0 ? (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm font-semibold text-slate-500">No records for this year.</p>
                ) : (
                  <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
                    {section.rows.map((row: any) => (
                      <div key={row.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                        <span className="min-w-0 truncate font-bold text-slate-700">{getRecordTitle(row)}</span>
                        <span className="shrink-0 font-semibold text-slate-400">{getRecordDate(row, section.dateColumn)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
