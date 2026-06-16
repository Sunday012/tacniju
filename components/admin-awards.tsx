"use client"

import { type FormEvent, useState } from "react"
import { Edit3, Loader2, Plus, Trash2, Trophy } from "lucide-react"
import { toast } from "sonner"
import { createAwardAction, deleteAwardAction, updateAwardAction } from "@/app/actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Award = {
  id: string
  name: string
}

export function AdminAwards({ awards }: { awards: Award[] }) {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Awards</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Create, rename, or remove member awards.</p>
          </div>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-black text-white shadow-sm transition hover:bg-amber-600">
              <Plus className="h-4 w-4" />
              Create Award
            </button>
          </DialogTrigger>
          <AwardFormDialog
            title="Create Award"
            description="Add a new award that can be assigned from member diary details."
            submitLabel="Save Award"
            onSubmit={async name => createAwardAction(name)}
            onDone={() => setCreateOpen(false)}
          />
        </Dialog>
      </section>

      {awards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm font-bold text-slate-500">
          No awards created yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {awards.map(award => (
            <AwardCard key={award.id} award={award} />
          ))}
        </div>
      )}
    </div>
  )
}

function AwardCard({ award }: { award: Award }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      const result = await deleteAwardAction(award.id)
      if (result.success) {
        toast.success("Award deleted.")
        setDeleteOpen(false)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error("Failed to delete award.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Trophy className="h-5 w-5" />
          </div>
          <h3 className="min-w-0 truncate text-base font-extrabold text-slate-900">{award.name}</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-700 transition hover:bg-slate-50">
              <Edit3 className="h-4 w-4" />
              Edit
            </button>
          </DialogTrigger>
          <AwardFormDialog
            title="Edit Award"
            description="Rename this award. Member diary assignments will be updated too."
            submitLabel="Save Changes"
            initialName={award.name}
            onSubmit={async name => updateAwardAction(award.id, name)}
            onDone={() => setEditOpen(false)}
          />
        </Dialog>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white text-sm font-black text-rose-600 transition hover:bg-rose-50">
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </DialogTrigger>
          <DialogContent className="bg-white text-slate-900 sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Award</DialogTitle>
              <DialogDescription>This removes the award from the award list and member diary records.</DialogDescription>
            </DialogHeader>
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">
              Delete {award.name}?
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteOpen(false)} className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
              <button type="button" disabled={deleting} onClick={handleDelete} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-black text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60">
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </article>
  )
}

function AwardFormDialog({
  title,
  description,
  submitLabel,
  initialName = "",
  onSubmit,
  onDone,
}: {
  title: string
  description: string
  submitLabel: string
  initialName?: string
  onSubmit: (name: string) => Promise<{ success?: boolean; message?: string }>
  onDone: () => void
}) {
  const [name, setName] = useState(initialName)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanName = name.trim()
    if (!cleanName) return

    setSaving(true)
    try {
      const result = await onSubmit(cleanName)
      if (result.success) {
        toast.success("Award saved.")
        onDone()
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error("Award could not be saved.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <DialogContent className="bg-white text-slate-900 sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="grid gap-1.5 text-sm font-bold text-slate-600">
          Award name
          <input
            value={name}
            onChange={event => setName(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-amber-300 focus:bg-white"
            placeholder="Worker of the Year"
            autoFocus
          />
        </label>
        <button disabled={saving || !name.trim()} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-black text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
          {submitLabel}
        </button>
      </form>
    </DialogContent>
  )
}
