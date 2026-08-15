"use client"

import { useMemo, useState, useTransition } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  CalendarDays,
  ClipboardCopy,
  Edit3,
  Filter,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  Mic2,
  Plus,
  ReceiptText,
  Search,
  Trash2,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/client"
import {
  createMetroArea,
  createMetroEvent,
  createMetroMember,
  createMetroMemo,
  createMetroTransaction,
  deleteMetroArea,
  deleteMetroMember,
  saveMetroAttendance,
  saveMetroDues,
  updateMetroArea,
  updateMetroMember,
  updateMetroMemo,
} from "@/app/metro/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent } from "@/components/ui/tabs"
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
const logoUrl = "https://res.cloudinary.com/dzckvrvu9/image/upload/v1777993333/WhatsApp_Image_2026-05-01_at_08.37.56-removebg-preview_a8w3wt.png"
const metroPrimaryButton = "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 disabled:border disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"

const metroNavItems = [
  { value: "summary", label: "Summary", icon: LayoutDashboard },
  { value: "events", label: "Events", icon: CalendarDays },
  { value: "attendance", label: "Attendance", icon: Users },
  { value: "dues", label: "Dues", icon: ReceiptText },
  { value: "account", label: "Account", icon: FileText },
  { value: "members", label: "Areas & Members", icon: MapPin },
  { value: "memos", label: "Memos", icon: ClipboardCopy },
]

