"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Landmark, Search } from "lucide-react"

type JumpLedger = {
  id: string
  name: string
  isBank: boolean
  groupName?: string | null
}

export function AccountJumpSearch({ ledgers }: { ledgers: JumpLedger[] }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return [] as JumpLedger[]
    return ledgers
      .filter(ledger => ledger.name.toLowerCase().includes(term))
      .slice(0, 12)
  }, [ledgers, query])

  function goTo(ledger: JumpLedger) {
    const href = ledger.isBank
      ? `/accounting/info/bank-account/${ledger.id}`
      : `/accounting/info/ledger/${ledger.id}`
    router.push(href)
  }

  return (
    <div className="relative mb-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={event => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          onKeyDown={event => {
            if (event.key === "Enter" && results[0]) {
              event.preventDefault()
              goTo(results[0])
            }
          }}
          placeholder="Search any account or bank to open its book..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-indigo-900/40"
        />
      </div>

      {isFocused && query.trim() && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500">No account found matching &ldquo;{query}&rdquo;.</p>
          ) : (
            results.map(ledger => (
              <button
                key={ledger.id}
                type="button"
                onMouseDown={event => event.preventDefault()}
                onClick={() => goTo(ledger)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-indigo-50 dark:hover:bg-slate-800"
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${ledger.isBank ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                  {ledger.isBank ? <Landmark className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{ledger.name}</span>
                  <span className="block truncate text-xs text-slate-400 dark:text-slate-500">
                    {ledger.isBank ? "Bank / Cash account" : ledger.groupName || "Ledger"}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
