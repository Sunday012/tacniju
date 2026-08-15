"use client"

import { useMemo, useState, useTransition } from "react"
import { CalendarDays, ClipboardCopy, FileText, Loader2, MapPin, Plus, ReceiptText, Users } from "lucide-react"
import { toast } from "sonner"
import {
  createMetroArea,
  createMetroEvent,
  createMetroMember,
  createMetroMemo,
  createMetroTransaction,
  saveMetroAttendance,
  saveMetroDues,
  updateMetroMemo,
} from "@/app/admin/metro/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

type Area = { id: string; name: string }
type Member = { id: string; full_name: string; sex: string | null; phone_number: string | null; area_id: string | null; area?: Area | null }
type Memo = { id: string; title: string; body: string; updated_at: string }
type Event = { id: string; name: string; event_date: string; description: string | null }
type Attendance = { event_id: string; member_id: string }
type Due = { event_id: string; member_id: string; amount: number }
type Transaction = {
  id: string
  event_id: string | null
  kind: "income" | "expense"
  title: string
  amount: number
  people_count: number
  notes: string | null
}

type WorkspaceData = {
  areas: Area[]
  members: Member[]
  memos: Memo[]
  events: Event[]
  attendance: Attendance[]
  dues: Due[]
  transactions: Transaction[]
}

const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 })

