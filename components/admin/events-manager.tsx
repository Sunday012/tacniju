"use client"

import { useState, useEffect, useTransition } from "react"
import { getEventsWithAttendance, createEvent, deleteEvent } from "@/app/admin/events/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Plus, ScanLine, Trash2, Loader2, Users } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { format, parseISO, isToday, isFuture } from "date-fns"

interface Event {
  id: string
  name: string
  description: string | null
  event_date: string
  created_at: string
  attendance_count?: number
}

export function EventsManager() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: "", description: "", event_date: "" })

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const data = await getEventsWithAttendance()
      setEvents(data)
    } catch (err: any) {
      toast.error("Failed to load events")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleCreate = async () => {
    if (!form.name || !form.event_date) {
      toast.error("Event name and date are required.")
      return
    }

    setCreating(true)
    const result = await createEvent(form.name, form.description, form.event_date)
    if (!result.success) {
      toast.error("Failed to create event: " + result.message)
    } else {
      toast.success(`Event "${form.name}" created!`)
      setForm({ name: "", description: "", event_date: "" })
      setOpen(false)
      fetchEvents()
    }
    setCreating(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return
    const result = await deleteEvent(id)
    if (!result.success) {
      toast.error("Failed to delete: " + result.message)
    } else {
      toast.success("Event deleted.")
      setEvents((prev) => prev.filter((e) => e.id !== id))
    }
  }

  const getStatusBadge = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Today</Badge>
    if (isFuture(date)) return <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-100">Upcoming</Badge>
    return <Badge variant="secondary" className="text-slate-500">Past</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Events</h2>
          <p className="text-sm text-slate-500 mt-0.5">Create events and launch attendance scanners.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-indigo-600" />
                Create New Event
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="event-name">Event Name *</Label>
                <Input
                  id="event-name"
                  placeholder="e.g. Sunday Worship Service"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="event-date">Event Date *</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={form.event_date}
                  onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="event-desc">Description (Optional)</Label>
                <Textarea
                  id="event-desc"
                  placeholder="Brief description of the event..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreate} disabled={creating} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {creating ? "Creating..." : "Create Event"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events Table */}
      <Card className="border-slate-200/80 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mr-3" />
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
              <CalendarDays className="h-12 w-12 text-slate-200" />
              <p className="font-medium text-slate-500">No events yet</p>
              <p className="text-sm">Create your first event to start tracking attendance.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-semibold text-slate-600">Event</TableHead>
                  <TableHead className="font-semibold text-slate-600">Date</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-center">Attendance</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-semibold text-slate-800">{event.name}</p>
                        {event.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{event.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium">
                      {format(parseISO(event.event_date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>{getStatusBadge(event.event_date)}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                        <Users className="h-4 w-4 text-slate-400" />
                        {event.attendance_count}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/events/${event.id}`}>
                          <Button size="sm" variant="outline" className="gap-1.5 text-slate-600">
                            <Users className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                        </Link>
                        <Link href={`/admin/scanner?eventId=${event.id}&eventName=${encodeURIComponent(event.name)}`}>
                          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
                            <ScanLine className="h-3.5 w-3.5" />
                            Scan
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(event.id, event.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
