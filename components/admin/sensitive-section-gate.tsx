"use client"

import { FormEvent, ReactNode, useEffect, useState } from "react"
import { Loader2, LockKeyhole } from "lucide-react"
import { toast } from "sonner"
import { unlockSecureSection } from "@/app/admin/secure-section-actions"

export function SensitiveSectionGate({
  section,
  title,
  children,
}: {
  section: string
  title: string
  children: ReactNode
}) {
  const storageKey = `tacn-secure-section:${section}`
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setUnlocked(window.sessionStorage.getItem(storageKey) === "unlocked")
  }, [storageKey])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    try {
      const result = await unlockSecureSection(section, password)
      if (result?.success) {
        window.sessionStorage.setItem(storageKey, "unlocked")
        setUnlocked(true)
        setPassword("")
        toast.success(`${title} unlocked.`)
      } else {
        toast.error(result?.error || "Could not unlock this section.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (unlocked) return <>{children}</>

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F7FA] px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border border-white/70 bg-white p-6 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Enter the section password before viewing protected records.</p>
          </div>
        </div>
        <label className="grid gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-300">
          Password
          <input
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 outline-none focus:border-indigo-300 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-950"
            autoFocus
            required
          />
        </label>
        <button disabled={loading} className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 font-black text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
          Unlock
        </button>
      </form>
    </div>
  )
}