export function MetroSecretaryWorkspace({ data }: { data: WorkspaceData }) {
  const [isPending, startTransition] = useTransition()
  const [areaName, setAreaName] = useState("")
  const [memberForm, setMemberForm] = useState({ full_name: "", sex: "", area_id: "", phone_number: "" })
  const [memoForm, setMemoForm] = useState({ id: "", title: "", body: "" })
  const [eventForm, setEventForm] = useState({ name: "", event_date: new Date().toISOString().slice(0, 10), description: "" })
  const [selectedEventId, setSelectedEventId] = useState(data.events[0]?.id || "")
  const [duesAmount, setDuesAmount] = useState("0")
  const [accountForm, setAccountForm] = useState({
    event_id: data.events[0]?.id || "",
    kind: "income",
    title: "",
    amount: "",
    people_count: "",
    notes: "",
  })

  const selectedAttendance = useMemo(
    () => new Set(data.attendance.filter((item) => item.event_id === selectedEventId).map((item) => item.member_id)),
    [data.attendance, selectedEventId]
  )
  const selectedDues = useMemo(
    () => new Set(data.dues.filter((item) => item.event_id === selectedEventId).map((item) => item.member_id)),
    [data.dues, selectedEventId]
  )
  const [attendanceMarks, setAttendanceMarks] = useState<Set<string>>(selectedAttendance)
  const [duesMarks, setDuesMarks] = useState<Set<string>>(selectedDues)

  const membersByArea = useMemo(() => {
    const groups = data.areas.map((area) => ({ area, members: data.members.filter((member) => member.area_id === area.id) }))
    const unassigned = data.members.filter((member) => !member.area_id)
    return unassigned.length ? [...groups, { area: { id: "unassigned", name: "Unassigned" }, members: unassigned }] : groups
  }, [data.areas, data.members])

  const eventSummaries = useMemo(() => {
    return data.events.map((event) => {
      const attendanceCount = data.attendance.filter((item) => item.event_id === event.id).length
      const eventDues = data.dues.filter((item) => item.event_id === event.id)
      const transactions = data.transactions.filter((item) => item.event_id === event.id)
      const duesTotal = eventDues.reduce((sum, item) => sum + Number(item.amount || 0), 0)
      const income = transactions.filter((item) => item.kind === "income").reduce((sum, item) => sum + Number(item.amount || 0), 0)
      const expense = transactions.filter((item) => item.kind === "expense").reduce((sum, item) => sum + Number(item.amount || 0), 0)
      return { event, attendanceCount, duesCount: eventDues.length, duesTotal, income, expense, balance: duesTotal + income - expense }
    })
  }, [data.events, data.attendance, data.dues, data.transactions])

  function run(action: () => Promise<{ success: boolean; message?: string }>, success: string) {
    startTransition(async () => {
      const result = await action()
      if (result.success) toast.success(success)
      else toast.error(result.message || "Action failed")
    })
  }

  function syncEvent(eventId: string) {
    setSelectedEventId(eventId)
    setAccountForm((form) => ({ ...form, event_id: eventId }))
    setAttendanceMarks(new Set(data.attendance.filter((item) => item.event_id === eventId).map((item) => item.member_id)))
    setDuesMarks(new Set(data.dues.filter((item) => item.event_id === eventId).map((item) => item.member_id)))
  }

  function toggle(setter: (value: Set<string>) => void, source: Set<string>, id: string) {
    const next = new Set(source)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setter(next)
  }

  return (
    <Tabs defaultValue="summary" className="space-y-6">
      <TabsList className="h-auto flex flex-wrap justify-start bg-white border border-slate-200 p-1">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="attendance">Attendance</TabsTrigger>
        <TabsTrigger value="dues">Dues</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="members">Areas & Members</TabsTrigger>
        <TabsTrigger value="memos">Memos</TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Members" value={data.members.length.toString()} icon={Users} />
          <Stat label="Areas" value={data.areas.length.toString()} icon={MapPin} />
          <Stat label="Events" value={data.events.length.toString()} icon={CalendarDays} />
          <Stat label="Memos" value={data.memos.length.toString()} icon={FileText} />
        </div>
        <Card>
          <CardHeader><CardTitle>Event Summary</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Attendance</TableHead>
                  <TableHead className="text-center">Dues Paid</TableHead>
                  <TableHead className="text-right">Dues</TableHead>
                  <TableHead className="text-right">Income</TableHead>
                  <TableHead className="text-right">Expense</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventSummaries.map((item) => (
                  <TableRow key={item.event.id}>
                    <TableCell className="font-semibold">{item.event.name}</TableCell>
                    <TableCell>{new Date(item.event.event_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center">{item.attendanceCount}</TableCell>
                    <TableCell className="text-center">{item.duesCount}</TableCell>
                    <TableCell className="text-right">{money.format(item.duesTotal)}</TableCell>
                    <TableCell className="text-right">{money.format(item.income)}</TableCell>
                    <TableCell className="text-right">{money.format(item.expense)}</TableCell>
                    <TableCell className="text-right font-bold">{money.format(item.balance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="events">
        <Card>
          <CardHeader><CardTitle>Create Event</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_180px]">
            <Input placeholder="Rehearsal, meeting, programme..." value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} />
            <Input type="date" value={eventForm.event_date} onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })} />
            <Textarea className="md:col-span-2" placeholder="Theme, topic, or short description..." value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
            <Button disabled={isPending || !eventForm.name || !eventForm.event_date} onClick={() => run(() => createMetroEvent(eventForm), "Event created")}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Save Event
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="attendance">
        <ChecklistPanel
          title="Mark Attendance"
          selectedEventId={selectedEventId}
          events={data.events}
          groups={membersByArea}
          marks={attendanceMarks}
          onEventChange={syncEvent}
          onToggle={(id) => toggle(setAttendanceMarks, attendanceMarks, id)}
          onSave={() => run(() => saveMetroAttendance(selectedEventId, Array.from(attendanceMarks)), "Attendance saved")}
          disabled={isPending}
        />
      </TabsContent>

      <TabsContent value="dues">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Dues Amount</CardTitle></CardHeader>
            <CardContent className="max-w-xs">
              <Label>Amount per person</Label>
              <Input type="number" min="0" value={duesAmount} onChange={(e) => setDuesAmount(e.target.value)} />
            </CardContent>
          </Card>
          <ChecklistPanel
            title="Mark Dues Paid"
            selectedEventId={selectedEventId}
            events={data.events}
            groups={membersByArea}
            marks={duesMarks}
            onEventChange={syncEvent}
            onToggle={(id) => toggle(setDuesMarks, duesMarks, id)}
            onSave={() => run(() => saveMetroDues(selectedEventId, Array.from(duesMarks), Number(duesAmount || 0)), "Dues saved")}
            disabled={isPending}
          />
        </div>
      </TabsContent>

      <TabsContent value="account">
        <Card>
          <CardHeader><CardTitle>Income & Expenses</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-5">
              <Select value={accountForm.event_id || "none"} onValueChange={(value) => setAccountForm({ ...accountForm, event_id: value === "none" ? "" : value })}>
                <SelectTrigger><SelectValue placeholder="Event" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No event</SelectItem>
                  {data.events.map((event) => <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={accountForm.kind} onValueChange={(value) => setAccountForm({ ...accountForm, kind: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Title" value={accountForm.title} onChange={(e) => setAccountForm({ ...accountForm, title: e.target.value })} />
              <Input type="number" min="0" placeholder="Amount" value={accountForm.amount} onChange={(e) => setAccountForm({ ...accountForm, amount: e.target.value })} />
              <Input type="number" min="0" placeholder="People count" value={accountForm.people_count} onChange={(e) => setAccountForm({ ...accountForm, people_count: e.target.value })} />
              <Textarea className="md:col-span-5" placeholder="Notes" value={accountForm.notes} onChange={(e) => setAccountForm({ ...accountForm, notes: e.target.value })} />
              <Button
                disabled={isPending || !accountForm.title || !accountForm.amount}
                onClick={() => run(() => createMetroTransaction({
                  event_id: accountForm.event_id,
                  kind: accountForm.kind as "income" | "expense",
                  title: accountForm.title,
                  amount: Number(accountForm.amount || 0),
                  people_count: Number(accountForm.people_count || 0),
                  notes: accountForm.notes,
                }), "Account entry saved")}
              >
                <ReceiptText className="mr-2 h-4 w-4" />
                Save Entry
              </Button>
            </div>
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Count</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.transactions.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell><Badge variant={item.kind === "income" ? "default" : "destructive"}>{item.kind}</Badge></TableCell>
                    <TableCell>{item.people_count || "-"}</TableCell>
                    <TableCell className="text-right font-semibold">{money.format(Number(item.amount || 0))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="members" className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Areas</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Input className="max-w-xs" placeholder="Area name" value={areaName} onChange={(e) => setAreaName(e.target.value)} />
            <Button disabled={isPending || !areaName.trim()} onClick={() => run(() => createMetroArea(areaName), "Area created")}>Add Area</Button>
            {data.areas.map((area) => <Badge key={area.id} variant="secondary" className="px-3 py-1">{area.name}</Badge>)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Members</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <Input placeholder="Full name" value={memberForm.full_name} onChange={(e) => setMemberForm({ ...memberForm, full_name: e.target.value })} />
              <Select value={memberForm.sex || "none"} onValueChange={(value) => setMemberForm({ ...memberForm, sex: value === "none" ? "" : value })}>
                <SelectTrigger><SelectValue placeholder="Sex" /></SelectTrigger>
                <SelectContent><SelectItem value="none">Sex</SelectItem><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
              </Select>
              <Select value={memberForm.area_id || "none"} onValueChange={(value) => setMemberForm({ ...memberForm, area_id: value === "none" ? "" : value })}>
                <SelectTrigger><SelectValue placeholder="Area" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No area</SelectItem>
                  {data.areas.map((area) => <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Phone number" value={memberForm.phone_number} onChange={(e) => setMemberForm({ ...memberForm, phone_number: e.target.value })} />
              <Button disabled={isPending || !memberForm.full_name.trim()} onClick={() => run(() => createMetroMember(memberForm), "Member saved")}>Save Member</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {membersByArea.map((group) => (
                <div key={group.area.id} className="rounded-lg border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-4 py-3 font-semibold">{group.area.name}</div>
                  <div className="divide-y divide-slate-100">
                    {group.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                        <span className="font-medium">{member.full_name}</span>
                        <span className="text-slate-500">{member.phone_number || member.sex || ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="memos" className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader><CardTitle>{memoForm.id ? "Edit Memo" : "Create Memo"}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Memo title" value={memoForm.title} onChange={(e) => setMemoForm({ ...memoForm, title: e.target.value })} />
            <Textarea className="min-h-[360px] font-mono text-sm" placeholder="Write the memo here..." value={memoForm.body} onChange={(e) => setMemoForm({ ...memoForm, body: e.target.value })} />
            <div className="flex flex-wrap gap-2">
              <Button disabled={isPending || !memoForm.title.trim()} onClick={() => run(() => memoForm.id ? updateMetroMemo(memoForm.id, memoForm) : createMetroMemo(memoForm), "Memo saved")}>Save Memo</Button>
              <Button variant="outline" onClick={() => navigator.clipboard.writeText(`${memoForm.title}\n\n${memoForm.body}`).then(() => toast.success("Memo copied"))}>
                <ClipboardCopy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Saved Memos</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.memos.map((memo) => (
              <button key={memo.id} type="button" onClick={() => setMemoForm({ id: memo.id, title: memo.title, body: memo.body })} className="w-full rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50">
                <div className="font-semibold">{memo.title}</div>
                <div className="mt-1 line-clamp-2 text-xs text-slate-500">{memo.body}</div>
              </button>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <Icon className="h-6 w-6 text-indigo-500" />
      </CardContent>
    </Card>
  )
}

function ChecklistPanel({
  title,
  selectedEventId,
  events,
  groups,
  marks,
  disabled,
  onEventChange,
  onToggle,
  onSave,
}: {
  title: string
  selectedEventId: string
  events: Event[]
  groups: { area: Area; members: Member[] }[]
  marks: Set<string>
  disabled: boolean
  onEventChange: (eventId: string) => void
  onToggle: (memberId: string) => void
  onSave: () => void
}) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedEventId} onValueChange={onEventChange}>
            <SelectTrigger className="w-[260px]"><SelectValue placeholder="Select event" /></SelectTrigger>
            <SelectContent>
              {events.map((event) => <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button disabled={disabled || !selectedEventId} onClick={onSave}>Save {marks.size}</Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <div key={group.area.id} className="rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <span className="font-semibold">{group.area.name}</span>
              <Badge variant="secondary">{group.members.filter((member) => marks.has(member.id)).length}/{group.members.length}</Badge>
            </div>
            <div className="divide-y divide-slate-100">
              {group.members.map((member) => (
                <label key={member.id} className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50">
                  <Checkbox checked={marks.has(member.id)} onCheckedChange={() => onToggle(member.id)} />
                  <span className="font-medium">{member.full_name}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
