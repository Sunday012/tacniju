"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { deleteAdminAppointment, saveAdminAppointment, terminateAdminAppointment } from "@/app/admin/office/admin-office/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export type AdminAppointment = {
  id: string
  person_name: string
  office_title: string
  appointed_on: string
  ended_on: string | null
  status: "Active" | "Changed" | "Terminated"
  notes: string | null
  profile_id: string | null
}

type MemberOption = { id: string; full_name: string | null; reservation_number: string | null }

const emptyForm = { id: "", profile_id: "", person_name: "", office_title: "", appointed_on: "", notes: "" }

export function AdminAppointmentsManager({ appointments, members }: { appointments: AdminAppointment[]; members: MemberOption[] }) {
  const router = useRouter()
  const [form, setForm] = useState(emptyForm)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const openNewAppointment = () => {
    setForm({ ...emptyForm, appointed_on: new Date().toISOString().slice(0, 10) })
    setOpen(true)
  }

  const openAppointment = (appointment: AdminAppointment) => {
    setForm({ id: appointment.id, profile_id: appointment.profile_id || "", person_name: appointment.person_name, office_title: appointment.office_title, appointed_on: appointment.appointed_on, notes: appointment.notes || "" })
    setOpen(true)
  }

  const save = () => {
    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => formData.set(key, value))
    startTransition(async () => {
      const result = await saveAdminAppointment(formData)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(form.id ? "Appointment changed." : "Appointment created.")
      setForm(emptyForm)
      setOpen(false)
      router.refresh()
    })
  }

  const terminate = (id: string) => {
    if (!confirm("Terminate this appointment?")) return
    startTransition(async () => {
      const result = await terminateAdminAppointment(id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Appointment terminated.")
      router.refresh()
    })
  }

  const remove = (id: string) => {
    if (!confirm("Permanently delete this appointment record?")) return
    startTransition(async () => {
      const result = await deleteAdminAppointment(id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Appointment deleted.")
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={openNewAppointment} className="h-10 gap-2 border border-indigo-700 bg-indigo-600 px-5 font-bold text-white shadow-sm hover:bg-indigo-700">
          <Plus className="h-4 w-4" />New Appointment
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-xl">
          <SheetHeader className="border-b border-slate-200 px-6 py-5 text-left">
            <SheetTitle>{form.id ? "Change Appointment" : "New Appointment"}</SheetTitle>
            <SheetDescription>{form.id ? "Update the selected office appointment." : "Record a new office appointment."}</SheetDescription>
          </SheetHeader>
          <div className="space-y-5 p-6">
            <label className="grid gap-1.5"><Label>Member</Label><Select value={form.profile_id} onValueChange={(profileId) => { const member = members.find((item) => item.id === profileId); setForm({ ...form, profile_id: profileId, person_name: member?.full_name || "" }) }}><SelectTrigger><SelectValue placeholder="Select a registered member" /></SelectTrigger><SelectContent>{members.map((member) => <SelectItem key={member.id} value={member.id}>{member.full_name || "Unnamed member"}{member.reservation_number ? ` (${member.reservation_number})` : ""}</SelectItem>)}</SelectContent></Select></label>
            <label className="grid gap-1.5"><Label>Office / appointment</Label><Input value={form.office_title} onChange={(event) => setForm({ ...form, office_title: event.target.value })} placeholder="Enter the office or appointment" /></label>
            <label className="grid gap-1.5"><Label>Appointment date</Label><Input type="date" value={form.appointed_on} onChange={(event) => setForm({ ...form, appointed_on: event.target.value })} /></label>
            <label className="grid gap-1.5"><Label>Notes</Label><Textarea rows={6} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Add appointment notes" /></label>
            <Button onClick={save} disabled={isPending || !form.person_name.trim() || !form.office_title.trim()} className="h-11 w-full gap-2 bg-indigo-600 font-bold text-white hover:bg-indigo-700">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : form.id ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {form.id ? "Save Changes" : "Add Appointment"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Person</th><th className="px-4 py-3">Office</th><th className="px-4 py-3">Appointed</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">
          {appointments.map((appointment) => <tr key={appointment.id}><td className="px-4 py-3 font-bold text-slate-900">{appointment.person_name}</td><td className="px-4 py-3 text-slate-600">{appointment.office_title}</td><td className="px-4 py-3">{appointment.appointed_on}</td><td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-bold ${appointment.status === "Terminated" ? "bg-rose-50 text-rose-700" : appointment.status === "Changed" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{appointment.status}</span></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Button size="icon" variant="outline" aria-label="Change appointment" title="Change appointment" disabled={isPending} onClick={() => openAppointment(appointment)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="outline" aria-label="Terminate appointment" title="Terminate appointment" disabled={isPending || appointment.status === "Terminated"} className="text-amber-600 hover:bg-amber-50 hover:text-amber-700" onClick={() => terminate(appointment.id)}><X className="h-4 w-4" /></Button><Button size="icon" variant="outline" aria-label="Delete appointment" title="Delete appointment" disabled={isPending} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => remove(appointment.id)}><Trash2 className="h-4 w-4" /></Button></div></td></tr>)}
          {!appointments.length && <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400">No appointments have been recorded.</td></tr>}
        </tbody></table></div>
      </section>
    </div>
  )
}
