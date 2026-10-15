import { notFound } from "next/navigation"
import { AdminOfficeDirectory, resolveAdminMenuNode } from "@/components/admin/admin-office-menu"
import { canOpenAdminOfficeSlug, getAdminOfficeAccess } from "@/lib/access"
import { createClient } from "@/lib/server"

export const dynamic = "force-dynamic"

export default async function AdminOfficePage({ params }: { params: { office: string; section?: string[] } }) {
  const sections = params.section || []
  const node = resolveAdminMenuNode(params.office, sections)
  if (!node) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from("profiles").select("id, is_admin, department, member_role, email, full_name").eq("id", user.id).maybeSingle()
    : { data: null }
  const access = await getAdminOfficeAccess(profile ? { ...profile, email: profile.email || user?.email } : null)
  if (!canOpenAdminOfficeSlug(access, params.office)) notFound()

  const backHref = sections.length
    ? `/admin/office/${[params.office, ...sections.slice(0, -1)].join("/")}`
    : params.office === "admin-control-unit"
      ? "/admin/office/admin-office"
      : "/admin"

  return <AdminOfficeDirectory node={node} backHref={backHref} />
}
