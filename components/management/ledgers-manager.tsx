"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createLedger, updateLedger, deleteLedger, AccountGroup, Ledger } from "@/app/management/actions"

type LedgerRow = Ledger & {
    account_groups?: {
        name: string
    } | null
}

export function LedgersManager({ ledgers, groups }: { ledgers: LedgerRow[], groups: AccountGroup[] }) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [name, setName] = useState("")
    const [groupId, setGroupId] = useState("")
    const [openingBalance, setOpeningBalance] = useState("0")
    const [balanceType, setBalanceType] = useState<"Dr" | "Cr">("Dr")
    const [isCashBank, setIsCashBank] = useState(false)
    const [description, setDescription] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    function resetForm() {
        setEditId(null)
        setName("")
        setGroupId("")
        setOpeningBalance("0")
        setBalanceType("Dr")
        setIsCashBank(false)
        setDescription("")
    }

    function openCreate() {
        resetForm()
        setIsOpen(true)
    }

    function openEdit(ledger: LedgerRow) {
        setEditId(ledger.id)
        setName(ledger.name)
        setGroupId(ledger.group_id)
        setOpeningBalance(String(ledger.opening_balance ?? 0))
        setBalanceType(ledger.balance_type)
        setIsCashBank(Boolean(ledger.is_cash_bank))
        setDescription(ledger.description || "")
        setIsOpen(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!groupId) {
            toast.error("Please select a group for this ledger.")
            return
        }

        setIsSubmitting(true)
        try {
            const payload = {
                group_id: groupId,
                name,
                opening_balance: Number(openingBalance) || 0,
                balance_type: balanceType,
                is_cash_bank: isCashBank,
                description: description || null,
                account_number: null,
                bank_name: null,
                contact_person: null,
                phone_number: null,
                email: null,
                address: null,
                tax_id: null,
                custom_data: {},
                active: true,
            }

            if (editId) {
                await updateLedger(editId, payload)
                toast.success("Ledger updated")
            } else {
                await createLedger(payload)
                toast.success("Ledger created")
            }

            setIsOpen(false)
            resetForm()
            router.refresh()
        } catch (error: any) {
            toast.error(error?.message || "Failed to save ledger")
            console.error("Failed to save ledger", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleDelete(ledger: LedgerRow) {
        if (!confirm(`Are you sure you want to delete ledger "${ledger.name}"?`)) return

        setIsSubmitting(true)
        try {
            const result = await deleteLedger(ledger.id)

            if (!result.success) {
                toast.error(result.error)
                return
            }

            toast.success("Ledger deleted")
            router.refresh()
        } catch (error: any) {
            toast.error(error?.message || "Failed to delete ledger")
            console.error("Failed to delete ledger", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-xl">Ledgers</CardTitle>
                    <CardDescription>Create and manage the ledgers used in vouchers.</CardDescription>
                </div>
                <Dialog
                    open={isOpen}
                    onOpenChange={(open) => {
                        setIsOpen(open)
                        if (!open) resetForm()
                    }}
                >
                    <DialogTrigger asChild>
                        <Button size="sm" onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-500">+ New Ledger</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-50 border-slate-200 text-slate-900 max-w-xl">
                        <DialogHeader>
                            <DialogTitle>{editId ? "Edit Ledger" : "Create Ledger"}</DialogTitle>
                            <DialogDescription>
                                {editId ? "Update an existing ledger." : "Add a ledger that can be selected in vouchers."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Ledger Name</Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} required className="bg-white border-slate-300" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Group</Label>
                                    <Select value={groupId} onValueChange={setGroupId}>
                                        <SelectTrigger className="bg-white border-slate-300">
                                            <SelectValue placeholder="Select a group" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-slate-300 text-slate-900">
                                            {groups.map((group) => (
                                                <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Balance Type</Label>
                                    <Select value={balanceType} onValueChange={(value: "Dr" | "Cr") => setBalanceType(value)}>
                                        <SelectTrigger className="bg-white border-slate-300">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-slate-300 text-slate-900">
                                            <SelectItem value="Dr">Dr</SelectItem>
                                            <SelectItem value="Cr">Cr</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Opening Balance</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={openingBalance}
                                        onChange={(e) => setOpeningBalance(e.target.value)}
                                        className="bg-white border-slate-300"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Ledger Type</Label>
                                    <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={isCashBank}
                                            onChange={(e) => setIsCashBank(e.target.checked)}
                                            className="h-4 w-4"
                                        />
                                        Cash/Bank Ledger
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white border-slate-300" placeholder="Optional" />
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500">
                                    {editId ? "Save Changes" : "Create Ledger"}
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
                            <TableHead className="text-slate-500">Ledger</TableHead>
                            <TableHead className="text-slate-500">Group</TableHead>
                            <TableHead className="text-slate-500">Type</TableHead>
                            <TableHead className="text-slate-500">Opening</TableHead>
                            <TableHead className="text-right text-slate-500">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ledgers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-slate-500 py-6">
                                    No ledgers found yet. Create one to use it in vouchers.
                                </TableCell>
                            </TableRow>
                        ) : (
                            ledgers.map((ledger) => (
                                <TableRow key={ledger.id} className="border-slate-200">
                                    <TableCell className="font-medium text-slate-800">{ledger.name}</TableCell>
                                    <TableCell className="text-slate-500">{ledger.account_groups?.name || groups.find((group) => group.id === ledger.group_id)?.name || "-"}</TableCell>
                                    <TableCell className="text-slate-500">{ledger.is_cash_bank ? "Cash/Bank" : ledger.balance_type}</TableCell>
                                    <TableCell className="text-slate-500">{Number(ledger.opening_balance || 0).toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => openEdit(ledger)} className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(ledger)}
                                                disabled={isSubmitting}
                                                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                title={`Delete ${ledger.name}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
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
