import { AdminOfficeSubmenu, adminOfficeRecordTools } from "@/components/admin/admin-office-menu"

export default function AdminOfficeRecordsPage() {
  return (
    <AdminOfficeSubmenu
      title="Records & Reports"
      description="Open member, location, finance, program, and pending records."
      tools={adminOfficeRecordTools}
    />
  )
}
