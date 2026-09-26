import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"
import { RoomAllocationManager, type RoomAllocation } from "./room-allocation-manager"

export const dynamic = "force-dynamic"

export default async function LogisticsRoomsPage() {
  const supabase = await createClient()
  const orgId = await getAccountingOrgId()
  const [{ data: rooms, error }, { data: allocations }] = await Promise.all([supabase.from("logistics_rooms").select("id, name, room_number, location, head_of_room, capacity").eq("org_id", orgId).order("location").order("room_number"), supabase.from("logistics_room_allocations").select("id, room_id, room_name, occupant_name, reservation_number, capacity, allocated_on, released_on, status, notes").eq("org_id", orgId).order("status").order("room_name")])

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full">
        <Link href="/admin/office/directors/logistics/desk" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Logistics Desk
        </Link>
        <div className="mb-6 mt-6 border-b border-slate-200 pb-6">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Logistics Director</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Room Allocation</h1>
          <p className="mt-2 text-slate-500">Assign rooms and keep a clear record of active and released allocations.</p>
        </div>
        {error ? <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">Room directory is not ready. Apply migration 063 in Supabase.</div> : <RoomAllocationManager rooms={rooms || []} allocations={(allocations || []) as RoomAllocation[]} />}
      </div>
    </main>
  )
}
