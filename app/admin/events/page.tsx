import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { EventsManager } from "@/components/admin/events-manager"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function AdminEventsPage() {
  return (
    <div className="p-6 md:p-10 relative">
      <div className="w-full space-y-8">
        <EventsManager />
      </div>
    </div>
  )
}
