"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Plus, Printer, Shield, UserPlus, Users } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  const manualParties = parties.filter((party) => Boolean(party.ledgerId)).length
  const phoneParties = parties.filter((party) => Boolean(party.phone_number)).length

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
    <div className="space-y-8">
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
                  <TableCell className="font-semibold text-slate-800">
                    <Link href={`/accounting/info/party/${party.id}`} className="transition hover:text-indigo-700">
                      {party.name}
                    </Link>
                  </TableCell>
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
        </CardContent>
      </Card>
    </div>
  )
}
