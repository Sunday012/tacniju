"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Loader2, Printer, Trash2 } from "lucide-react"
import { assignReservationNumberAction, generateReservationNumberAction, bulkGenerateReservationNumbersAction, deleteReservationNumberAction } from "@/app/actions"
import Link from "next/link"
import { toast } from "sonner"

interface Profile {
  id: string
  full_name: string
  rank?: string
  assembly?: string
  reservation_number?: string
}

interface ReservationsTableProps {
  members: Profile[]
}

export function ReservationsTable({ members }: ReservationsTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [manualNumbers, setManualNumbers] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isBulkGenerating, setIsBulkGenerating] = useState(false)

  const filteredMembers = members.filter((member) =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.reservation_number && member.reservation_number.includes(searchTerm))
  )

  const handleGenerate = async (id: string) => {
    setGeneratingId(id)
    try {
      const result = await generateReservationNumberAction(id)
      if (!result.success) {
        toast.error(result.message)
      } else {
        toast.success(result.message || "Generated successfully")
        router.refresh()
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred")
    } finally {
      setGeneratingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member's reservation number?")) return
    setGeneratingId(id)
    try {
      const result = await deleteReservationNumberAction(id)
      if (!result.success) {
        toast.error(result.message)
      } else {
        toast.success(result.message || "Deleted successfully")
        router.refresh()
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred")
    } finally {
      setGeneratingId(null)
    }
  }

  const startEdit = (member: Profile) => {
    setEditingId(member.id)
    setManualNumbers(current => ({ ...current, [member.id]: member.reservation_number || "" }))
  }

  const cancelEdit = (id: string) => {
    setEditingId(null)
    setManualNumbers(current => ({ ...current, [id]: "" }))
  }

  const handleManualAssign = async (id: string) => {
    const reservationNumber = (manualNumbers[id] || "").trim()
    if (!reservationNumber) {
      toast.error("Enter a reservation number first.")
      return
    }

    setGeneratingId(id)
    try {
      const result = await assignReservationNumberAction(id, reservationNumber)
      if (!result.success) {
        toast.error(result.message)
      } else {
        toast.success(result.message || "Reservation number assigned")
        setManualNumbers(current => ({ ...current, [id]: "" }))
        setEditingId(null)
        router.refresh()
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred")
    } finally {
      setGeneratingId(null)
    }
  }

  const handleBulkGenerate = async () => {
    if (!confirm("Are you sure you want to generate reservation numbers for all unassigned members?")) return
    setIsBulkGenerating(true)
    try {
      const result = await bulkGenerateReservationNumbersAction()
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred")
    } finally {
      setIsBulkGenerating(false)
    }
  }

  const missingCount = members.filter(m => !m.reservation_number).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between print:hidden">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => window.print()}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print List
          </Button>
          <Button 
            onClick={handleBulkGenerate} 
            disabled={isBulkGenerating || missingCount === 0}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isBulkGenerating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              `Generate for All Unassigned (${missingCount})`
            )}
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Assembly</TableHead>
              <TableHead>Reservation Number</TableHead>
              <TableHead className="text-right print:hidden">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <TableRow key={member.id} className="print:break-inside-avoid">
                  <TableCell className="font-medium text-slate-800">
                    <Link href={`/admin/reservations/${member.id}`} className="hover:underline text-indigo-700 font-bold">
                      {member.full_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs bg-slate-50">
                      {member.rank || "Member"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">{member.assembly || "N/A"}</TableCell>
                  <TableCell>
                    {editingId === member.id ? (
                      <Input
                        value={manualNumbers[member.id] || ""}
                        onChange={(event) => setManualNumbers(current => ({ ...current, [member.id]: event.target.value }))}
                        className="h-9 w-36 font-mono text-sm"
                        disabled={generatingId === member.id || isBulkGenerating}
                      />
                    ) : member.reservation_number ? (
                      <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-1 rounded">
                        {member.reservation_number}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-sm">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right print:hidden">
                    <div className="flex justify-end gap-2">
                      {editingId === member.id ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManualAssign(member.id)}
                            disabled={generatingId === member.id || isBulkGenerating}
                            className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            {generatingId === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelEdit(member.id)}
                            disabled={generatingId === member.id || isBulkGenerating}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : !member.reservation_number ? (
                        <>
                          <Input
                            value={manualNumbers[member.id] || ""}
                            onChange={(event) => setManualNumbers(current => ({ ...current, [member.id]: event.target.value }))}
                            placeholder="Enter number"
                            disabled={generatingId === member.id || isBulkGenerating}
                            className="h-9 w-32 text-sm"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManualAssign(member.id)}
                            disabled={generatingId === member.id || isBulkGenerating}
                            className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            {generatingId === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerate(member.id)}
                            disabled={generatingId === member.id || isBulkGenerating}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                          >
                            {generatingId === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(member)}
                            disabled={generatingId === member.id || isBulkGenerating}
                            className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(member.id)}
                            disabled={generatingId === member.id || isBulkGenerating}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete Reservation Number"
                          >
                            {generatingId === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  No members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
