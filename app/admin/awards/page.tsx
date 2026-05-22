import { createClient } from "@/lib/server"
import { AdminAwards } from "@/components/admin-awards"
import { redirect } from "next/navigation"

export default async function AdminAwardsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
  if (!profile?.is_admin && user.email !== "sundayfavour997@gmail.com") redirect("/")

  const { data: awardsData } = await supabase.from("awards").select("*").order("created_at", { ascending: true })
  
  return (
    <div className="p-6 md:p-10 relative">
      <div className="max-w-7xl mx-auto z-10 relative space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Awards Management</h1>
          <p className="text-slate-600 mt-2">Create and manage awards to be assigned to members.</p>
        </div>
        <AdminAwards awards={awardsData || []} />
      </div>
    </div>
  )
}
