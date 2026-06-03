"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Plus, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createAccountingParty } from "@/app/accounting/actions"

type Party = {
  id: string
  name: string
  reservation_number: string | null
  phone_number: string | null
  ledgerId?: string | null
}

export function PartyManager({ parties, hideTitle = false }: { parties: Party[], hideTitle?: boolean }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [isPending, startTransition] = useTransition()

  const filteredParties = parties.filter(party => {
    const query = search.toLowerCase()
    return (
      party.name.toLowerCase().includes(query) ||
      (party.reservation_number || "").toLowerCase().includes(query) ||
      (party.phone_number || "").toLowerCase().includes(query)
    )
  })

  function handleCreate() {
    if (!name.trim()) {
      toast.error("Party name is required.")
      return
    }
    const formData = new FormData()
    formData.set("name", name.trim())
    formData.set("phone", phone.trim())

    startTransition(async () => {
      const result = await createAccountingParty(formData)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Party created.")
      setName("")
      setPhone("")
      setShowForm(false)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {showForm ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-emerald-800">
            <UserPlus className="h-5 w-5" /> Create New Party
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="party-name" className="font-bold text-slate-700">Party name</Label>
              <Input id="party-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. ABC Suppliers Ltd" autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="party-phone" className="font-bold text-slate-700">Phone (optional)</Label>
              <Input id="party-phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 0803..." />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <Button onClick={handleCreate} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
              {isPending ? "Saving..." : "Save Party"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={isPending}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-dashed border-indigo-300 bg-white p-6 text-left shadow-sm transition hover:border-indigo-400 hover:bg-indigo-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <Plus className="h-5 w-5" />
          </span>
          <span className="text-lg font-black text-slate-800">Create New Party</span>
        </button>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          {!hideTitle && <h2 className="text-xl font-bold text-slate-900">Parties</h2>}
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search member name, reservation, phone..." className="max-w-sm sm:ml-auto" />
        </div>
        <Table>
          <TableHeader className="bg-slate-50 [&_th]:px-5 [&_th]:py-3.5 [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Reservation</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 [&_td]:px-5 [&_td]:py-3.5 [&_tr:hover]:bg-slate-50/60">
            {filteredParties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-slate-500">No parties found.</TableCell>
              </TableRow>
            ) : filteredParties.map(party => {
              const isManual = Boolean(party.ledgerId)
              return (
                <TableRow key={party.id}>
                  <TableCell className="font-semibold text-slate-800">{party.name}</TableCell>
                  <TableCell className="text-slate-500">{party.reservation_number || "-"}</TableCell>
                  <TableCell className="text-slate-500">{party.phone_number || "-"}</TableCell>
                  <TableCell>
                    {isManual ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700">
                        <UserPlus className="h-3.5 w-3.5" /> Manual
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Auto Party
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
