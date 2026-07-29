"use client"

import { FormEvent, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { BookOpenCheck, CheckCircle2, FileAudio, Loader2, MicVocal, Save } from "lucide-react"
import type { ContentCategory, ContentRecord } from "@/app/actions/content-records"
import { Button } from "@/components/ui/button"
import { transcribeTeachingVoiceNotes, saveTranscribedTeaching, type TeachingTranscriptionResult } from "./actions"

type Owner = ContentRecord["owner"]

export function TeachingTranscriber({
  categories,
  owners,
}: {
  categories: ContentCategory[]
  owners: Owner[]
}) {
  const router = useRouter()
  const [isAnalyzing, startAnalyzing] = useTransition()
  const [isSaving, startSaving] = useTransition()
  const [result, setResult] = useState<TeachingTranscriptionResult | null>(null)
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [transcript, setTranscript] = useState("")
  const [seriesMode, setSeriesMode] = useState<"existing" | "new" | "none">("existing")
  const [categoryId, setCategoryId] = useState("")
  const [newSeriesName, setNewSeriesName] = useState("")
  const [parentGroupId, setParentGroupId] = useState("")
  const [recordDate, setRecordDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [profileId, setProfileId] = useState("")

  const groups = useMemo(
    () => categories.filter(category => category.parent_id === null && category.is_group),
    [categories]
  )
  const series = useMemo(
    () => categories.filter(category => !category.is_group),
    [categories]
  )

  function handleAnalyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startAnalyzing(async () => {
      const response = await transcribeTeachingVoiceNotes(formData)
      if (response.error || !response.data) {
        toast.error(response.error || "Could not process voice notes.")
        return
      }

      const data = response.data
      setResult(data)
      setTitle(data.title)
      setSummary(data.summary)
      setTranscript(data.transcript)
      setCategoryId(data.suggestedSeriesId || "")
      setNewSeriesName(data.suggestedSeriesName || "")
      setParentGroupId(data.suggestedGroupId || groups[0]?.id || "")
      setSeriesMode(data.suggestedSeriesId ? "existing" : "new")
      toast.success("Teaching summary ready.")
    })
  }

  function handleSave() {
    const formData = new FormData()
    formData.set("record_date", recordDate)
    formData.set("profile_id", profileId)
    formData.set("title", title)
    formData.set("summary", summary)
    formData.set("transcript", transcript)
    formData.set("series_mode", seriesMode)
    formData.set("category_id", categoryId)
    formData.set("new_series_name", newSeriesName)
    formData.set("parent_group_id", parentGroupId)

    startSaving(async () => {
      const response = await saveTranscribedTeaching(formData)
      if (response.error) {
        toast.error(response.error)
        return
      }
      toast.success("Teaching saved.")
      router.push("/admin/records/teachings/summary?sort=topic")
    })
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <MicVocal className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Voice Notes</h2>
            <p className="text-xs font-semibold text-slate-500">OGG and common audio files</p>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="mt-5 space-y-4">
          <label className="block rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-5 text-center transition hover:bg-indigo-50">
            <FileAudio className="mx-auto h-9 w-9 text-indigo-500" />
            <span className="mt-3 block text-sm font-black text-slate-900">Choose voice notes</span>
            <input
              name="audio_files"
              type="file"
              multiple
              required
              accept=".ogg,audio/ogg,audio/webm,audio/mpeg,audio/mp4,audio/wav,audio/x-m4a,audio/aac"
              className="sr-only"
              onChange={(event) => {
                setSelectedFileNames(Array.from(event.target.files || []).map(file => file.name))
              }}
            />
          </label>

          {selectedFileNames.length > 0 && (
            <div className="space-y-2">
              {selectedFileNames.map(name => (
                <div key={name} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="truncate">{name}</span>
                </div>
              ))}
            </div>
          )}

          <Button type="submit" disabled={isAnalyzing} className="h-11 w-full gap-2 rounded-xl bg-indigo-600 font-black text-white hover:bg-indigo-700">
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <MicVocal className="h-4 w-4" />}
            {isAnalyzing ? "Processing..." : "Transcribe & Summarize"}
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <BookOpenCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Teaching Draft</h2>
              <p className="text-xs font-semibold text-slate-500">{result ? `${result.segments.length} voice note${result.segments.length === 1 ? "" : "s"}` : "Waiting for audio"}</p>
            </div>
          </div>
          <Button type="button" onClick={handleSave} disabled={!result || isSaving} className="h-10 gap-2 rounded-xl bg-slate-900 px-4 font-black text-white hover:bg-slate-800">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Teaching
          </Button>
        </div>

        <div className="space-y-5 p-5">
          {!result ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-center">
              <div>
                <FileAudio className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-500">No draft yet</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5 text-sm font-bold text-slate-700">
                  Date
                  <input value={recordDate} onChange={(event) => setRecordDate(event.target.value)} type="date" className="h-11 w-full rounded-xl border border-slate-200 px-3 font-semibold outline-none focus:border-indigo-400" />
                </label>
                <label className="space-y-1.5 text-sm font-bold text-slate-700">
                  Teacher
                  <select value={profileId} onChange={(event) => setProfileId(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 font-semibold outline-none focus:border-indigo-400">
                    <option value="">Not assigned</option>
                    {owners.map(owner => owner && <option key={owner.id} value={owner.id}>{owner.full_name || "Unnamed Member"}</option>)}
                  </select>
                </label>
              </div>

              <label className="block space-y-1.5 text-sm font-bold text-slate-700">
                Title
                <input value={title} onChange={(event) => setTitle(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 font-semibold outline-none focus:border-indigo-400" />
              </label>

              <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                <label className="space-y-1.5 text-sm font-bold text-slate-700">
                  Series Mode
                  <select value={seriesMode} onChange={(event) => setSeriesMode(event.target.value as any)} className="h-11 w-full rounded-xl border border-slate-200 px-3 font-semibold outline-none focus:border-indigo-400">
                    <option value="existing">Existing</option>
                    <option value="new">New</option>
                    <option value="none">None</option>
                  </select>
                </label>

                {seriesMode === "existing" && (
                  <label className="space-y-1.5 text-sm font-bold text-slate-700">
                    Series
                    <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 font-semibold outline-none focus:border-indigo-400">
                      <option value="">Uncategorized</option>
                      {series.map(item => <option key={item.id} value={item.id}>{item.parent?.name ? `${item.parent.name} / ${item.name}` : item.name}</option>)}
                    </select>
                  </label>
                )}

                {seriesMode === "new" && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1.5 text-sm font-bold text-slate-700">
                      New Series
                      <input value={newSeriesName} onChange={(event) => setNewSeriesName(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 font-semibold outline-none focus:border-indigo-400" />
                    </label>
                    <label className="space-y-1.5 text-sm font-bold text-slate-700">
                      Group
                      <select value={parentGroupId} onChange={(event) => setParentGroupId(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 font-semibold outline-none focus:border-indigo-400">
                        <option value="">Select group</option>
                        {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                      </select>
                    </label>
                  </div>
                )}
              </div>

              <label className="block space-y-1.5 text-sm font-bold text-slate-700">
                Summary
                <textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={10} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium leading-6 outline-none focus:border-indigo-400" />
              </label>

              <label className="block space-y-1.5 text-sm font-bold text-slate-700">
                Transcript
                <textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} rows={12} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium leading-6 outline-none focus:border-indigo-400" />
              </label>

              <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                <Link href="/admin/records/teachings/category" className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:bg-slate-50">
                  Manage Series
                </Link>
                <Button type="button" onClick={handleSave} disabled={isSaving} className="h-10 gap-2 rounded-xl bg-indigo-600 px-4 font-black text-white hover:bg-indigo-700">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Teaching
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
