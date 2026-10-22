"use server"

import { createClient } from "@/lib/server"

export type Notification = {
  id: string
  title: string
  message: string
  href: string | null
  kind: string
  read_at: string | null
  created_at: string
}

type NotificationPayload = {
  title: string
  message: string
  href?: string | null
  kind?: string
}

export async function getNotifications(limit = 30) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { notifications: [] as Notification[], unreadCount: 0 }

  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, message, href, kind, read_at, created_at")
    .eq("recipient_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    // Keep the app usable before the notification migration has been applied.
    if (error.code !== "42P01") console.error("Error fetching notifications:", error)
    return { notifications: [] as Notification[], unreadCount: 0 }
  }

  const notifications = (data || []) as Notification[]
  return {
    notifications,
    unreadCount: notifications.filter((notification) => !notification.read_at).length,
  }
}

export async function markNotificationRead(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !id) return { error: "You must be signed in." }

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("recipient_user_id", user.id)

  if (error && error.code !== "42P01") return { error: error.message }
  return { success: true }
}

export async function markAllNotificationsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "You must be signed in." }

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_user_id", user.id)
    .is("read_at", null)

  if (error && error.code !== "42P01") return { error: error.message }
  return { success: true }
}

export async function notifyUsers(userIds: string[], payload: NotificationPayload) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "You must be signed in." }

  const recipients = Array.from(new Set(userIds.filter(Boolean)))
  if (!recipients.length || !payload.title.trim() || !payload.message.trim()) return { success: true }

  const { error } = await supabase.from("notifications").insert(
    recipients.map((recipient_user_id) => ({
      recipient_user_id,
      title: payload.title.trim(),
      message: payload.message.trim(),
      href: payload.href || null,
      kind: payload.kind || "info",
    })),
  )

  if (error && error.code !== "42P01") {
    console.error("Error creating notifications:", error)
    return { error: error.message }
  }
  return { success: true }
}

export async function notifyAllMembers(payload: NotificationPayload) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "You must be signed in." }

  const { data: profiles, error } = await supabase.from("profiles").select("id")
  if (error) {
    if (error.code !== "42P01") console.error("Error finding notification recipients:", error)
    return { success: true }
  }

  return notifyUsers((profiles || []).map((profile) => profile.id), payload)
}
