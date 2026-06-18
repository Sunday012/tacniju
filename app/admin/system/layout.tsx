import { SensitiveSectionGate } from "@/components/admin/sensitive-section-gate"

export default function AdminSystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <SensitiveSectionGate section="system" title="System Password">
      {children}
    </SensitiveSectionGate>
  )
}
