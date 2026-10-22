"use client"

import { Bell, CheckCheck, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getNotifications, markAllNotificationsRead, markNotificationRead, type Notification } from "@/app/actions/notifications"
import { Button } from "@/components/ui/button"

function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const loadNotifications = async () => {
    const result = await getNotifications()
    setNotifications(result.notifications)
    setUnreadCount(result.unreadCount)
  }

  useEffect(() => {
    void loadNotifications()
    const interval = window.setInterval(() => void loadNotifications(), 30_000)
    return () => window.clearInterval(interval)
  }, [])

  const handleRead = async (notification: Notification) => {
    if (!notification.read_at) {
      await markNotificationRead(notification.id)
      setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item))
      setUnreadCount((count) => Math.max(0, count - 1))
    }
    setOpen(false)
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    setNotifications((current) => current.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })))
    setUnreadCount(0)
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative h-10 w-10 rounded-lg border-slate-200 bg-white p-0 text-slate-500 shadow-sm hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</p>
              <p className="text-xs text-slate-500">Updates relevant to your account.</p>
            </div>
            {unreadCount > 0 && (
              <button type="button" onClick={handleMarkAllRead} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300">
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[min(28rem,calc(100vh-8rem))] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet.</p>
            ) : notifications.map((notification) => {
              const content = (
                <div className={`border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 dark:border-slate-800 ${notification.read_at ? "bg-white dark:bg-slate-900" : "bg-indigo-50/60 dark:bg-indigo-950/20"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{notification.title}</p>
                    {!notification.read_at && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />}
                  </div>
                  <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">{notification.message}</p>
                  <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                    <span>{formatNotificationDate(notification.created_at)}</span>
                    {notification.href && <ExternalLink className="h-3.5 w-3.5" />}
                  </div>
                </div>
              )

              return notification.href ? (
                <Link key={notification.id} href={notification.href} onClick={() => void handleRead(notification)}>
                  {content}
                </Link>
              ) : (
                <button key={notification.id} type="button" onClick={() => void handleRead(notification)} className="block w-full">
                  {content}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
