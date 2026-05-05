import { AdminSidebarNav } from "@/components/admin/sidebar-nav"
import { AdminTopBar } from "@/components/admin/top-bar"
import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/admin-login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!profile?.is_admin) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen bg-[#F4F7FA]">
      <AdminSidebarNav />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar />
        {children}
      </div>
    </div>
  )
}
