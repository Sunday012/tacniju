"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { format, parseISO } from "date-fns"
import { BookOpenText, CalendarDays, FolderTree, Search } from "lucide-react"
import type { DreamCategory, DreamRecord } from "@/app/actions/dreams"

type SortMode = "topic" | "month"

type CategorySummary = {
  id: string
  name: string
  description: string | null
  isActive: boolean
  count: number
  latestDate: string | null
  searchText: string
  dreams: DreamRecord[]
}

type MonthlySummary = {
  key: string
  count: number
  latestDate: string
  searchText: string
}

function normalize(value: unknown) {
  return String(value || "").toLowerCase()
}

function dreamSearchText(dream: DreamRecord) {
  return [
    dream.title,
    dream.body,
    dream.dream_date,
    dream.owner?.full_name,
    dream.owner?.reservation_number,
    dream.category?.name,
    dream.category?.description,
  ].map(normalize).join(" ")
}

export function DreamSummaryClient({
  sort,
  dreams,
  categories,
  error,
}: {
  sort: SortMode
  dreams: DreamRecord[]
  categories: DreamCategory[]
  error: string | null | undefined
}) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 300)
    return () => window.clearTimeout(timeout)
  }, [search])

  const query = debouncedSearch.trim().toLowerCase()

  const { categorySummaries, monthlySummaries } = useMemo(() => {
    const dreamsByCategory = new Map<string, DreamRecord[]>()
    const dreamCounts = new Map<string, { count: number; latestDate: string | null }>()

    for (const dream of dreams) {
      const key = dream.category_id || "uncategorized"
      const current = dreamCounts.get(key) || { count: 0, latestDate: null }
      dreamCounts.set(key, {
        count: current.count + 1,
        latestDate: !current.latestDate || dream.dream_date > current.latestDate ? dream.dream_date : current.latestDate,
      })
      dreamsByCategory.set(key, [...(dreamsByCategory.get(key) || []), dream])
    }

    const nextCategorySummaries: CategorySummary[] = categories
      .map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        isActive: category.is_active,
        count: dreamCounts.get(category.id)?.count || 0,
        latestDate: dreamCounts.get(category.id)?.latestDate || null,
        searchText: [
          category.name,
          category.description,
          category.is_active ? "active" : "inactive",
          dreamCounts.get(category.id)?.count,
          dreamCounts.get(category.id)?.latestDate,
          ...(dreamsByCategory.get(category.id) || []).map(dreamSearchText),
        ].map(normalize).join(" "),
        dreams: dreamsByCategory.get(category.id) || [],
      }))
      .filter(category => category.count > 0 || category.isActive)

    const uncategorized = dreamCounts.get("uncategorized")
    if (uncategorized) {
      nextCategorySummaries.push({
        id: "uncategorized",
        name: "Uncategorized",
        description: "Dream records that have not been assigned to a category.",
        isActive: true,
        count: uncategorized.count,
        latestDate: uncategorized.latestDate,
        searchText: [
          "uncategorized",
          "dream records that have not been assigned to a category",
          uncategorized.count,
          uncategorized.latestDate,
          ...(dreamsByCategory.get("uncategorized") || []).map(dreamSearchText),
        ].map(normalize).join(" "),
        dreams: dreamsByCategory.get("uncategorized") || [],
      })
    }

    const nextMonthlySummaries = Array.from(dreams.reduce((map, dream) => {
      const key = dream.dream_date.slice(0, 7)
      const current = map.get(key) || { key, count: 0, latestDate: dream.dream_date, searchParts: [] as string[] }
      current.count += 1
      if (dream.dream_date > current.latestDate) current.latestDate = dream.dream_date
      current.searchParts.push(dreamSearchText(dream), format(parseISO(`${key}-01`), "MMMM yyyy"))
      map.set(key, current)
      return map
    }, new Map<string, { key: string; count: number; latestDate: string; searchParts: string[] }>()).values())
      .map(month => ({
        key: month.key,
        count: month.count,
        latestDate: month.latestDate,
        searchText: [month.key, month.count, month.latestDate, ...month.searchParts].map(normalize).join(" "),
      }))
      .sort((a, b) => b.key.localeCompare(a.key))

    return {
      categorySummaries: nextCategorySummaries,
      monthlySummaries: nextMonthlySummaries,
    }
  }, [categories, dreams])

  const visibleCategorySummaries = query
    ? categorySummaries
      .map(category => ({
        ...category,
        dreams: category.dreams.filter(dream => dreamSearchText(dream).includes(query)),
      }))
      .filter(category => category.searchText.includes(query))
    : categorySummaries
  const visibleMonthlySummaries = query
    ? monthlySummaries.filter(month => month.searchText.includes(query))
    : monthlySummaries
  const resultCount = sort === "month" ? visibleMonthlySummaries.length : visibleCategorySummaries.length
  const visibleDreamCount = visibleCategorySummaries.reduce((total, category) => total + category.dreams.length, 0)

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dream Summary</h1>
          <p className="mt-2 font-medium text-slate-500">Dreams are grouped by {sort === "month" ? "month" : "topic"} before opening the individual records.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/records/dreams/summary?sort=topic" className={`inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-black ${sort === "topic" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>Topic</Link>
          <Link href="/admin/records/dreams/summary?sort=month" className={`inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-black ${sort === "month" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>Monthly</Link>
          <Link href="/admin/records/dreams/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-black text-white shadow-sm hover:bg-indigo-700">
            <BookOpenText className="h-4 w-4" />
            New Dream
          </Link>
        </div>
      </div>

      <div className="mb-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search names, titles, content, dates, categories..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
        {query && (
          <p className="mt-2 text-xs font-bold text-slate-500">
            Showing {resultCount} {resultCount === 1 ? "result" : "results"} for "{debouncedSearch.trim()}"
          </p>
        )}
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          Dream tables are not ready yet. Run `scripts/041_create_dream_records.sql` in Supabase.
        </div>
      )}

      <section className="space-y-3">
        {dreams.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white/85 p-12 text-center">
            <FolderTree className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-extrabold text-slate-800">No dreams documented yet</h2>
            <p className="mt-1 text-sm text-slate-500">Create a new dream record to begin the summary.</p>
          </div>
        ) : sort === "month" ? (
          visibleMonthlySummaries.length === 0 ? (
            <EmptySearchState />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visibleMonthlySummaries.map(month => (
                <Link key={month.key} href={`/admin/records/dreams/summary/month/${month.key}`} className="block rounded-lg border border-slate-200 bg-white/85 p-4 shadow-sm transition hover:border-indigo-200 hover:bg-white hover:shadow-md">
                  <article className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="truncate text-base font-extrabold text-slate-900">{format(parseISO(`${month.key}-01`), "MMMM yyyy")}</h2>
                        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                          {month.count} {month.count === 1 ? "dream" : "dreams"}
                        </span>
                      </div>
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Latest: {format(parseISO(month.latestDate), "MMM d, yyyy")}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )
        ) : (
          visibleCategorySummaries.length === 0 ? (
            <EmptySearchState />
          ) : (
            <section className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-[minmax(240px,1fr)_minmax(190px,0.8fr)_150px_120px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500">
                  <span>Group / Dream</span>
                  <span>Member</span>
                  <span>Date</span>
                  <span className="text-right">Group Total</span>
                </div>
                {visibleCategorySummaries.map(category => (
                  <div key={category.id}>
                    <Link href={`/admin/records/dreams/summary/category/${category.id}`} className="grid grid-cols-[minmax(240px,1fr)_minmax(190px,0.8fr)_150px_120px] items-center border-b border-slate-200 bg-slate-100/80 px-4 py-3 transition hover:bg-indigo-50">
                      <span className="flex items-center gap-2 font-extrabold text-slate-900"><FolderTree className="h-4 w-4 text-indigo-600" />{category.name}</span>
                      <span className="text-sm font-semibold text-slate-500">{category.description || "Dream records"}</span>
                      <span className="text-sm font-semibold text-slate-500">{category.latestDate ? format(parseISO(category.latestDate), "MMM d, yyyy") : "-"}</span>
                      <span className="text-right font-mono text-sm font-black text-slate-800">{category.dreams.length}</span>
                    </Link>
                    {category.dreams.map(dream => (
                      <Link key={dream.id} href={`/admin/records/dreams/summary/${dream.id}`} className="grid grid-cols-[minmax(240px,1fr)_minmax(190px,0.8fr)_150px_120px] items-center border-b border-slate-100 px-4 py-3 text-sm transition hover:bg-slate-50">
                        <span className="truncate pl-6 font-semibold text-slate-800">{dream.title}</span>
                        <span className="truncate text-slate-600">{dream.owner?.full_name || "Unnamed member"}</span>
                        <span className="text-slate-500">{format(parseISO(dream.dream_date), "MMM d, yyyy")}</span>
                        <span className="text-right text-slate-400">-</span>
                      </Link>
                    ))}
                  </div>
                ))}
                <div className="grid grid-cols-[minmax(240px,1fr)_minmax(190px,0.8fr)_150px_120px] bg-slate-50 px-4 py-3 font-extrabold text-slate-900">
                  <span>Overall Total</span>
                  <span />
                  <span />
                  <span className="text-right font-mono">{visibleDreamCount}</span>
                </div>
              </div>
            </section>
          )
        )}
      </section>
    </>
  )
}

function EmptySearchState() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/85 p-10 text-center">
      <Search className="mx-auto h-10 w-10 text-slate-300" />
      <h2 className="mt-4 text-lg font-extrabold text-slate-800">No matching dreams found</h2>
      <p className="mt-1 text-sm text-slate-500">Try another name, title, category, date, or word from the dream content.</p>
    </div>
  )
}
