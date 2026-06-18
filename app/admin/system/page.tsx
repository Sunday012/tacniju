import { createClient } from "@/lib/server"
import { AdminCleanup } from "@/components/admin-cleanup"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Archive, KeyRound } from "lucide-react"

export default async function AdminSystemPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
  if (!profile?.is_admin && user.email !== "sundayfavour997@gmail.com") redirect("/")

  return (
    <div className="p-6 md:p-10 relative">
      <div className="max-w-7xl mx-auto z-10 relative space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">System Management</h1>
          <p className="text-slate-600 mt-2">Manage backend system tasks, cleanups, and administrative actions.</p>
        </div>
        <section className="rounded-2xl border border-white/70 bg-white p-5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col gap-2">
            <Link
              href="/admin/system/login-details"
              className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-md"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-indigo-100 bg-indigo-50 text-indigo-600">
                <KeyRound className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-800 sm:text-base">Login Details</h2>
            </Link>
            <Link
              href="/admin/system/archive"
              className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-md"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-indigo-100 bg-indigo-50 text-indigo-600">
                <Archive className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-800 sm:text-base">Archive</h2>
            </Link>
          </div>
        </section>
        <AdminCleanup />
      </div>
    </div>
  )
}
