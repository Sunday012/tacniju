"use client"

import Link from "next/link"
import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Printer, Shield, Trash2, UserPlus, Users } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createAccountingParty } from "@/app/accounting/actions"
import { deleteLedger } from "@/app/management/actions"

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
  const [address, setAddress] = useState("")
  const [selectedParty, setSelectedParty] = useState<Party | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [isPending, startTransition] = useTransition()
  const manualParties = parties.filter((party) => Boolean(party.ledgerId)).length
  const phoneParties = parties.filter((party) => Boolean(party.phone_number)).length

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)")
    const updateMatch = () => setIsDesktop(mediaQuery.matches)

    updateMatch()
    mediaQuery.addEventListener("change", updateMatch)

    return () => mediaQuery.removeEventListener("change", updateMatch)
  }, [])

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
    formData.set("address", address.trim())

    startTransition(async () => {
      const result = await createAccountingParty(formData)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Party created.")
      setName("")
      setPhone("")
      setAddress("")
      setShowForm(false)
      router.refresh()
    })
  }

  function openParty(party: Party) {
    setSelectedParty(party)
  }

  async function handleDeleteParty(party: Party) {
    if (!party.ledgerId) {
      toast.error("Auto parties come from member records and can't be deleted here.")
      return
    }

    if (!confirm(`Are you sure you want to delete party "${party.name}"?`)) return

    startTransition(async () => {
      const result = await deleteLedger(party.ledgerId!)

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success("Party deleted")
      setSelectedParty(null)
      router.refresh()
    })
  }

  const partyDetailPanel = selectedParty ? (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">Party Record</p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-900">{selectedParty.name}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {selectedParty.ledgerId ? "Manual Party" : "Auto Party"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone</p>
          <p className="mt-2 text-lg font-semibold text-slate-800">{selectedParty.phone_number || "-"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Reservation</p>
          <p className="mt-2 text-lg font-semibold text-slate-800">{selectedParty.reservation_number || "-"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</p>
          <p className="mt-2 text-lg font-semibold text-slate-800">{selectedParty.ledgerId ? "Manual Party" : "Auto Party"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Linked Ledger</p>
          <p className="mt-2 text-lg font-semibold text-slate-800">{selectedParty.ledgerId || "-"}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="mr-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleDeleteParty(selectedParty)}
            disabled={isPending || !selectedParty.ledgerId}
            className="h-10 border-red-200 bg-red-50 px-3 text-red-600 hover:border-red-300 hover:bg-red-100 hover:text-red-700"
            title={selectedParty.ledgerId ? `Delete ${selectedParty.name}` : "Auto parties come from member records and can't be deleted here"}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Party
          </Button>
        </div>
        <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700">
          <Link href={`/accounting/info/party/${selectedParty.id}`}>View Full Page</Link>
        </Button>
      </div>
    </div>
  ) : null

  return (
    <div className="space-y-8">
      {isDesktop ? (
        <Sheet open={Boolean(selectedParty)} onOpenChange={(open) => !open && setSelectedParty(null)}>
          <SheetContent side="right" className="w-full overflow-y-auto border-slate-200 bg-slate-50 p-0 text-slate-900 sm:max-w-xl">
            <SheetHeader className="border-b border-slate-200 px-6 py-5">
              <SheetTitle>{selectedParty?.name || "Party Details"}</SheetTitle>
              <SheetDescription>Review the selected party record and continue to the full profile page.</SheetDescription>
            </SheetHeader>
            <div className="px-6 py-5">
              {partyDetailPanel}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Drawer open={Boolean(selectedParty)} onOpenChange={(open) => !open && setSelectedParty(null)}>
          <DrawerContent className="border-slate-200 bg-slate-50 text-slate-900">
            <DrawerHeader>
              <DrawerTitle>{selectedParty?.name || "Party Details"}</DrawerTitle>
              <DrawerDescription>Review the selected party record and continue to the full profile page.</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-6">
              {partyDetailPanel}
            </div>
          </DrawerContent>
        </Drawer>
      )}

      <div className="relative overflow-hidden rounded-3xl border border-indigo-700/40 bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 p-8 shadow-[0_20px_40px_-15px_rgba(49,46,129,0.4)]">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-10 pointer-events-none">
          <Shield className="h-72 w-72 text-white" />
        </div>
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-lg backdrop-blur-md">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80">
                Accounts Info
              </div>
              {!hideTitle && <p className="text-sm font-semibold text-indigo-100/85">Party register</p>}
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Parties</h1>
              <p className="mt-1.5 text-sm text-indigo-200/80">
                {parties.length} {parties.length === 1 ? "party" : "parties"} available for ledger-linked transactions
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-amber-300/30 bg-amber-400/15 px-4 py-3 backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200/90">Manual</p>
              <p className="text-sm font-bold text-white">{manualParties}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-100/90">With Phone</p>
              <p className="text-sm font-bold text-white">{phoneParties}</p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/25"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      <Card className="border-indigo-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Party Setup</h3>
                <p className="text-xs text-slate-500">Create third-party records and keep contact information ready for statements and vouchers.</p>
              </div>
            </div>
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-bold text-indigo-800 transition hover:border-indigo-300 hover:bg-indigo-100"
              >
                <Plus className="h-4 w-4" />
                Create New Party
              </button>
            ) : null}
          </div>

          {showForm ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6">
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
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="party-address" className="font-bold text-slate-700">Address (optional)</Label>
                  <Input id="party-address" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 123 Main Street" />
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
          ) : null}
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardContent className="border-b border-slate-200 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search member name, reservation, phone..." className="max-w-sm sm:ml-auto" />
          </div>
        </CardContent>
        <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50 [&_th]:px-5 [&_th]:py-3.5 [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Reservation</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 [&_td]:px-5 [&_td]:py-3.5 [&_tr:hover]:bg-slate-50/60">
            {filteredParties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-slate-500">No parties found.</TableCell>
              </TableRow>
            ) : filteredParties.map(party => {
              return (
                <TableRow
                  key={party.id}
                  className="cursor-pointer"
                  onClick={() => openParty(party)}
                >
                  <TableCell className="font-semibold text-slate-800">
                    <button
                      type="button"
                      onClick={() => openParty(party)}
                      className="w-full text-left transition hover:text-indigo-700"
                    >
                      {party.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-slate-500">{party.reservation_number || "-"}</TableCell>
                  <TableCell className="text-slate-500">{party.phone_number || "-"}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        </CardContent>
      </Card>
    </div>
  )
}
