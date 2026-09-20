import { AdminOfficeSubmenu, adminOfficeRecordTools } from "@/components/admin/admin-office-menu"

export default function AdminOfficeRecordsPage() {
  return (
    <AdminOfficeSubmenu
      title="Records & Reports"
      description="Open the overview, location, treasury, and pending records."
      tools={adminOfficeRecordTools}
    />
  )
}
