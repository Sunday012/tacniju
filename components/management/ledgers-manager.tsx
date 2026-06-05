"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Landmark, Layers3, Loader2, Plus, Printer, Shield, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

type LedgersManagerMode = "accounts" | "banks"

export function LedgersManager({ ledgers, groups, mode = "accounts", hideTitle = false }: { ledgers: LedgerRow[], groups: AccountGroup[], mode?: LedgersManagerMode, hideTitle?: boolean }) {
    const isBankMode = mode === "banks"
    const pageTitle = isBankMode ? "Bank Accounts" : "Ledgers"
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [name, setName] = useState("")
    const [groupId, setGroupId] = useState("")
    const [openingBalance, setOpeningBalance] = useState("0")
    const [balanceType, setBalanceType] = useState<"Dr" | "Cr">("Dr")
    const [isCashBank, setIsCashBank] = useState(isBankMode)
    const [description, setDescription] = useState("")
    const [bankName, setBankName] = useState("")
    const [accountNumber, setAccountNumber] = useState("")
    const [contactPerson, setContactPerson] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const visibleLedgers = ledgers.filter(l => {
        if (isBankMode) return Boolean(l.is_cash_bank) || l.ledger_kind === "bank"
        return !l.is_cash_bank && l.ledger_kind !== "party"
    })
    const groupedLedgers = visibleLedgers.filter((ledger) => ledger.group_id).length
    const debitLedgers = visibleLedgers.filter((ledger) => ledger.balance_type === "Dr").length
    const creditLedgers = visibleLedgers.filter((ledger) => ledger.balance_type === "Cr").length

    function resetForm() {
        setEditId(null)
        setName("")
        setGroupId("")
        setOpeningBalance("0")
        setBalanceType("Dr")
        setIsCashBank(isBankMode)
        setDescription("")
        setBankName("")
        setAccountNumber("")
        setContactPerson("")
        setPhoneNumber("")
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
        setBankName(ledger.bank_name || "")
        setAccountNumber(ledger.account_number || "")
        setContactPerson(ledger.contact_person || "")
        setPhoneNumber(ledger.phone_number || "")
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
            const payload: Omit<Ledger, "id"> = {
                group_id: groupId,
                name,
                opening_balance: Number(openingBalance) || 0,
                balance_type: balanceType,
                is_cash_bank: isBankMode ? true : isCashBank,
                ledger_kind: isBankMode ? "bank" : "ledger",
                source_context: "accounting",
                source_profile_id: null,
                description: description || null,
                account_number: isBankMode ? (accountNumber || null) : null,
                bank_name: isBankMode ? (bankName || null) : null,
                contact_person: isBankMode ? (contactPerson || null) : null,
                phone_number: isBankMode ? (phoneNumber || null) : null,
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
        <div className="space-y-8">
            <div className="relative overflow-hidden rounded-3xl border border-indigo-700/40 bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 p-8 shadow-[0_20px_40px_-15px_rgba(49,46,129,0.4)]">
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-10 pointer-events-none">
                    <Shield className="h-72 w-72 text-white" />
                </div>
                <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-lg backdrop-blur-md">
                            {isBankMode ? <Landmark className="h-8 w-8" /> : <CreditCard className="h-8 w-8" />}
                        </div>
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80">
                                Accounts Info
                            </div>
                            {!hideTitle && <p className="text-sm font-semibold text-indigo-100/85">{isBankMode ? "Banking directory" : "Ledger register"}</p>}
                            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{pageTitle}</h1>
                            <p className="mt-1.5 text-sm text-indigo-200/80">
                                {visibleLedgers.length} {visibleLedgers.length === 1 ? (isBankMode ? "account" : "ledger") : (isBankMode ? "accounts" : "ledgers")} ready for transactions
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="rounded-2xl border border-amber-300/30 bg-amber-400/15 px-4 py-3 backdrop-blur-md">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200/90">Grouped</p>
                            <p className="text-sm font-bold text-white">{groupedLedgers}</p>
                        </div>
                        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-100/90">Debit</p>
                            <p className="text-sm font-bold text-white">{debitLedgers}</p>
                        </div>
                        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-100/90">Credit</p>
                            <p className="text-sm font-bold text-white">{creditLedgers}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/25"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </button>
                    </div>
                </div>
            </div>

            <Card className="border-indigo-100 shadow-sm">
                <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">{isBankMode ? "Account Setup" : "Ledger Setup"}</h3>
                            <p className="text-xs text-slate-500">
                                {isBankMode
                                    ? "Keep your operating, cash, and bank accounts organized for voucher posting."
                                    : "Create ledgers under the right groups so vouchers and reports stay aligned."}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                <Dialog
                    open={isOpen}
                    onOpenChange={(open) => {
                        setIsOpen(open)
                        if (!open) resetForm()
                    }}
                >
                    <DialogTrigger asChild>
                        <button
                            type="button"
                            onClick={openCreate}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-bold text-indigo-800 transition hover:border-indigo-300 hover:bg-indigo-100"
                        >
                            <Plus className="h-4 w-4" />
                            Create New {isBankMode ? "Bank" : "Ledger"}
                        </button>
                    </DialogTrigger>
                    <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-xl">
                        <DialogHeader>
                            <DialogTitle>{editId ? `Edit ${isBankMode ? "Bank" : "Ledger"}` : `Create ${isBankMode ? "Bank" : "Ledger"}`}</DialogTitle>
                            <DialogDescription>
                                {editId ? "Update record." : "Create a record."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>{isBankMode ? "Account Display Name" : "Ledger Name"}</Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} required className="bg-white border-slate-300" placeholder={isBankMode ? "e.g. Main Operating Account" : ""} />
                            </div>

                            {isBankMode && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Bank Name</Label>
                                        <Input value={bankName} onChange={(e) => setBankName(e.target.value)} className="bg-white border-slate-300" placeholder="e.g. Access Bank" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Account Number</Label>
                                        <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="bg-white border-slate-300" placeholder="0123456789" />
                                    </div>
                                </div>
                            )}

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

                                {!isBankMode && (
                                    <div className="space-y-2">
                                        <Label>Ledger Type</Label>
                                        <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                                            <input
                                                type="checkbox"
                                                checked={false}
                                                disabled
                                                className="h-4 w-4"
                                            />
                                            Cash/Bank Ledger
                                            <span className="ml-auto text-[10px] uppercase tracking-wider text-slate-400">Use Banking tab</span>
                                        </label>
                                    </div>
                                )}
                            </div>

                            {isBankMode && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Contact Person</Label>
                                        <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="bg-white border-slate-300" placeholder="Optional" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="bg-white border-slate-300" placeholder="Optional" />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white border-slate-300" placeholder="Optional" />
                            </div>

                            <DialogFooter>
                                {editId ? (
                                    <Button asChild type="button" variant="outline" className="mr-auto">
                                        <Link href={isBankMode ? `/accounting/info/bank-account/${editId}` : `/accounting/info/ledger/${editId}`}>
                                            View Full Page
                                        </Link>
                                    </Button>
                                ) : null}
                                <Button type="submit" disabled={isSubmitting} className="h-10 bg-indigo-600 px-5 font-bold text-white hover:bg-indigo-700">
                                    {editId ? "Save Changes" : `Create ${isBankMode ? "Bank" : "Ledger"}`}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                        {visibleLedgers.length === 0 && (
                            <Button variant="outline" disabled className="rounded-xl border-indigo-200 bg-white px-5 py-3 text-sm font-bold text-indigo-500">
                                <Layers3 className="mr-2 h-4 w-4" />
                                {groups.length} Groups Available
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden bg-white shadow-sm border-slate-200">
                <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-slate-50 [&_th]:px-5 [&_th]:py-3.5 [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600 [&_tr]:border-b [&_tr]:border-slate-200">
                        <TableRow className="border-slate-200">
                            <TableHead className="text-slate-500">{isBankMode ? "Account" : "Ledger"}</TableHead>
                            {isBankMode && <TableHead className="text-slate-500">Bank</TableHead>}
                            {isBankMode && <TableHead className="text-slate-500">A/C Number</TableHead>}
                            <TableHead className="text-slate-500">Group</TableHead>
                            {!isBankMode && <TableHead className="text-slate-500">Type</TableHead>}
                            <TableHead className="text-slate-500">Opening</TableHead>
                            <TableHead className="text-right text-slate-500">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100 [&_td]:px-5 [&_td]:py-3.5 [&_tr:hover]:bg-slate-50/60">
                        {visibleLedgers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={isBankMode ? 6 : 5} className="text-center text-slate-500 py-6">
                                    {isBankMode
                                        ? "No bank accounts yet. Add one to use it on vouchers."
                                        : "No ledgers found yet. Create one to use it in vouchers."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            visibleLedgers.map((ledger) => (
                                <TableRow key={ledger.id} className="border-slate-200">
                                    <TableCell className="font-medium text-slate-800">
                                        <Link href={isBankMode ? `/accounting/info/bank-account/${ledger.id}` : `/accounting/info/ledger/${ledger.id}`} className="transition hover:text-indigo-700">
                                            {ledger.name}
                                        </Link>
                                    </TableCell>
                                    {isBankMode && <TableCell className="text-slate-500">{ledger.bank_name || "-"}</TableCell>}
                                    {isBankMode && <TableCell className="text-slate-500 font-mono text-xs">{ledger.account_number || "-"}</TableCell>}
                                    <TableCell className="text-slate-500">{ledger.account_groups?.name || groups.find((group) => group.id === ledger.group_id)?.name || "-"}</TableCell>
                                    {!isBankMode && <TableCell className="text-slate-500">{ledger.balance_type}</TableCell>}
                                    <TableCell className="text-slate-500">{Number(ledger.opening_balance || 0).toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => openEdit(ledger)} className="h-8 text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50">
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
        </div>
    )
}