export function MetroSecretaryWorkspace({ data }: { data: WorkspaceData }) {
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("summary")
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const [membersView, setMembersView] = useState<"home" | "areas" | "members" | "areaDetail">("home")
  const [accountView, setAccountView] = useState<"home" | "events" | "dues" | "bank">("home")
  const [selectedAreaId, setSelectedAreaId] = useState("")
  const [eventSheetOpen, setEventSheetOpen] = useState(false)
  const [areaName, setAreaName] = useState("")
  const [editingAreaId, setEditingAreaId] = useState("")
  const [memberForm, setMemberForm] = useState({ full_name: "", sex: "", area_id: "", phone_number: "" })
  const [editingMemberId, setEditingMemberId] = useState("")
  const [memoForm, setMemoForm] = useState({ id: "", title: "", body: "" })
  const [eventForm, setEventForm] = useState({ name: "", event_date: new Date().toISOString().slice(0, 10), description: "" })
  const [selectedEventId, setSelectedEventId] = useState(data.events[0]?.id || "")
  const [duesAmounts, setDuesAmounts] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    const eventId = data.events[0]?.id || ""
    data.dues.filter((item) => item.event_id === eventId).forEach((item) => {
      initial[item.member_id] = String(item.amount || "")
    })
    return initial
  })
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
  const selectedAreaGroup = useMemo(
    () => membersByArea.find((group) => group.area.id === selectedAreaId) || null,
    [membersByArea, selectedAreaId]
  )

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
  const totalDues = useMemo(
    () => data.dues.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [data.dues]
  )
  const bankIncome = useMemo(
    () => data.transactions.filter((item) => item.kind === "income").reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [data.transactions]
  )
  const bankExpense = useMemo(
    () => data.transactions.filter((item) => item.kind === "expense").reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [data.transactions]
  )

  function run(action: () => Promise<{ success: boolean; message?: string }>, success: string) {
    startTransition(async () => {
      const result = await action()
      if (result.success) {
        toast.success(success)
        router.refresh()
      } else {
        toast.error(result.message || "Action failed")
      }
    })
  }

  function syncEvent(eventId: string) {
    setSelectedEventId(eventId)
    setAccountForm((form) => ({ ...form, event_id: eventId }))
    setAttendanceMarks(new Set(data.attendance.filter((item) => item.event_id === eventId).map((item) => item.member_id)))
    setDuesMarks(new Set(data.dues.filter((item) => item.event_id === eventId).map((item) => item.member_id)))
    const nextAmounts: Record<string, string> = {}
    data.dues.filter((item) => item.event_id === eventId).forEach((item) => {
      nextAmounts[item.member_id] = String(item.amount || "")
    })
    setDuesAmounts(nextAmounts)
  }

  function toggle(setter: (value: Set<string>) => void, source: Set<string>, id: string) {
    const next = new Set(source)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setter(next)
  }

  function handleDuesAmountChange(memberId: string, amount: string) {
    setDuesAmounts((current) => ({ ...current, [memberId]: amount }))
    setDuesMarks((current) => {
      const next = new Set(current)
      if (Number(amount || 0) > 0) next.add(memberId)
      else next.delete(memberId)
      return next
    })
  }

  function saveDuesForEvent() {
    const entries = Array.from(duesMarks).map((memberId) => ({
      member_id: memberId,
      amount: Number(duesAmounts[memberId] || 0),
    }))
    run(() => saveMetroDues(selectedEventId, entries), "Dues saved")
  }

  function resetAreaForm() {
    setAreaName("")
    setEditingAreaId("")
  }

  function resetMemberForm() {
    setMemberForm({ full_name: "", sex: "", area_id: "", phone_number: "" })
    setEditingMemberId("")
  }

  function handleSaveArea() {
    const trimmedName = areaName.trim()
    if (!trimmedName) return

    run(
      () => editingAreaId ? updateMetroArea(editingAreaId, trimmedName) : createMetroArea(trimmedName),
      editingAreaId ? "Area updated" : "Area created"
    )
    resetAreaForm()
  }

  function handleEditArea(area: Area) {
    setMembersView("areas")
    setEditingAreaId(area.id)
    setAreaName(area.name)
  }

  function openAreaMembers(areaId: string) {
    setSelectedAreaId(areaId)
    setMembersView("areaDetail")
  }

  function handleDeleteArea(area: Area) {
    if (!confirm(`Delete ${area.name}? Members in this area will become unassigned.`)) return
    run(() => deleteMetroArea(area.id), "Area deleted")
    if (editingAreaId === area.id) resetAreaForm()
  }

  function handleSaveMember() {
    if (!memberForm.full_name.trim()) return

    run(
      () => editingMemberId ? updateMetroMember(editingMemberId, memberForm) : createMetroMember(memberForm),
      editingMemberId ? "Member updated" : "Member saved"
    )
    resetMemberForm()
  }

  function handleSaveEvent() {
    if (!eventForm.name || !eventForm.event_date) return
    run(() => createMetroEvent(eventForm), "Event created")
    setEventForm({ name: "", event_date: new Date().toISOString().slice(0, 10), description: "" })
    setEventSheetOpen(false)
  }

  function handleEditMember(member: Member) {
    setMembersView("members")
    setEditingMemberId(member.id)
    setMemberForm({
      full_name: member.full_name,
      sex: member.sex || "",
      area_id: member.area_id || "",
      phone_number: member.phone_number || "",
    })
  }

  function handleDeleteMember(member: Member) {
    if (!confirm(`Delete ${member.full_name}? This will remove their attendance and dues records too.`)) return
    run(() => deleteMetroMember(member.id), "Member deleted")
    if (editingMemberId === member.id) resetMemberForm()
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    await fetch("/api/auth/signout", { method: "POST" })
    router.push("/select-church")
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-screen bg-[#F4F7FA] text-slate-900">
      <MetroSidebar activeTab={activeTab} onTabChange={setActiveTab} onSignOut={handleSignOut} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-indigo-100/50 bg-white/75 px-5 py-4 shadow-sm backdrop-blur-2xl lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm">
                <Image src={logoUrl} alt="TACN Logo" width={80} height={32} className="h-full w-full object-contain" />
              </div>
              <div>
                <h1 className="text-base font-extrabold leading-tight text-slate-900">Metro Choir</h1>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Secretary</p>
              </div>
            </div>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-700">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex h-dvh w-[280px] flex-col border-r border-slate-100 bg-white p-0">
                <SheetHeader className="border-b border-slate-100 bg-gradient-to-br from-indigo-600 to-violet-700 p-6">
                  <SheetTitle className="flex items-center gap-3 text-left text-white">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                      <Mic2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-extrabold leading-tight">Metro Choir</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Secretary Workspace</p>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <MetroNav activeTab={activeTab} onTabChange={(value) => { setActiveTab(value); setMobileOpen(false) }} onSignOut={handleSignOut} />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10">
          <div className="mx-auto max-w-7xl space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Metro Youth Choir</h1>
              <p className="mt-2 text-slate-600">Secretary workspace for memos, members, events, attendance, dues, and account summaries.</p>
            </div>

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

      <TabsContent value="events" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Events</h2>
            <p className="text-sm text-slate-500">Created events appear here and can be used for attendance, dues, and account records.</p>
          </div>
          <Sheet open={eventSheetOpen} onOpenChange={setEventSheetOpen}>
            <SheetTrigger asChild>
              <Button className={metroPrimaryButton}>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Create Event</SheetTitle>
              </SheetHeader>
              <div className="mt-8 space-y-4">
                <div className="space-y-2">
                  <Label>Event Name</Label>
                  <Input placeholder="Rehearsal, meeting, programme..." value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Event Date</Label>
                  <Input type="date" value={eventForm.event_date} onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description / Theme</Label>
                  <Textarea className="min-h-[140px]" placeholder="Theme, topic, or short description..." value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
                </div>
                <Button className={metroPrimaryButton} disabled={isPending || !eventForm.name || !eventForm.event_date} onClick={handleSaveEvent}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Save Event
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Card>
          <CardHeader><CardTitle>Event List</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description / Theme</TableHead>
                  <TableHead className="text-center">Attendance</TableHead>
                  <TableHead className="text-center">Dues Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventSummaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-slate-400">No events created yet.</TableCell>
                  </TableRow>
                ) : eventSummaries.map((item) => (
                  <TableRow key={item.event.id}>
                    <TableCell className="font-semibold">{item.event.name}</TableCell>
                    <TableCell>{new Date(item.event.event_date).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-md truncate text-slate-500">{item.event.description || "-"}</TableCell>
                    <TableCell className="text-center">{item.attendanceCount}</TableCell>
                    <TableCell className="text-center">{item.duesCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
        <ChecklistPanel
          title="Mark Dues Paid"
          selectedEventId={selectedEventId}
          events={data.events}
          groups={membersByArea}
          marks={duesMarks}
          duesAmounts={duesAmounts}
          mode="dues"
          onAmountChange={handleDuesAmountChange}
          onEventChange={syncEvent}
          onToggle={(id) => toggle(setDuesMarks, duesMarks, id)}
          onSave={saveDuesForEvent}
          disabled={isPending}
        />
      </TabsContent>

      <TabsContent value="account">
        {accountView === "home" && (
          <div className="grid gap-5 md:grid-cols-3">
            <button
              type="button"
              onClick={() => setAccountView("events")}
              className="rounded-lg border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Account</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Events</h2>
                  <p className="mt-2 text-sm text-slate-500">See everything tied to each event in one place.</p>
                </div>
                <CalendarDays className="h-7 w-7 text-indigo-500" />
              </div>
              <p className="mt-6 text-2xl font-bold text-slate-900">{data.events.length} Events</p>
            </button>

            <button
              type="button"
              onClick={() => setAccountView("dues")}
              className="rounded-lg border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Account</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Dues</h2>
                  <p className="mt-2 text-sm text-slate-500">View dues recorded from the Dues page.</p>
                </div>
                <ReceiptText className="h-7 w-7 text-indigo-500" />
              </div>
              <p className="mt-6 text-2xl font-bold text-slate-900">{money.format(totalDues)}</p>
            </button>

            <button
              type="button"
              onClick={() => setAccountView("bank")}
              className="rounded-lg border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Account</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Bank</h2>
                  <p className="mt-2 text-sm text-slate-500">Record money that entered or left the account.</p>
                </div>
                <FileText className="h-7 w-7 text-indigo-500" />
              </div>
              <p className="mt-6 text-2xl font-bold text-slate-900">{money.format(totalDues + bankIncome - bankExpense)}</p>
            </button>
          </div>
        )}

        {accountView === "events" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Events Account</h2>
                <p className="text-sm text-slate-500">Attendance, dues, income, and expenses grouped by event.</p>
              </div>
              <Button variant="outline" onClick={() => setAccountView("home")}>Back</Button>
            </div>
            <Card>
              <CardHeader><CardTitle>Event Records</CardTitle></CardHeader>
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
                      <TableHead className="text-right">Expenses</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventSummaries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-8 text-center text-slate-400">No event records yet.</TableCell>
                      </TableRow>
                    ) : eventSummaries.map((item) => (
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
          </div>
        )}

        {accountView === "dues" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Dues Account</h2>
                <p className="text-sm text-slate-500">These records come from the Dues page.</p>
              </div>
              <Button variant="outline" onClick={() => setAccountView("home")}>Back</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Stat label="Dues Total" value={money.format(totalDues)} icon={ReceiptText} />
              <Stat label="People Paid" value={data.dues.length.toString()} icon={Users} />
              <Stat label="Events" value={new Set(data.dues.map((item) => item.event_id)).size.toString()} icon={CalendarDays} />
            </div>
            <Card>
              <CardHeader><CardTitle>Dues Records</CardTitle></CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.dues.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-slate-400">No dues recorded yet.</TableCell>
                      </TableRow>
                    ) : data.dues.map((due) => {
                      const event = data.events.find((item) => item.id === due.event_id)
                      const member = data.members.find((item) => item.id === due.member_id)
                      return (
                        <TableRow key={`${due.event_id}-${due.member_id}`}>
                          <TableCell className="font-semibold">{event?.name || "Unknown event"}</TableCell>
                          <TableCell>{member?.full_name || "Unknown member"}</TableCell>
                          <TableCell>{member?.area?.name || "No area"}</TableCell>
                          <TableCell className="text-right font-semibold">{money.format(Number(due.amount || 0))}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {accountView === "bank" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Bank Account</h2>
                <p className="text-sm text-slate-500">Dues plus income, minus expenses.</p>
              </div>
              <Button variant="outline" onClick={() => setAccountView("home")}>Back</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <Stat label="Dues" value={money.format(totalDues)} icon={ReceiptText} />
              <Stat label="Income" value={money.format(bankIncome)} icon={FileText} />
              <Stat label="Expenses" value={money.format(bankExpense)} icon={FileText} />
              <Stat label="Balance" value={money.format(totalDues + bankIncome - bankExpense)} icon={FileText} />
            </div>
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
                    className={metroPrimaryButton}
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
          </div>
        )}
      </TabsContent>

      <TabsContent value="members" className="space-y-4">
        {membersView === "home" && (
          <div className="grid gap-5 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setMembersView("areas")}
              className="group rounded-lg border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Manage</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Areas</h2>
                  <p className="mt-2 text-sm text-slate-500">Create areas and view each area's membership list.</p>
                </div>
                <MapPin className="h-7 w-7 text-indigo-500" />
              </div>
              <Badge className="mt-6 bg-indigo-50 text-indigo-700 hover:bg-indigo-50">{data.areas.length} Areas</Badge>
            </button>

            <button
              type="button"
              onClick={() => setMembersView("members")}
              className="group rounded-lg border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Manage</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Members</h2>
                  <p className="mt-2 text-sm text-slate-500">Add, edit, delete, and assign choir members to areas.</p>
                </div>
                <Users className="h-7 w-7 text-indigo-500" />
              </div>
              <Badge className="mt-6 bg-indigo-50 text-indigo-700 hover:bg-indigo-50">{data.members.length} Members</Badge>
            </button>
          </div>
        )}

        {membersView === "areas" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Areas</h2>
                <p className="text-sm text-slate-500">Each area shows its membership list.</p>
              </div>
              <Button variant="outline" onClick={() => { resetAreaForm(); setSelectedAreaId(""); setMembersView("home") }}>Back</Button>
            </div>

            <Card>
              <CardHeader><CardTitle>{editingAreaId ? "Edit Area" : "Create Area"}</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Input className="max-w-sm" placeholder="Area name" value={areaName} onChange={(e) => setAreaName(e.target.value)} />
                <Button className={metroPrimaryButton} disabled={isPending || !areaName.trim()} onClick={handleSaveArea}>
                  {editingAreaId ? "Update Area" : "Add Area"}
                </Button>
                {editingAreaId && <Button variant="outline" onClick={resetAreaForm}>Cancel Edit</Button>}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {membersByArea.map((group) => (
                <div
                  key={group.area.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openAreaMembers(group.area.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") openAreaMembers(group.area.id)
                  }}
                  className="cursor-pointer rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3 px-4 py-4">
                    <div>
                      <h3 className="font-bold text-slate-900">{group.area.name}</h3>
                      <p className="text-xs text-slate-500">{group.members.length} {group.members.length === 1 ? "member" : "members"}</p>
                    </div>
                    {group.area.id !== "unassigned" && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-700"
                          onClick={(event) => { event.stopPropagation(); handleEditArea(group.area) }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                          onClick={(event) => { event.stopPropagation(); handleDeleteArea(group.area) }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {membersView === "areaDetail" && selectedAreaGroup && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">{selectedAreaGroup.area.name}</h2>
                <p className="text-sm text-slate-500">{selectedAreaGroup.members.length} {selectedAreaGroup.members.length === 1 ? "member" : "members"} in this area.</p>
              </div>
              <Button variant="outline" onClick={() => { setSelectedAreaId(""); setMembersView("areas") }}>Back to Areas</Button>
            </div>

            <Card>
              <CardHeader><CardTitle>Membership List</CardTitle></CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Sex</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedAreaGroup.members.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-slate-400">No members in this area yet.</TableCell>
                      </TableRow>
                    ) : selectedAreaGroup.members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-semibold">{member.full_name}</TableCell>
                        <TableCell>{member.sex || "-"}</TableCell>
                        <TableCell>{member.phone_number || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-700" onClick={() => handleEditMember(member)}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteMember(member)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {membersView === "members" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Members</h2>
                <p className="text-sm text-slate-500">Create members manually and assign each person to an area.</p>
              </div>
              <Button variant="outline" onClick={() => { resetMemberForm(); setMembersView("home") }}>Back</Button>
            </div>

            <Card>
              <CardHeader><CardTitle>{editingMemberId ? "Edit Member" : "Create Member"}</CardTitle></CardHeader>
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
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button className={metroPrimaryButton} disabled={isPending || !memberForm.full_name.trim()} onClick={handleSaveMember}>
                    {editingMemberId ? "Update Member" : "Save Member"}
                  </Button>
                  {editingMemberId && <Button variant="outline" onClick={resetMemberForm}>Cancel Edit</Button>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Membership List</CardTitle></CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Sex</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-semibold">{member.full_name}</TableCell>
                        <TableCell>{member.sex || "-"}</TableCell>
                        <TableCell>{member.area?.name || "No area"}</TableCell>
                        <TableCell>{member.phone_number || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-700" onClick={() => handleEditMember(member)}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteMember(member)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>

      <TabsContent value="memos" className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader><CardTitle>{memoForm.id ? "Edit Memo" : "Create Memo"}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Memo title" value={memoForm.title} onChange={(e) => setMemoForm({ ...memoForm, title: e.target.value })} />
            <Textarea className="min-h-[360px] font-mono text-sm" placeholder="Write the memo here..." value={memoForm.body} onChange={(e) => setMemoForm({ ...memoForm, body: e.target.value })} />
            <div className="flex flex-wrap gap-2">
              <Button className={metroPrimaryButton} disabled={isPending || !memoForm.title.trim()} onClick={() => run(() => memoForm.id ? updateMetroMemo(memoForm.id, memoForm) : createMetroMemo(memoForm), "Memo saved")}>Save Memo</Button>
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
          </div>
        </main>
      </div>
    </Tabs>
  )
}

function MetroSidebar({
  activeTab,
  onTabChange,
  onSignOut,
}: {
  activeTab: string
  onTabChange: (value: string) => void
  onSignOut: () => void
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-[#E5E7EB]/50 bg-white/60 px-5 py-8 shadow-[4px_0_24px_rgba(0,0,0,0.02)] backdrop-blur-2xl lg:flex">
      <div className="mb-10 flex items-center gap-4 px-2">
        <div className="flex h-11 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm">
          <Image src={logoUrl} alt="TACN Logo" width={80} height={32} className="h-full w-full object-contain" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold leading-tight tracking-tight text-slate-900">Metro</h2>
          <p className="mt-0.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Secretary</p>
        </div>
      </div>

      <MetroNav activeTab={activeTab} onTabChange={onTabChange} onSignOut={onSignOut} />
    </aside>
  )
}

function MetroNav({
  activeTab,
  onTabChange,
  onSignOut,
}: {
  activeTab: string
  onTabChange: (value: string) => void
  onSignOut: () => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-5 lg:p-0">
      <div className="flex-1 space-y-6">
        <div>
          <p className="mb-2 px-3 text-xs font-bold uppercase tracking-widest text-slate-400/80">Workspace</p>
          <div className="space-y-1">
            {metroNavItems.map((item) => {
              const Icon = item.icon
              const active = activeTab === item.value
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onTabChange(item.value)}
                  className={`flex w-full items-center gap-3.5 rounded-lg px-4 py-2.5 text-left text-sm tracking-wide transition-all ${
                    active
                      ? "bg-indigo-600/10 font-semibold text-indigo-700"
                      : "font-medium text-slate-500 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <p className="mb-2 px-3 text-xs font-bold uppercase tracking-widest text-slate-400/80">Quick Links</p>
        <div className="space-y-1">
          <button type="button" onClick={onSignOut} className="flex w-full items-center gap-3.5 rounded-lg px-4 py-2.5 text-left text-sm font-medium tracking-wide text-slate-500 hover:bg-slate-100/80 hover:text-slate-900">
            <LogOut className="h-5 w-5 text-slate-400" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
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
  duesAmounts,
  mode = "attendance",
  disabled,
  onAmountChange,
  onEventChange,
  onToggle,
  onSave,
}: {
  title: string
  selectedEventId: string
  events: Event[]
  groups: { area: Area; members: Member[] }[]
  marks: Set<string>
  duesAmounts?: Record<string, string>
  mode?: "attendance" | "dues"
  disabled: boolean
  onAmountChange?: (memberId: string, amount: string) => void
  onEventChange: (eventId: string) => void
  onToggle: (memberId: string) => void
  onSave: () => void
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [areaFilter, setAreaFilter] = useState("all")

  const rows = useMemo(
    () => groups.flatMap((group) => group.members.map((member) => ({ member, area: group.area }))),
    [groups]
  )
  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return rows.filter(({ member, area }) => {
      const matchesArea = areaFilter === "all" || area.id === areaFilter
      const searchable = [
        member.full_name,
        member.sex || "",
        member.phone_number || "",
        area.name,
      ].join(" ").toLowerCase()

      return matchesArea && (!normalizedSearch || searchable.includes(normalizedSearch))
    })
  }, [areaFilter, rows, searchTerm])

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
          <Button className={metroPrimaryButton} disabled={disabled || !selectedEventId} onClick={onSave}>Save {marks.size}</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-10"
                placeholder="Search members by name, phone, sex, or area..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <SelectValue placeholder="Filter by area" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.area.id} value={group.area.id}>{group.area.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Mark</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Phone</TableHead>
                {mode === "dues" && <TableHead className="w-40 text-right">Amount</TableHead>}
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={mode === "dues" ? 7 : 6} className="py-8 text-center text-slate-400">No members match this filter.</TableCell>
                </TableRow>
              ) : filteredRows.map(({ member, area }) => {
                const checked = marks.has(member.id)
                return (
                  <TableRow key={member.id} className="hover:bg-slate-50">
                    <TableCell>
                      <Checkbox checked={checked} onCheckedChange={() => onToggle(member.id)} />
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">{member.full_name}</TableCell>
                    <TableCell>{member.sex || "-"}</TableCell>
                    <TableCell>{area.name}</TableCell>
                    <TableCell>{member.phone_number || "-"}</TableCell>
                    {mode === "dues" && (
                      <TableCell className="text-right">
                        <Input
                          className="ml-auto h-9 w-32 text-right"
                          type="number"
                          min="0"
                          placeholder="0"
                          value={duesAmounts?.[member.id] || ""}
                          onChange={(event) => onAmountChange?.(member.id, event.target.value)}
                        />
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <Badge variant={checked ? "default" : "secondary"}>{checked ? "Selected" : "Not selected"}</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
