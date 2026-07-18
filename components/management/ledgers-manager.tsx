"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, CreditCard, Landmark, Layers3, Loader2, Pencil, Plus, Printer, Search, Shield, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createLedger, updateLedger, deleteLedger, AccountGroup, Ledger, LedgerBalance, seedDefaultLedgers } from "@/app/management/actions"
import { AdjustBalanceDialog } from "@/components/accounting/adjust-balance-dialog"

type LedgerRow = Ledger & {
    account_groups?: {
        name: string
    } | null
}

type LedgersManagerMode = "accounts" | "banks"

export function LedgersManager({ ledgers, groups, balances = {}, mode = "accounts", hideTitle = false }: { ledgers: LedgerRow[], groups: AccountGroup[], balances?: Record<string, LedgerBalance>, mode?: LedgersManagerMode, hideTitle?: boolean }) {
    const isBankMode = mode === "banks"
    const pageTitle = isBankMode ? "Bank Accounts" : "Ledgers"
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
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
    const [isDesktop, setIsDesktop] = useState(false)

    const visibleLedgers = ledgers.filter(l => {
        if (isBankMode) return Boolean(l.is_cash_bank) || l.ledger_kind === "bank"
        return !l.is_cash_bank && l.ledger_kind !== "party"
    })
    const filteredLedgers = searchQuery.trim()
        ? visibleLedgers.filter(l => l.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
        : visibleLedgers
    const groupedLedgers = filteredLedgers.filter((ledger) => ledger.group_id).length
    const debitLedgers = filteredLedgers.filter((ledger) => ledger.balance_type === "Dr").length
    const creditLedgers = filteredLedgers.filter((ledger) => ledger.balance_type === "Cr").length
    const signedBalance = (ledger: LedgerRow) => {
        const balance = balances[ledger.id]
        if (balance) return balance.type === "Cr" ? -balance.amount : balance.amount
        return ledger.balance_type === "Cr" ? -Number(ledger.opening_balance || 0) : Number(ledger.opening_balance || 0)
    }
    const overallBankBalance = visibleLedgers.reduce((total, ledger) => total + signedBalance(ledger), 0)
    const formatCurrency = (amount: number, showSign = false) => `${showSign && amount < 0 ? "-" : ""}NGN ${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 768px)")
        const updateMatch = () => setIsDesktop(mediaQuery.matches)

        updateMatch()
        mediaQuery.addEventListener("change", updateMatch)

        return () => mediaQuery.removeEventListener("change", updateMatch)
    }, [])

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

    async function handleSeedDefaults() {
        setIsSubmitting(true)
        try {
            await seedDefaultLedgers()
            toast.success("Default ledgers added")
            router.refresh()
        } catch (error: any) {
            toast.error(error?.message || "Failed to add default ledgers")
            console.error("Failed to seed ledgers", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const activeLedger = editId ? visibleLedgers.find((ledger) => ledger.id === editId) ?? null : null

    const ledgerForm = (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>{isBankMode ? "Account Display Name" : "Ledger Name"}</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required className="bg-white border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" placeholder={isBankMode ? "e.g. Main Operating Account" : ""} />
            </div>

            {isBankMode && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Bank Name</Label>
                        <Input value={bankName} onChange={(e) => setBankName(e.target.value)} className="bg-white border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" placeholder="e.g. Access Bank" />
                    </div>
                    <div className="space-y-2">
                        <Label>Account Number</Label>
                        <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="bg-white border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" placeholder="0123456789" />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Group</Label>
                    <Select value={groupId} onValueChange={setGroupId}>
                        <SelectTrigger className="bg-white border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100">
                            <SelectValue placeholder="Select a group" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100">
                            {groups.map((group) => (
                                <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Balance Type</Label>
                    <Select value={balanceType} onValueChange={(value: "Dr" | "Cr") => setBalanceType(value)}>
                        <SelectTrigger className="bg-white border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100">
                            <SelectItem value="Dr">Dr</SelectItem>
                            <SelectItem value="Cr">Cr</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Opening Balance</Label>
                    <Input
                        type="number"
                        step="0.01"
                        value={openingBalance}
                        onChange={(e) => setOpeningBalance(e.target.value)}
                        className="bg-white border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Contact Person</Label>
                        <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="bg-white border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" placeholder="Optional" />
                    </div>
                    <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="bg-white border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" placeholder="Optional" />
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" placeholder="Optional" />
            </div>

            <div className="flex justify-end">
                {activeLedger ? (
                    <div className="mr-auto flex items-center gap-2">
                        <Button asChild type="button" variant="outline" className="h-10 border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-50">
                            <Link href={isBankMode ? `/accounting/info/bank-account/${activeLedger.id}` : `/accounting/info/ledger/${activeLedger.id}`}>
                                View Full Page
                            </Link>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                                await handleDelete(activeLedger)
                                setIsOpen(false)
                            }}
                            disabled={isSubmitting}
                            className="h-10 border-red-200 bg-red-50 px-3 text-red-600 hover:border-red-300 hover:bg-red-100 hover:text-red-700"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete {isBankMode ? "Account" : "Ledger"}
                        </Button>
                    </div>
                ) : null}
                <Button type="submit" disabled={isSubmitting} className="h-10 bg-indigo-600 px-5 font-bold text-white hover:bg-indigo-700">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {editId ? "Save Changes" : `Create ${isBankMode ? "Bank" : "Ledger"}`}
                </Button>
            </div>
        </form>
    )

    return (
        <div className="space-y-8">
            <div className="relative overflow-hidden rounded-3xl border border-indigo-700/40 bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 p-6 shadow-[0_20px_40px_-15px_rgba(49,46,129,0.4)] sm:p-8">
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
                            <p className="text-sm text-indigo-200/80">
                                {visibleLedgers.length} {visibleLedgers.length === 1 ? (isBankMode ? "account" : "ledger") : (isBankMode ? "accounts" : "ledgers")} ready for transactions
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {isBankMode ? (
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-indigo-100/80">Overall Account Balance</p>
                                <p className={`mt-2 text-3xl font-black tracking-tight sm:text-4xl ${overallBankBalance < 0 ? "text-red-300" : "text-emerald-300"}`}>
                                    {formatCurrency(overallBankBalance, true)}
                                </p>
                            </div>
                        ) : (
                            <>
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
                            </>
                        )}
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

            <Card className="border-indigo-100 shadow-sm dark:border-slate-800">
                <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{isBankMode ? "Account Setup" : "Ledger Setup"}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {isBankMode
                                    ? "Keep your operating, cash, and bank accounts organized for voucher posting."
                                    : "Create ledgers under the right groups so vouchers and reports stay aligned."}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        {isDesktop ? (
                            <Sheet
                                open={isOpen}
                                onOpenChange={(open) => {
                                    setIsOpen(open)
                                    if (!open) resetForm()
                                }}
                            >
                                <SheetTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={openCreate}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-bold text-indigo-800 transition hover:border-indigo-300 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-200 dark:hover:bg-indigo-500/25"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create New {isBankMode ? "Bank" : "Ledger"}
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-full overflow-y-auto border-slate-200 bg-slate-50 p-0 text-slate-900 sm:max-w-xl dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
                                    <SheetHeader className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                                        <SheetTitle>{editId ? `Edit ${isBankMode ? "Bank" : "Ledger"}` : `Create ${isBankMode ? "Bank" : "Ledger"}`}</SheetTitle>
                                        <SheetDescription>{editId ? "Update record." : "Create a record."}</SheetDescription>
                                    </SheetHeader>
                                    <div className="px-6 py-5">
                                        {ledgerForm}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        ) : (
                            <Drawer
                                open={isOpen}
                                onOpenChange={(open) => {
                                    setIsOpen(open)
                                    if (!open) resetForm()
                                }}
                            >
                                <DrawerTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={openCreate}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-bold text-indigo-800 transition hover:border-indigo-300 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-200 dark:hover:bg-indigo-500/25"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create New {isBankMode ? "Bank" : "Ledger"}
                                    </button>
                                </DrawerTrigger>
                                <DrawerContent className="border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
                                    <DrawerHeader>
                                        <DrawerTitle>{editId ? `Edit ${isBankMode ? "Bank" : "Ledger"}` : `Create ${isBankMode ? "Bank" : "Ledger"}`}</DrawerTitle>
                                        <DrawerDescription>{editId ? "Update record." : "Create a record."}</DrawerDescription>
                                    </DrawerHeader>
                                    <div className="px-4 pb-6">
                                        {ledgerForm}
                                    </div>
                                </DrawerContent>
                            </Drawer>
                        )}
                        {visibleLedgers.length === 0 && (
                            <Button variant="outline" onClick={handleSeedDefaults} disabled={isSubmitting} className="rounded-xl border-indigo-200 bg-white px-5 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-50">
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Layers3 className="mr-2 h-4 w-4" />}
                                Seed Default Ledgers
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${isBankMode ? "accounts" : "ledgers"} by name...`}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
                />
            </div>

            <Card className="overflow-hidden bg-white shadow-sm border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50 [&_th]:px-5 [&_th]:py-3.5 [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600 dark:[&_th]:text-slate-400 [&_tr]:border-b [&_tr]:border-slate-200 dark:[&_tr]:border-slate-800">
                        <TableRow className="border-slate-200 dark:border-slate-800">
                            <TableHead className="text-slate-500">{isBankMode ? "Account" : "Ledger"}</TableHead>
                            <TableHead className="text-right text-slate-500">Current Balance</TableHead>
                            <TableHead className="w-40 text-right text-slate-500">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100 dark:divide-slate-800 [&_td]:px-5 [&_td]:py-3.5 [&_tr:hover]:bg-slate-50/60 dark:[&_tr:hover]:bg-slate-800/50">
                        {filteredLedgers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-slate-500 dark:text-slate-400 py-6">
                                    {searchQuery.trim()
                                        ? `No ledgers found matching "${searchQuery}".`
                                        : isBankMode
                                            ? "No bank accounts yet. Add one to use it on vouchers."
                                            : "No ledgers found yet. Create one to use it in vouchers."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLedgers.map((ledger) => (
                                <TableRow key={ledger.id} className="cursor-pointer border-slate-200 dark:border-slate-800" onClick={() => isBankMode ? router.push(`/accounting/info/bank-account/${ledger.id}`) : router.push(`/accounting/info/ledger/${ledger.id}`)}>
                                    <TableCell className="font-medium text-slate-800 dark:text-slate-100">
                                        {isBankMode ? (
                                            <button type="button" onClick={(event) => {
                                                event.stopPropagation()
                                                router.push(`/accounting/info/bank-account/${ledger.id}`)
                                            }} className="w-full text-left transition hover:text-indigo-700">
                                                {ledger.name}
                                            </button>
                                        ) : (
                                            <Link href={`/accounting/info/ledger/${ledger.id}`} className="flex items-center gap-2 hover:text-indigo-700 transition" onClick={(e) => e.stopPropagation()}>
                                                <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                {ledger.name}
                                            </Link>
                                        )}
                                    </TableCell>
                                    <TableCell className={`text-right font-bold ${signedBalance(ledger) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                        {formatCurrency(signedBalance(ledger))}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                                            <AdjustBalanceDialog ledgerId={ledger.id} ledgerName={ledger.name} balance={balances[ledger.id]} />
                                            <button
                                                type="button"
                                                onClick={() => openEdit(ledger)}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                                                title={`Edit ${ledger.name}`}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
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
