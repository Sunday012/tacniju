import { createClient } from "@/lib/server"
import { AdminCleanup } from "@/components/admin-cleanup"
import { redirect } from "next/navigation"

export default async function AdminSystemPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
  if (!profile?.is_admin && user.email !== "sundayfavour997@gmail.com") redirect("/")

  return (
    <div className="p-6 md:p-10 relative">
      <div className="relative z-10 w-full space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">System Management</h1>
          <p className="text-slate-600 mt-2">Manage backend system tasks, cleanups, and administrative actions.</p>
        </div>
        <AdminCleanup />
      </div>
    </div>
  )
}
