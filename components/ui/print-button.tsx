"use client"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PrintButton() {
  return (
    <Button 
      variant="outline" 
      onClick={() => window.print()}
      className="gap-2 shrink-0 border-slate-200 text-slate-600 hover:text-slate-900"
    >
      <Printer className="w-4 h-4" />
      Print Records
    </Button>
  )
}
