"use client"

import { type FormEvent, useState } from "react"
import { CheckCircle2, Loader2, Save, UserRound } from "lucide-react"
import { toast } from "sonner"
import { saveLoginDetails } from "@/app/admin/system/login-details/actions"

type LoginDetailRow = {
  profile_id: string
  username: string | null
  password_text: string | null
}

type MemberRow = {
  id: string
  full_name: string | null
  reservation_number: string | null
  username: string | null
  email: string | null
  member_status: string | null
}

export function LoginDetailsCards({
  members,
  loginDetails,
}: {
  members: MemberRow[]
  loginDetails: LoginDetailRow[]
}) {
  const detailsByProfile = new Map(loginDetails.map(detail => [detail.profile_id, detail]))

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {members.map(member => (
        <LoginDetailsCard key={member.id} member={member} detail={detailsByProfile.get(member.id)} />
      ))}
    </div>
  )
}

function LoginDetailsCard({ member, detail }: { member: MemberRow; detail?: LoginDetailRow }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      const result = await saveLoginDetails(new FormData(event.currentTarget))
      if (result?.error) {
        toast.error(result.error)
      } else {
        setSaved(true)
        toast.success("Login details saved.")
      }
    } catch {
      toast.error("Could not save login details.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <input type="hidden" name="profile_id" value={member.id} />
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <UserRound className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-extrabold text-slate-900">{member.full_name || "Unnamed"}</h3>
          <p className="mt-0.5 truncate text-xs font-bold text-slate-500">
            {member.reservation_number || member.email || "Registered member"}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        <label className="grid gap-1.5 text-sm font-bold text-slate-600">
          Username
          <input
            name="username"
            defaultValue={detail?.username || member.username || ""}
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-indigo-300 focus:bg-white"
            placeholder="username"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-slate-600">
          Password
          <input
            name="password_text"
            defaultValue={detail?.password_text || ""}
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-indigo-300 focus:bg-white"
            placeholder="manual password"
          />
        </label>
      </div>

      <button
        disabled={saving}
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {saved ? "Saved" : "Save Details"}
      </button>
    </form>
  )
}
