"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/server"
import type { ContentCategory } from "@/app/actions/content-records"
import { getContentCategories } from "@/app/actions/content-records"

export type TeachingTranscriptionResult = {
  title: string
  summary: string
  keyPoints: string[]
  suggestedSeriesId: string | null
  suggestedSeriesName: string
  suggestedGroupId: string | null
  transcript: string
  segments: Array<{ fileName: string; transcript: string }>
}

type ActionResult<T> = { error?: string; data?: T; success?: boolean; recordId?: string }

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { supabase, user: null, error: "You must be signed in." }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.is_admin) return { supabase, user, error: "Admins only." }
  return { supabase, user, error: null }
}

function safeString(value: unknown) {
  return String(value || "").trim()
}

function readOutputText(payload: any) {
  if (typeof payload?.output_text === "string") return payload.output_text

  const parts: string[] = []
  for (const output of payload?.output || []) {
    for (const content of output?.content || []) {
      if (typeof content?.text === "string") parts.push(content.text)
    }
  }
  return parts.join("\n").trim()
}

function parseJsonObject(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error("The model returned a summary that could not be parsed.")
    return JSON.parse(match[0])
  }
}

async function transcribeAudio(file: File, index: number) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.")

  const audioForm = new FormData()
  audioForm.append("model", process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-transcribe")
  audioForm.append("file", file, file.name || `teaching-voice-note-${index + 1}.ogg`)
  audioForm.append("response_format", "json")
  audioForm.append("prompt", "This is a church teaching voice note. Preserve sermon terms, scripture references, names, and sequence.")

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: audioForm,
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Could not transcribe ${file.name || "audio file"}.`)
  }

  return safeString(payload?.text)
}

async function summarizeTeaching(transcript: string, categories: ContentCategory[]) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.")

  const groups = categories.filter(category => category.parent_id === null && category.is_group)
  const series = categories.filter(category => !category.is_group)

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_SUMMARY_MODEL || "gpt-4o-mini",
      instructions: "You summarize church teaching transcripts for an admin records system. Return only valid JSON.",
      input: JSON.stringify({
        task: "Create a teaching record summary and suggest whether it belongs to an existing series or needs a new series.",
        outputShape: {
          title: "Short title for the teaching",
          summary: "Clear 4-8 paragraph summary",
          keyPoints: ["5 to 10 concise teaching points"],
          suggestedSeriesId: "Existing series id if a strong match exists, otherwise null",
          suggestedSeriesName: "Existing series name or a new series name",
          suggestedGroupId: "Existing group id that best fits a new series, otherwise null",
        },
        existingGroups: groups.map(group => ({ id: group.id, name: group.name, description: group.description })),
        existingSeries: series.map(item => ({
          id: item.id,
          name: item.name,
          parent_id: item.parent_id,
          parent_name: item.parent?.name || null,
          description: item.description,
        })),
        transcript,
      }),
      temperature: 0.2,
    }),
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Could not summarize the teaching.")
  }

  const parsed = parseJsonObject(readOutputText(payload))
  return {
    title: safeString(parsed.title) || "Untitled Teaching",
    summary: safeString(parsed.summary),
    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.map(safeString).filter(Boolean).slice(0, 12) : [],
    suggestedSeriesId: safeString(parsed.suggestedSeriesId) || null,
    suggestedSeriesName: safeString(parsed.suggestedSeriesName),
    suggestedGroupId: safeString(parsed.suggestedGroupId) || null,
  }
}

export async function transcribeTeachingVoiceNotes(formData: FormData): Promise<ActionResult<TeachingTranscriptionResult>> {
  const { error } = await requireAdmin()
  if (error) return { error }

  const files = formData
    .getAll("audio_files")
    .filter((value): value is File => value instanceof File && value.size > 0)

  if (files.length === 0) return { error: "Add at least one voice note." }

  try {
    const segments = []
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index]
      const transcript = await transcribeAudio(file, index)
      segments.push({ fileName: file.name || `Voice note ${index + 1}`, transcript })
    }

    const transcript = segments
      .map((segment, index) => `Voice note ${index + 1} (${segment.fileName})\n${segment.transcript}`)
      .join("\n\n")
      .trim()

    if (!transcript) return { error: "The uploaded voice notes did not produce a transcript." }

    const { categories } = await getContentCategories("teachings", true)
    const summary = await summarizeTeaching(transcript, categories)

    return {
      data: {
        ...summary,
        transcript,
        segments,
      },
    }
  } catch (error: any) {
    return { error: error?.message || "Could not process the voice notes." }
  }
}

export async function saveTranscribedTeaching(formData: FormData): Promise<ActionResult<never>> {
  const { supabase, user, error } = await requireAdmin()
  if (error || !user) return { error }

  const recordDate = safeString(formData.get("record_date"))
  const profileId = safeString(formData.get("profile_id"))
  const title = safeString(formData.get("title"))
  const summary = safeString(formData.get("summary"))
  const transcript = safeString(formData.get("transcript"))
  const seriesMode = safeString(formData.get("series_mode"))
  const categoryId = safeString(formData.get("category_id"))
  const newSeriesName = safeString(formData.get("new_series_name"))
  const parentGroupId = safeString(formData.get("parent_group_id"))

  if (!recordDate) return { error: "Date is required." }
  if (!title) return { error: "Title is required." }
  if (!summary) return { error: "Summary is required." }

  let finalCategoryId = seriesMode === "existing" ? categoryId : ""

  if (seriesMode === "new") {
    if (!newSeriesName) return { error: "New series name is required." }
    if (!parentGroupId) return { error: "Select a group for the new series." }

    const { data: createdCategory, error: categoryError } = await supabase
      .from("content_record_categories")
      .insert({
        record_type: "teachings",
        name: newSeriesName,
        parent_id: parentGroupId,
        is_group: false,
      })
      .select("id")
      .single()

    if (categoryError) return { error: categoryError.message }
    finalCategoryId = createdCategory?.id || ""
  }

  const body = [
    summary,
    transcript ? "Transcript\n\n" + transcript : "",
  ].filter(Boolean).join("\n\n---\n\n")

  const { data: record, error: insertError } = await supabase
    .from("content_records")
    .insert({
      record_type: "teachings",
      record_date: recordDate,
      profile_id: profileId || null,
      category_id: finalCategoryId || null,
      title,
      body,
      created_by: user.id,
    })
    .select("id")
    .single()

  if (insertError) return { error: insertError.message }

  revalidatePath("/admin/records/teachings")
  revalidatePath("/admin/records/teachings/category")
  revalidatePath("/admin/records/teachings/summary")

  return { success: true, recordId: record?.id }
}
