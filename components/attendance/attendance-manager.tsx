"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { saveAttendance, deleteAttendance } from "@/app/dashboard/attendance/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

export function AttendanceManager({ data }: { data: any[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
    const [serviceName, setServiceName] = useState("Sunday Service")
    const [men, setMen] = useState("0")
    const [women, setWomen] = useState("0")
    const [children, setChildren] = useState("0")
    const [notes, setNotes] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            await saveAttendance({
                date,
                service_name: serviceName,
                men_count: parseInt(men, 10) || 0,
                women_count: parseInt(women, 10) || 0,
                children_count: parseInt(children, 10) || 0,
                notes
            })

            toast.success("Attendance recorded successfully")
            setIsOpen(false)
            setMen("0")
            setWomen("0")
            setChildren("0")
            setNotes("")
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to save attendance")
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleDelete(record: any) {
        if (!confirm(`Are you sure you want to delete the ${record.service_name} attendance record for ${new Date(record.date).toLocaleDateString()}?`)) {
            return
        }

        setIsSubmitting(true)
        try {
            await deleteAttendance(record.id)
            toast.success("Attendance record deleted")
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to delete attendance")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-xl">Service Attendance</CardTitle>
                    <CardDescription>Record and view congregational attendance.</CardDescription>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500">Record Attendance</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-50 border-slate-200 text-slate-900 max-w-md">
                        <DialogHeader>
                            <DialogTitle>Record Service Attendance</DialogTitle>
                            <DialogDescription>Enter the headcount for a given service.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} required className="bg-white border-slate-300" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Service / Event Name</Label>
                                    <Input value={serviceName} onChange={e => setServiceName(e.target.value)} required className="bg-white border-slate-300" placeholder="e.g. Sunday Service, Bible Study" />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-2">
                                        <Label>Men</Label>
                                        <Input type="number" min="0" value={men} onChange={e => setMen(e.target.value)} className="bg-white border-slate-300 font-mono" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Women</Label>
                                        <Input type="number" min="0" value={women} onChange={e => setWomen(e.target.value)} className="bg-white border-slate-300 font-mono" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Children</Label>
                                        <Input type="number" min="0" value={children} onChange={e => setChildren(e.target.value)} className="bg-white border-slate-300 font-mono" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Notes (Optional)</Label>
                                    <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="bg-white border-slate-300 resize-none h-20" />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 w-full">
                                    {isSubmitting ? "Saving..." : "Save Attendance"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-200">
                            <TableHead className="text-slate-500">Date</TableHead>
                            <TableHead className="text-slate-500">Service</TableHead>
                            <TableHead className="text-slate-500 text-center">Men</TableHead>
                            <TableHead className="text-slate-500 text-center">Women</TableHead>
                            <TableHead className="text-slate-500 text-center">Children</TableHead>
                            <TableHead className="text-slate-500 text-right font-bold">Total</TableHead>
                            <TableHead className="text-right text-slate-500">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-slate-500 py-6">No attendance records found.</TableCell>
                            </TableRow>
                        ) : (
                            data.map((record) => (
                                <TableRow key={record.id} className="border-slate-200">
                                    <TableCell className="text-slate-700">{new Date(record.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium text-slate-800">{record.service_name}</TableCell>
                                    <TableCell className="text-center text-slate-500">{record.men_count || 0}</TableCell>
                                    <TableCell className="text-center text-slate-500">{record.women_count || 0}</TableCell>
                                    <TableCell className="text-center text-slate-500">{record.children_count || 0}</TableCell>
                                    <TableCell className="text-right font-bold text-emerald-400">
                                        {record.total_count || ((record.men_count || 0) + (record.women_count || 0) + (record.children_count || 0))}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(record)}
                                            disabled={isSubmitting}
                                            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            title={`Delete ${record.service_name}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
