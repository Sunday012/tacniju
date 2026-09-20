import { notFound } from "next/navigation"
import { AdminOfficeDirectory, resolveAdminMenuNode } from "@/components/admin/admin-office-menu"

export const dynamic = "force-dynamic"

export default function AdminOfficePage({ params }: { params: { office: string; section?: string[] } }) {
  const sections = params.section || []
  const node = resolveAdminMenuNode(params.office, sections)
  if (!node) notFound()

  const backHref = sections.length
    ? `/admin/office/${[params.office, ...sections.slice(0, -1)].join("/")}`
    : "/admin"

  return <AdminOfficeDirectory node={node} backHref={backHref} />
}
