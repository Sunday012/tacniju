import { AdminOfficeSubmenu, adminOfficeSystemTools } from "@/components/admin/admin-office-menu"

export default function AdminOfficeSystemPage() {
  return (
    <AdminOfficeSubmenu
      title="System"
      description="Open system administration controls."
      tools={adminOfficeSystemTools}
    />
  )
}
