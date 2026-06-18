import { SensitiveSectionGate } from "@/components/admin/sensitive-section-gate"

export default function AdminPointsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SensitiveSectionGate section="points" title="Points Password">
      {children}
    </SensitiveSectionGate>
  )
}
