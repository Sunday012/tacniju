import { SensitiveSectionGate } from "@/components/admin/sensitive-section-gate"

export default function AdminDreamsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SensitiveSectionGate section="dreams" title="Dreams Password">
      {children}
    </SensitiveSectionGate>
  )
}
