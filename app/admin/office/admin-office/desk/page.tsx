import { AdminOfficeSubmenu, adminOfficeDeskTools } from "@/components/admin/admin-office-menu"

export default function AdminOfficeDeskPage() {
  return (
    <AdminOfficeSubmenu
      title="Desk"
      description="Open the Admin Office operation desk tools."
      tools={adminOfficeDeskTools}
    />
  )
}
