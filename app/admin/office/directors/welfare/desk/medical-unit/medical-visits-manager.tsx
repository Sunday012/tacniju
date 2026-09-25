"use client"

import { useMemo, useState, useTransition } from "react"
import { Pencil, Plus, Search, Stethoscope, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { deleteMedicalVisit, saveMedicalVisit } from "./actions"

export type MedicalVisit = {
  id: string
  patient_name: string
  visit_date: string
  complaint: string
  treatment: string | null
  status: "Open" | "Treated" | "Referred" | "Closed"
  notes: string | null
}

const emptyForm = {
  id: "",
  patient_name: "",
  visit_date: new Date().toISOString().slice(0, 10),
  complaint: "",
  treatment: "",
  status: "Open" as MedicalVisit["status"],
  notes: "",
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-")
  return year && month && day ? `${day}/${month}/${year}` : value
}

export function MedicalVisitsManager({ visits }: { visits: MedicalVisit[] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [form, setForm] = useState(emptyForm)
  const [pending, startTransition] = useTransition()
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return visits
    return visits.filter((visit) => [visit.patient_name, visit.complaint, visit.treatment || "", visit.status, visit.notes || "", visit.visit_date].some((value) => value.toLowerCase().includes(term)))
  }, [query, visits])

  function edit(visit?: MedicalVisit) {
    setForm(visit ? { ...visit, treatment: visit.treatment || "", notes: visit.notes || "" } : emptyForm)
    setOpen(true)
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    startTransition(async () => {
      const result = await saveMedicalVisit(data)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(form.id ? "Medical record updated" : "Medical visit recorded")
      setOpen(false)
      setForm(emptyForm)
    })
  }

  function remove(id: string) {
    if (!window.confirm("Delete this medical record?")) return
    startTransition(async () => {
      const result = await deleteMedicalVisit(id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Medical record deleted")
    })
  }

  return (
    <>
      <div className="border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patient, complaint, treatment..." className="pl-9" />
          </div>
          <Button onClick={() => edit()} className="gap-2 bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4" />Record Visit</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500">
              <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Patient</th><th className="px-4 py-3">Complaint</th><th className="px-4 py-3">Treatment</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center font-semibold text-slate-500">{visits.length ? "No medical records match your search." : "No medical visits have been recorded."}</td></tr>
              ) : filtered.map((visit) => (
                <tr key={visit.id} className="odd:bg-white even:bg-slate-50/60">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(visit.visit_date)}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{visit.patient_name}</td>
                  <td className="max-w-xs px-4 py-3 text-slate-700">{visit.complaint}</td>
                  <td className="max-w-xs px-4 py-3 text-slate-600">{visit.treatment || "-"}</td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2 py-1 text-xs font-bold ${visit.status === "Open" ? "bg-amber-50 text-amber-700" : visit.status === "Referred" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}>{visit.status}</span></td>
                  <td className="px-4 py-3 text-right"><button onClick={() => edit(visit)} title="Edit record" className="p-2 text-slate-500 hover:text-indigo-700"><Pencil className="h-4 w-4" /></button><button onClick={() => remove(visit.id)} title="Delete record" className="p-2 text-slate-500 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader><SheetTitle>{form.id ? "Update Medical Visit" : "Record Medical Visit"}</SheetTitle><SheetDescription>Keep the complaint, care given, and follow-up status together.</SheetDescription></SheetHeader>
          <form onSubmit={submit} className="mt-7 space-y-5">
            <input type="hidden" name="id" value={form.id} />
            <div className="space-y-2"><Label htmlFor="patient_name">Patient name</Label><Input id="patient_name" name="patient_name" required value={form.patient_name} onChange={(event) => setForm({ ...form, patient_name: event.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="visit_date">Visit date</Label><Input id="visit_date" name="visit_date" type="date" required value={form.visit_date} onChange={(event) => setForm({ ...form, visit_date: event.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="complaint">Complaint</Label><textarea id="complaint" name="complaint" required rows={3} value={form.complaint} onChange={(event) => setForm({ ...form, complaint: event.target.value })} className="w-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500" /></div>
            <div className="space-y-2"><Label htmlFor="treatment">Treatment</Label><textarea id="treatment" name="treatment" rows={3} value={form.treatment} onChange={(event) => setForm({ ...form, treatment: event.target.value })} className="w-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500" /></div>
            <div className="space-y-2"><Label>Status</Label><Select name="status" value={form.status} onValueChange={(status: MedicalVisit["status"]) => setForm({ ...form, status })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Open", "Treated", "Referred", "Closed"].map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="notes">Notes</Label><textarea id="notes" name="notes" rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="w-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500" /></div>
            <Button disabled={pending} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700"><Stethoscope className="mr-2 h-4 w-4" />{pending ? "Saving..." : "Save Medical Record"}</Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
