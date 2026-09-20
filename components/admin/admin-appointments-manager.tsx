"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Pencil, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { saveAdminAppointment, terminateAdminAppointment } from "@/app/admin/office/admin-office/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export type AdminAppointment = {
  id: string
  person_name: string
  office_title: string
  appointed_on: string
  ended_on: string | null
  status: "Active" | "Changed" | "Terminated"
  notes: string | null
}

const emptyForm = { id: "", person_name: "", office_title: "", appointed_on: new Date().toISOString().slice(0, 10), notes: "" }

export function AdminAppointmentsManager({ appointments }: { appointments: AdminAppointment[] }) {
  const router = useRouter()
  const [form, setForm] = useState(emptyForm)
  const [isPending, startTransition] = useTransition()

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

  return (
    <div className="space-y-5">
      <section className="border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3"><h2 className="text-base font-extrabold text-slate-900">{form.id ? "Change Appointment" : "New Appointment"}</h2>{form.id && <Button size="sm" variant="ghost" onClick={() => setForm(emptyForm)}>Cancel</Button>}</div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input value={form.person_name} onChange={(event) => setForm({ ...form, person_name: event.target.value })} placeholder="Person's name" />
          <Input value={form.office_title} onChange={(event) => setForm({ ...form, office_title: event.target.value })} placeholder="Office / appointment" />
          <Input type="date" value={form.appointed_on} onChange={(event) => setForm({ ...form, appointed_on: event.target.value })} />
          <Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Notes" className="md:col-span-2" />
          <Button onClick={save} disabled={isPending || !form.person_name.trim() || !form.office_title.trim()} className="h-10 gap-2 self-end">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : form.id ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {form.id ? "Save Change" : "Add Appointment"}
          </Button>
        </div>
      </section>

      <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Person</th><th className="px-4 py-3">Office</th><th className="px-4 py-3">Appointed</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">
          {appointments.map((appointment) => <tr key={appointment.id}><td className="px-4 py-3 font-bold text-slate-900">{appointment.person_name}</td><td className="px-4 py-3 text-slate-600">{appointment.office_title}</td><td className="px-4 py-3">{appointment.appointed_on}</td><td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-bold ${appointment.status === "Terminated" ? "bg-rose-50 text-rose-700" : appointment.status === "Changed" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{appointment.status}</span></td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" title="Change appointment" disabled={isPending} onClick={() => setForm({ id: appointment.id, person_name: appointment.person_name, office_title: appointment.office_title, appointed_on: appointment.appointed_on, notes: appointment.notes || "" })}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" title="Terminate appointment" disabled={isPending || appointment.status === "Terminated"} onClick={() => terminate(appointment.id)}><X className="h-4 w-4 text-rose-600" /></Button></div></td></tr>)}
          {!appointments.length && <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400">No appointments have been recorded.</td></tr>}
        </tbody></table></div>
      </section>
    </div>
  )
}
