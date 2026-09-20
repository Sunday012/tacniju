import { notFound } from "next/navigation"
import { AdminOfficeDesk, adminOffices, getAdminOffice } from "@/components/admin/admin-office-menu"

export function generateStaticParams() {
  return adminOffices.map((office) => ({ office: office.slug }))
}

export default function AdminOfficePage({ params }: { params: { office: string } }) {
  const office = getAdminOffice(params.office)
  if (!office) notFound()

  return <AdminOfficeDesk office={office} />
}
