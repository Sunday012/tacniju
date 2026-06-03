"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ComboboxInput } from "@/components/ui/combobox-input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { saveVoucher, VoucherType, VoucherItemPayload, VoucherLedgerEntry } from "@/app/vouchers/actions"
import { Ledger, LedgerBalance } from "@/app/management/actions"
import { Item } from "@/app/inventory/actions"
import { getOrCreateProfilePartyLedger } from "@/app/accounting/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"

type LedgerWithGroup = Ledger & {
    account_groups?: {
        name?: string
    } | null
}

type PartyOption = {
    id: string
    name: string
    reservation_number?: string | null
    ledgerId?: string | null
}

type ProgramOption = {
    id: string
    name: string
    amount_to_contribute?: number
}

export function VoucherEntry({
    ledgers,
    recentVouchers,
    items,
    fixedType,
    parties = [],
    programs = [],
    balances = {},
}: {
    ledgers: LedgerWithGroup[],
    recentVouchers: any[],
    items: Item[],
    fixedType?: VoucherType,
    parties?: PartyOption[],
    programs?: ProgramOption[],
    balances?: Record<string, LedgerBalance>,
}) {
    const [voucherType, setVoucherType] = useState<VoucherType>(fixedType || "Payment")
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
    const [narration, setNarration] = useState("")
    const [reference, setReference] = useState("")

    const [selectedItems, setSelectedItems] = useState<VoucherItemPayload[]>([])
    // We add 'amount' to support single-entry mode (Payment, Receipt, Contra)
    const [selectedLedgers, setSelectedLedgers] = useState<any[]>([{ ledger_id: "", amount: 0, debit_amount: 0, credit_amount: 0 }])
    const [masterLedgerId, setMasterLedgerId] = useState<string>("")
    const [selectedPartyId, setSelectedPartyId] = useState("")
    const [ledgerLabels, setLedgerLabels] = useState<Record<string, string>>({})
    const [managedLedgerIndex, setManagedLedgerIndex] = useState<number | null>(null)
    // Percentage charge/discount ledger (Sales/Purchase): a ledger line computed as % of the item subtotal.
    const [pctLedgerId, setPctLedgerId] = useState("")
    const [pctValue, setPctValue] = useState<number>(0)
    // Offset: mark party/ledger lines to settle against the party balance (bill-wise "On Account").
    // Sales is always offset against the party, without showing the toggle.
    const [offsetEnabled, setOffsetEnabled] = useState(false)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isAlt = e.altKey;
            let newType: VoucherType | null = null;
            const key = e.key.toLowerCase();

            if (key === 'f4' || (isAlt && key === 'c')) newType = 'Contra';
            else if (key === 'f5' || (isAlt && key === 'p')) newType = 'Payment';
            else if (key === 'f6' || (isAlt && key === 'r')) newType = 'Receipt';
            else if (key === 'f8' || (isAlt && key === 's')) newType = 'Sales';
            else if (key === 'f9' || (isAlt && key === 'u')) newType = 'Purchase';
            else if (isAlt && key === 'e') newType = 'Expense';
            else if (isAlt && key === 'i') newType = 'Income';
            else if (isAlt && key === 'g') newType = 'Program';

            if (newType) {
                if (fixedType) return
                e.preventDefault();
                setVoucherType(newType);
                setSelectedItems(newType === 'Sales' || newType === 'Purchase' ? [{ item_id: "", qty: 1, rate: 0, amount: 0 }] : []);
                setSelectedLedgers([{ ledger_id: "", amount: 0, debit_amount: 0, credit_amount: 0 }]);
                setMasterLedgerId("");
            }
        }
        window.addEventListener('keydown', handleKeyDown, { capture: true })
        return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
    }, [fixedType])

    const needsItems = voucherType === "Sales" || voucherType === "Purchase"

    // Ensure at least one item row if needsItems
    useEffect(() => {
        if (needsItems && selectedItems.length === 0) {
            setSelectedItems([{ item_id: "", qty: 1, rate: 0, amount: 0 }])
        } else if (!needsItems && selectedItems.length > 0) {
            setSelectedItems([])
        }
    }, [voucherType, needsItems])

    // Expense behaves like Payment (cash out), Income & Program behave like Receipt (cash in)
    const isPaymentLike = voucherType === "Payment" || voucherType === "Expense"
    const isReceiptLike = voucherType === "Receipt" || voucherType === "Income" || voucherType === "Program"
    const isSingleEntry = isPaymentLike || isReceiptLike || voucherType === "Contra"
    // Sales is always offset against the party; other types offset only when the user ticks it.
    const offsetActive = voucherType === "Sales" ? true : offsetEnabled

    const totalDebit = selectedLedgers.reduce((sum, l) => sum + (l.debit_amount || 0), 0)
    const totalCredit = selectedLedgers.reduce((sum, l) => sum + (l.credit_amount || 0), 0)
    const totalAmount = selectedLedgers.reduce((sum, l) => sum + (l.amount || 0), 0)

    const isBalanced = isSingleEntry
        ? (masterLedgerId !== "" && totalAmount > 0)
        : (totalDebit === totalCredit && totalDebit > 0)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        let finalLedgers: VoucherLedgerEntry[] = []

        if (isSingleEntry) {
            if (!masterLedgerId) return toast.error("Please select a master Account at the top.")
            const validLines = selectedLedgers.filter((l: any) => l.ledger_id && l.amount > 0)
            if (validLines.length === 0) return toast.error("Please enter at least one valid ledger line with an amount.")
            if (!isBalanced) return toast.error("Voucher must have a positive total amount.")

            let masterEntry: VoucherLedgerEntry = { ledger_id: masterLedgerId, debit_amount: 0, credit_amount: 0 }

            if (isPaymentLike) masterEntry.credit_amount = totalAmount
            else if (isReceiptLike) masterEntry.debit_amount = totalAmount
            else if (voucherType === 'Contra') masterEntry.debit_amount = totalAmount

            finalLedgers.push(masterEntry)

            validLines.forEach(line => {
                const isCashBankLine = ledgers.find(l => l.id === line.ledger_id)?.is_cash_bank
                finalLedgers.push({
                    ledger_id: line.ledger_id,
                    debit_amount: isPaymentLike ? line.amount : 0,
                    credit_amount: isReceiptLike ? line.amount : (voucherType === 'Contra' ? line.amount : 0),
                    // Offset settles non-cash lines against the party balance ("On Account") unless a method is already chosen.
                    adjustment_method: line.adjustment_method || (offsetActive && !isCashBankLine ? "On Account" : undefined),
                    adjustment_reference: line.adjustment_reference,
                    due_date: line.due_date,
                })
            })
        } else {
            finalLedgers = selectedLedgers.filter(l => l.ledger_id && (l.debit_amount > 0 || l.credit_amount > 0))
            if (finalLedgers.length < 2) return toast.error("Please enter at least two valid ledger lines (one debit, one credit).")
            if (!isBalanced) return toast.error("Voucher is not balanced. Total Debit must equal Total Credit.")
            if (offsetActive) {
                finalLedgers = finalLedgers.map(line => {
                    const isCashBankLine = ledgers.find(l => l.id === line.ledger_id)?.is_cash_bank
                    return {
                        ...line,
                        adjustment_method: line.adjustment_method || (!isCashBankLine ? "On Account" : undefined),
                    }
                })
            }
        }

        const validItems = selectedItems.filter(i => i.item_id && i.qty > 0)

        setIsSubmitting(true)
        try {
            await saveVoucher({
                voucher_type: voucherType,
                date,
                narration,
                reference,
                items: needsItems ? validItems : [],
                ledger_entries: finalLedgers
            })

            toast.success(`${voucherType} voucher saved!`)
            setNarration("")
            setReference("")
            setMasterLedgerId("")
            setSelectedPartyId("")
            setManagedLedgerIndex(null)
            setSelectedItems(needsItems ? [{ item_id: "", qty: 1, rate: 0, amount: 0 }] : [])
            setSelectedLedgers([{ ledger_id: "", amount: 0, debit_amount: 0, credit_amount: 0 }])
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to save voucher.")
        } finally {
            setIsSubmitting(false)
        }
    }


    // -- Items Management --
    function updateItem(index: number, field: keyof VoucherItemPayload, value: any) {
        const updated = [...selectedItems]
        updated[index] = { ...updated[index], [field]: value }

        if (field === 'item_id') {
            const itemDef = items.find(i => i.id === value)
            if (itemDef) {
                updated[index].rate = voucherType === "Sales" ? itemDef.selling_rate : itemDef.purchase_rate
            }
        }
        if (field === 'qty' || field === 'rate' || field === 'item_id') {
            updated[index].amount = updated[index].qty * updated[index].rate
        }
        setSelectedItems(updated)
    }

    function handleItemKeyDown(e: React.KeyboardEvent, index: number, field: string) {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (field === 'amount' && index === selectedItems.length - 1) {
                if (selectedItems[index].item_id) {
                    setSelectedItems([...selectedItems, { item_id: "", qty: 1, rate: 0, amount: 0 }])
                    // Focus logic could be added using refs mapping
                }
            }
        }
    }

    function removeEmptyItems() {
        setSelectedItems(selectedItems.filter((i, idx) => i.item_id || idx === selectedItems.length - 1))
    }

    function addItemLine() {
        setSelectedItems([...selectedItems, { item_id: "", qty: 1, rate: 0, amount: 0 }])
    }

    function removeItem(index: number) {
        setSelectedItems(selectedItems.filter((_, idx) => idx !== index))
    }

    // -- Ledgers Management --
    function updateLedger(index: number, field: string, value: any) {
        const updated = [...selectedLedgers]
        updated[index] = { ...updated[index], [field]: value }

        // If they enter debit, zero out credit and vice versa
        if (field === 'debit_amount' && value > 0) updated[index].credit_amount = 0
        if (field === 'credit_amount' && value > 0) updated[index].debit_amount = 0

        setSelectedLedgers(updated)
    }

    async function handlePartyChange(partyId: string) {
        setSelectedPartyId(partyId)
        if (!partyId) return

        try {
            const selectedParty = parties.find(party => party.id === partyId)
            // Manual parties are backed by a ledger directly; member parties resolve a profile ledger on demand.
            const ledgerId = selectedParty?.ledgerId
                ? selectedParty.ledgerId
                : (await getOrCreateProfilePartyLedger(partyId)).ledgerId
            const partyLabel = selectedParty
                ? selectedParty.reservation_number
                    ? `${selectedParty.name} (${selectedParty.reservation_number})`
                    : selectedParty.name
                : "Selected party"
            const updated = [...selectedLedgers]
            updated[0] = {
                ...updated[0],
                ledger_id: ledgerId,
                display_label: partyLabel,
            }
            setSelectedLedgers(updated)
            setLedgerLabels(previous => ({ ...previous, [ledgerId]: partyLabel }))
            router.refresh()
        } catch (error: any) {
            toast.error(error?.message || "Failed to select party.")
        }
    }

    function openBillWiseManager(index: number) {
        const updated = [...selectedLedgers]
        updated[index] = {
            ...updated[index],
            adjustment_method: updated[index].adjustment_method || "On Account",
        }
        setSelectedLedgers(updated)
        setManagedLedgerIndex(index)
    }

    function addLedgerLine() {
        setSelectedLedgers([
            ...selectedLedgers,
            { ledger_id: "", amount: 0, debit_amount: 0, credit_amount: 0, forceVisible: true },
        ])
    }

    const itemsSubtotal = selectedItems.reduce((sum, item) => sum + (item.amount || 0), 0)

    // Add a percentage charge/discount ledger line computed from the item subtotal.
    // Sales credits the charge (extra income); Purchase debits it (extra cost).
    function applyPercentageLedger() {
        if (!pctLedgerId || !pctValue) {
            toast.error("Pick a ledger and a percentage first.")
            return
        }
        const charge = Number(((itemsSubtotal * pctValue) / 100).toFixed(2))
        const isCredit = voucherType === "Sales"
        setSelectedLedgers([
            ...selectedLedgers,
            {
                ledger_id: pctLedgerId,
                amount: charge,
                debit_amount: isCredit ? 0 : charge,
                credit_amount: isCredit ? charge : 0,
                forceVisible: true,
            },
        ])
        setLedgerLabels(prev => {
            const rec = ledgers.find(l => l.id === pctLedgerId)
            return rec ? { ...prev, [pctLedgerId]: `${buildLedgerLabel(rec)} (${pctValue}%)` } : prev
        })
        setPctLedgerId("")
        setPctValue(0)
    }

    function handleLedgerKeyDown(e: React.KeyboardEvent, index: number, field: string) {
        if (e.key === 'Enter') {
            e.preventDefault()
            if ((field === 'debit_amount' || field === 'credit_amount') && index === selectedLedgers.length - 1) {
                if (selectedLedgers[index].ledger_id && (selectedLedgers[index].debit_amount > 0 || selectedLedgers[index].credit_amount > 0)) {
                    // Auto balance suggestion for the next row
                    const currentDiff = totalDebit - totalCredit;
                    let nextDebit = 0;
                    let nextCredit = 0;
                    if (currentDiff > 0) nextCredit = currentDiff;
                    else if (currentDiff < 0) nextDebit = Math.abs(currentDiff);

                    setSelectedLedgers([...selectedLedgers, { ledger_id: "", amount: 0, debit_amount: nextDebit, credit_amount: nextCredit }])
                }
            } else if (field === 'amount' && index === selectedLedgers.length - 1) {
                if (selectedLedgers[index].ledger_id && selectedLedgers[index].amount > 0) {
                    setSelectedLedgers([...selectedLedgers, { ledger_id: "", amount: 0, debit_amount: 0, credit_amount: 0 }])
                }
            }
        }
    }

    // Per-voucher-type accent palette. White background everywhere; the accent
    // tints the type badge, master ledger panel, focus rings, row hover, totals
    // border, and submit button.
    const themes = {
        Payment:  { name: "Gold",   ring: "focus:border-amber-500 focus:ring-amber-500",     text: "text-amber-700",   textSoft: "text-amber-600",   bg: "bg-amber-50",   bgSoft: "bg-amber-50/40",   border: "border-amber-200",   borderStrong: "border-amber-500",   trigger: "border-amber-300 text-amber-700",   button: "bg-amber-500 hover:bg-amber-400",       hover: "hover:bg-amber-50/40",   totalsBorder: "border-amber-500" },
        Receipt:  { name: "Red",    ring: "focus:border-red-500 focus:ring-red-500",         text: "text-red-700",     textSoft: "text-red-600",     bg: "bg-red-50",     bgSoft: "bg-red-50/40",     border: "border-red-200",     borderStrong: "border-red-500",     trigger: "border-red-300 text-red-700",       button: "bg-red-500 hover:bg-red-400",           hover: "hover:bg-red-50/40",     totalsBorder: "border-red-500" },
        Sales:    { name: "Blue",   ring: "focus:border-blue-500 focus:ring-blue-500",       text: "text-blue-700",    textSoft: "text-blue-600",    bg: "bg-blue-50",    bgSoft: "bg-blue-50/40",    border: "border-blue-200",    borderStrong: "border-blue-500",    trigger: "border-blue-300 text-blue-700",     button: "bg-blue-600 hover:bg-blue-500",         hover: "hover:bg-blue-50/40",    totalsBorder: "border-blue-500" },
        Purchase: { name: "Blue",   ring: "focus:border-blue-500 focus:ring-blue-500",       text: "text-blue-700",    textSoft: "text-blue-600",    bg: "bg-blue-50",    bgSoft: "bg-blue-50/40",    border: "border-blue-200",    borderStrong: "border-blue-500",    trigger: "border-blue-300 text-blue-700",     button: "bg-blue-600 hover:bg-blue-500",         hover: "hover:bg-blue-50/40",    totalsBorder: "border-blue-500" },
        Expense:  { name: "Amber",  ring: "focus:border-amber-500 focus:ring-amber-500",     text: "text-amber-700",   textSoft: "text-amber-600",   bg: "bg-amber-50",   bgSoft: "bg-amber-50/40",   border: "border-amber-200",   borderStrong: "border-amber-500",   trigger: "border-amber-300 text-amber-700",   button: "bg-amber-500 hover:bg-amber-400",       hover: "hover:bg-amber-50/40",   totalsBorder: "border-amber-500" },
        Income:   { name: "Amber",  ring: "focus:border-amber-500 focus:ring-amber-500",     text: "text-amber-700",   textSoft: "text-amber-600",   bg: "bg-amber-50",   bgSoft: "bg-amber-50/40",   border: "border-amber-200",   borderStrong: "border-amber-500",   trigger: "border-amber-300 text-amber-700",   button: "bg-amber-500 hover:bg-amber-400",       hover: "hover:bg-amber-50/40",   totalsBorder: "border-amber-500" },
        Contra:   { name: "Black",  ring: "focus:border-slate-900 focus:ring-slate-900",     text: "text-slate-900",   textSoft: "text-slate-700",   bg: "bg-slate-100",  bgSoft: "bg-slate-50",      border: "border-slate-300",   borderStrong: "border-slate-900",   trigger: "border-slate-400 text-slate-900",   button: "bg-slate-900 hover:bg-slate-800",       hover: "hover:bg-slate-100/60",  totalsBorder: "border-slate-900" },
        Program:  { name: "Indigo", ring: "focus:border-indigo-500 focus:ring-indigo-500",   text: "text-indigo-700",  textSoft: "text-indigo-600",  bg: "bg-indigo-50",  bgSoft: "bg-indigo-50/40",  border: "border-indigo-200",  borderStrong: "border-indigo-500",  trigger: "border-indigo-300 text-indigo-700", button: "bg-indigo-600 hover:bg-indigo-500",     hover: "hover:bg-indigo-50/40",  totalsBorder: "border-indigo-500" },
    } as const
    const theme = themes[voucherType]

    const invisibleInputClass = `w-full bg-transparent border-transparent hover:border-slate-300 ${theme.ring} focus:ring-1 rounded-md px-2 h-8 text-right transition-colors`
    const invisibleSelectClass = `w-full bg-transparent border-transparent hover:border-slate-300 ${theme.ring} focus:ring-1 h-8 shadow-none`

    function handleMasterLedgerChange(value: string) {
        const selectedLedger = ledgers.find((ledger) => ledger.id === value)
        if (!selectedLedger) {
            setMasterLedgerId(value)
            return
        }

        if (!selectedLedger.is_cash_bank) {
            toast.error(`"${selectedLedger.name}" is not a cash/bank account. Select it in the Party / Ledger rows below.`)
            return
        }

        setMasterLedgerId(value)
    }

    const formatBalance = (ledgerId?: string) => {
        if (!ledgerId) return null
        const bal = balances[ledgerId]
        if (!bal) return null
        return `₦${bal.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${bal.type}`
    }

    const buildLedgerLabel = (ledger: LedgerWithGroup) => {
        const groupName = ledger.account_groups?.name
        const kind = ledger.is_cash_bank ? "Cash/Bank" : "Ledger"
        return groupName ? `${kind}: ${ledger.name} (${groupName})` : `${kind}: ${ledger.name}`
    }

    const cashBankLedgers = ledgers.filter((ledger) => ledger.is_cash_bank)
    const regularLedgers = ledgers.filter((ledger) => !ledger.is_cash_bank)
    // Top "Account" field lists every ledger by plain name (cash/bank accounts first).
    const topAccountOptions = [...cashBankLedgers, ...regularLedgers].map((ledger) => ({
        value: ledger.id,
        label: ledger.name,
    }))
    const detailLedgerCandidates = !isSingleEntry
        ? ledgers
        : voucherType === "Contra"
            ? cashBankLedgers.filter((ledger) => ledger.id !== masterLedgerId)
            : (regularLedgers.length > 0 ? regularLedgers : ledgers.filter((ledger) => ledger.id !== masterLedgerId))
    const detailLedgerOptions = detailLedgerCandidates.map((ledger) => ({
        value: ledger.id,
        label: buildLedgerLabel(ledger),
    }))
    const managedLedger = managedLedgerIndex !== null ? selectedLedgers[managedLedgerIndex] : null
    const managedLedgerRecord = managedLedger?.ledger_id ? ledgers.find(ledger => ledger.id === managedLedger.ledger_id) : null
    const managedLedgerName = managedLedgerRecord ? buildLedgerLabel(managedLedgerRecord) : ""
    const managedAmountSide = isPaymentLike ? "Dr" : "Cr"
    const requiresCashBankMaster = isSingleEntry
    const hasCashBankMasterOptions = topAccountOptions.length > 0
    const detailPlaceholder = voucherType === "Contra" ? "Type receiving/paying cash-bank ledger..." : "Type expense, income, party, or other ledger..."
    const hasVisibleLedgerRows = selectedLedgers.some((ledger, index) => (
        index === 0 ||
        ledger.forceVisible ||
        ledger.ledger_id ||
        ledger.amount > 0 ||
        ledger.debit_amount > 0 ||
        ledger.credit_amount > 0
    ))
    const showLedgerRows = !isSingleEntry || masterLedgerId || selectedPartyId || hasVisibleLedgerRows

    return (
        <div className="w-full">
            <section className={`overflow-hidden rounded-[2rem] border bg-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] ${theme.border}`}>
                <div className={`border-b px-5 py-4 ${theme.bgSoft} ${theme.border}`}>
                    <div className="flex items-center justify-between">
                        <h2 className={`text-2xl font-black ${theme.text}`}>{voucherType}</h2>
                        {!fixedType && (
                            <Select value={voucherType} onValueChange={(v: VoucherType) => {
                                setVoucherType(v)
                                setSelectedItems(v === 'Sales' || v === 'Purchase' ? [{ item_id: "", qty: 1, rate: 0, amount: 0 }] : [])
                                setSelectedLedgers([{ ledger_id: "", debit_amount: 0, credit_amount: 0 }])
                                setMasterLedgerId("")
                            }}>
                                <SelectTrigger className={`w-[200px] bg-white font-bold border-2 ${theme.trigger}`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-300 text-slate-900">
                                    <SelectItem value="Payment">Payment (Alt+P)</SelectItem>
                                    <SelectItem value="Receipt">Receipt (Alt+R)</SelectItem>
                                    <SelectItem value="Sales">Sales (Alt+S)</SelectItem>
                                    <SelectItem value="Purchase">Purchase (Alt+U)</SelectItem>
                                    <SelectItem value="Expense">Expense (Alt+E)</SelectItem>
                                    <SelectItem value="Income">Income (Alt+I)</SelectItem>
                                    <SelectItem value="Contra">Contra (Alt+C)</SelectItem>
                                    <SelectItem value="Program">Program (Alt+G)</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                            <Label className="w-16 text-slate-500">Date</Label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required className="h-8 bg-transparent border-t-0 border-x-0 border-b-slate-200 rounded-none focus-visible:ring-0 focus-visible:border-slate-400 px-1 [&::-webkit-calendar-picker-indicator]:hidden" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="w-16 text-slate-500">Ref</Label>
                            <Input value={reference} onChange={e => setReference(e.target.value)} placeholder="Ref / Cheque No" className="h-8 bg-transparent border-t-0 border-x-0 border-b-slate-200 rounded-none focus-visible:ring-0 focus-visible:border-slate-400 px-1" />
                        </div>
                    </div>

                    {isSingleEntry && (
                        <div className={`mt-6 flex flex-col gap-2 p-3 rounded-md border sm:flex-row sm:items-center sm:gap-3 ${theme.bgSoft} ${theme.border}`}>
                            <Label className="font-bold text-slate-700 shrink-0 sm:w-24">Account</Label>
                            <div className="w-full flex-1 space-y-1">
                                <ComboboxInput
                                    value={masterLedgerId}
                                    onChange={handleMasterLedgerChange}
                                    options={topAccountOptions}
                                    placeholder={topAccountOptions.length > 0 ? "Search account name..." : "No account found. Create one in Accounts Info."}
                                    className="h-10 w-full border-slate-300 font-semibold shadow-sm bg-white rounded-md"
                                    inputClassName="bg-transparent border-none focus-visible:ring-0 shadow-none font-semibold text-slate-800"
                                />
                                {requiresCashBankMaster && !hasCashBankMasterOptions && (
                                    <p className="text-xs text-red-600">
                                        No account exists yet — create one in Accounts Info before recording this voucher.
                                    </p>
                                )}
                            </div>
                            <div className="w-full shrink-0 text-left sm:w-44 sm:text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Bal</p>
                                <p className={`text-sm font-bold ${formatBalance(masterLedgerId) ? theme.text : "text-slate-300"}`}>
                                    {formatBalance(masterLedgerId) || "—"}
                                </p>
                            </div>
                        </div>
                    )}

                    {voucherType !== "Contra" && (
                        <div className="mt-3">
                            <div className="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-2 sm:flex-row sm:items-center sm:gap-3">
                                <Label className="font-bold text-slate-700 shrink-0 sm:w-24">Party</Label>
                                <div className="w-full flex-1">
                                    <ComboboxInput
                                        value={selectedPartyId}
                                        onChange={handlePartyChange}
                                        options={parties.map(p => ({
                                            value: p.id,
                                            label: p.reservation_number ? `${p.name} (${p.reservation_number})` : p.name,
                                        }))}
                                        placeholder="Search registered member..."
                                        className="h-10 w-full"
                                        inputClassName="border-slate-300"
                                    />
                                </div>
                                {formatBalance(selectedLedgers[0]?.ledger_id) && (
                                    <div className="shrink-0 text-left sm:text-right">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bal </span>
                                        <span className={`text-sm font-bold ${theme.text}`}>{formatBalance(selectedLedgers[0]?.ledger_id)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* ITEM TABLE (For Sales/Purchase) */}
                        {needsItems && (
                            <div className="rounded-md border border-slate-200 overflow-hidden mb-6">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow className="border-b-slate-200">
                                            <TableHead className="w-[38%] text-slate-500 font-semibold h-9 px-2">Name of Item</TableHead>
                                            <TableHead className="text-right text-slate-500 font-semibold h-9 px-2">Quantity</TableHead>
                                            <TableHead className="text-right text-slate-500 font-semibold h-9 px-2">Rate</TableHead>
                                            <TableHead className="text-slate-500 font-semibold h-9 px-2">Per</TableHead>
                                            <TableHead className="text-right text-slate-500 font-semibold h-9 px-2">Amount</TableHead>
                                            <TableHead className="w-8 h-9 px-1"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedItems.map((pi, idx) => {
                                            const itemDef = items.find(i => i.id === pi.item_id)
                                            return (
                                            <TableRow key={`item-${idx}`} className={`border-b-slate-100 h-10 ${theme.hover}`}>
                                                <TableCell className="p-1 relative group">
                                                    <ComboboxInput
                                                        value={pi.item_id}
                                                        onChange={(val) => updateItem(idx, 'item_id', val)}
                                                        options={items.map(i => ({ value: i.id, label: i.name }))}
                                                        placeholder="Type item..."
                                                        className="h-8"
                                                        inputClassName={`bg-transparent border-transparent hover:border-slate-300 ${theme.ring} focus:ring-1 shadow-none h-8 px-2`}
                                                    />
                                                </TableCell>
                                                <TableCell className="p-1">
                                                    <input type="number" min="0" step="0.01" value={pi.qty || ""} onChange={e => updateItem(idx, 'qty', parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleItemKeyDown(e, idx, 'qty')} className={invisibleInputClass} />
                                                </TableCell>
                                                <TableCell className="p-1">
                                                    <input type="number" min="0" step="0.01" value={pi.rate || ""} onChange={e => updateItem(idx, 'rate', parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleItemKeyDown(e, idx, 'rate')} className={invisibleInputClass} />
                                                </TableCell>
                                                <TableCell className="p-1 text-sm font-semibold text-slate-500">
                                                    {itemDef?.unit || "—"}
                                                </TableCell>
                                                <TableCell className="p-1">
                                                    <input type="number" min="0" step="0.01" value={pi.amount || ""} onChange={e => updateItem(idx, 'amount', parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleItemKeyDown(e, idx, 'amount')} className={invisibleInputClass} readOnly />
                                                </TableCell>
                                                <TableCell className="p-1 text-center">
                                                    {selectedItems.length > 1 && (
                                                        <button type="button" onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-500">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )})}
                                    </TableBody>
                                </Table>
                                <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/50 p-2 sm:flex-row sm:items-center sm:justify-between">
                                    <Button type="button" variant="outline" size="sm" onClick={addItemLine} className="gap-2 h-8">
                                        <Plus className="h-4 w-4" /> Add Item
                                    </Button>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-500">Add ledger</span>
                                        <div className="w-56">
                                            <ComboboxInput
                                                value={pctLedgerId}
                                                onChange={setPctLedgerId}
                                                options={detailLedgerOptions}
                                                placeholder="Charge / discount ledger..."
                                                className="h-8"
                                                inputClassName="border-slate-300 h-8"
                                            />
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={pctValue || ""}
                                            onChange={e => setPctValue(parseFloat(e.target.value) || 0)}
                                            placeholder="%"
                                            className="h-8 w-20 rounded-md border border-slate-300 px-2 text-right text-sm"
                                        />
                                        <span className="text-xs text-slate-400">% of {itemsSubtotal.toLocaleString()}</span>
                                        <Button type="button" variant="outline" size="sm" onClick={applyPercentageLedger} className="h-8">Add</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* LEDGER TABLE (For all vouchers) */}
                        <div className="rounded-md border border-slate-200 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow className="border-b-slate-200">
                                        <TableHead className={`${isSingleEntry ? 'w-[50%]' : 'w-[40%]'} text-slate-500 font-semibold h-9 px-2`}>
                                            {isSingleEntry ? "Party / Ledger" : "Ledger"}
                                        </TableHead>
                                        {isSingleEntry && (
                                            <>
                                                <TableHead className="text-slate-500 font-semibold h-9 px-2">Manage</TableHead>
                                                <TableHead className="text-right text-slate-500 font-semibold h-9 px-4">Amount</TableHead>
                                            </>
                                        )}
                                        {!isSingleEntry && (
                                            <>
                                                <TableHead className="text-right text-slate-500 font-semibold h-9 px-4">Debit</TableHead>
                                                <TableHead className="text-right text-slate-500 font-semibold h-9 px-4">Credit</TableHead>
                                            </>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {showLedgerRows ? selectedLedgers
                                      .map((sl, index) => ({ sl, index }))
                                      .filter(({ sl, index }) => index === 0 || sl.forceVisible || sl.ledger_id || sl.amount > 0 || sl.debit_amount > 0 || sl.credit_amount > 0)
                                      .map(({ sl, index }) => (
                                        <TableRow key={`ledger-${index}`} className={`border-b-slate-100 h-10 ${theme.hover}`}>
                                            <TableCell className="p-1 relative group">
                                                {sl.display_label || ledgerLabels[sl.ledger_id] ? (
                                                    <div className="flex h-8 items-center rounded-md px-2 font-semibold text-slate-700">
                                                        {sl.display_label || ledgerLabels[sl.ledger_id]}
                                                    </div>
                                                ) : (
                                                    <ComboboxInput
                                                        value={sl.ledger_id}
                                                        onChange={(val) => updateLedger(index, 'ledger_id', val)}
                                                        options={detailLedgerOptions}
                                                        placeholder={detailLedgerOptions.length > 0 ? detailPlaceholder : "Select party above or create a ledger in Accounts Info"}
                                                        className="h-8"
                                                        inputClassName="bg-transparent border-transparent hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-none h-8 px-2"
                                                    />
                                                )}
                                                {formatBalance(sl.ledger_id) && (
                                                    <p className="px-2 text-[11px] font-semibold text-slate-400">Current Bal: {formatBalance(sl.ledger_id)}</p>
                                                )}
                                            </TableCell>
                                            {isSingleEntry && (
                                                <>
                                                    <TableCell className="p-1">
                                                        {sl.ledger_id && (!ledgers.find(l => l.id === sl.ledger_id)?.is_cash_bank) ? (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openBillWiseManager(index)}
                                                                className="h-8 px-3 text-xs font-bold"
                                                            >
                                                                Manage
                                                            </Button>
                                                        ) : <span className="px-2 text-slate-300">-</span>}
                                                        {sl.adjustment_method && (
                                                            <span className="ml-2 text-xs font-semibold text-slate-400">
                                                                {sl.adjustment_method}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="p-1">
                                                        <input type="number" min="0" step="0.01" value={sl.amount || ""} onChange={e => updateLedger(index, 'amount', parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleLedgerKeyDown(e, index, 'amount')} className={invisibleInputClass} />
                                                    </TableCell>
                                                </>
                                            )}
                                            {!isSingleEntry && (
                                                <>
                                                    <TableCell className="p-1">
                                                        <input type="number" min="0" step="0.01" value={sl.debit_amount || ""} onChange={e => updateLedger(index, 'debit_amount', parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleLedgerKeyDown(e, index, 'debit_amount')} className={invisibleInputClass} disabled={sl.credit_amount > 0} />
                                                    </TableCell>
                                                    <TableCell className="p-1">
                                                        <input type="number" min="0" step="0.01" value={sl.credit_amount || ""} onChange={e => updateLedger(index, 'credit_amount', parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleLedgerKeyDown(e, index, 'credit_amount')} className={invisibleInputClass} disabled={sl.debit_amount > 0} />
                                                    </TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center text-slate-400">
                                                Select an account or party above to begin entries
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Action bar: Offset + Add Ledger sit below the rows and move down as rows grow */}
                            <div className="flex items-center gap-4 border-t border-slate-200 bg-white px-4 py-2">
                                {voucherType !== "Sales" && voucherType !== "Contra" && (
                                    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600">
                                        <input
                                            type="checkbox"
                                            checked={offsetEnabled}
                                            onChange={e => setOffsetEnabled(e.target.checked)}
                                            className="h-4 w-4 accent-slate-700"
                                        />
                                        Offset against party
                                    </label>
                                )}
                                {voucherType !== "Contra" && (
                                    <Button type="button" variant="outline" size="sm" onClick={addLedgerLine} className="gap-2 h-8">
                                        <Plus className="h-4 w-4" /> Add Ledger
                                    </Button>
                                )}
                            </div>

                            {/* Footer: Narration & Totals */}
                            <div className="flex flex-col gap-4 bg-slate-50/50 border-t border-slate-300 px-4 py-4 sm:flex-row sm:items-end sm:justify-between">
                                {/* Narration - Left Side */}
                                <div className="w-full flex gap-2 items-center sm:w-[60%]">
                                    <Label className="text-slate-700 font-semibold whitespace-nowrap">Narration:</Label>
                                    <Input
                                        value={narration}
                                        onChange={e => setNarration(e.target.value)}
                                        required
                                        className="h-8 bg-transparent border-t-0 border-x-0 border-b-slate-400 rounded-none focus-visible:ring-0 focus-visible:border-slate-600 px-1 shadow-none w-full"
                                    />
                                </div>

                                {/* Totals - Right Side */}
                                <div className="flex justify-end gap-6 text-sm font-bold text-slate-800 items-center">
                                    <div className="text-slate-500 mr-2 border-b border-transparent">Total:</div>
                                    {isSingleEntry ? (
                                        <div className={`min-w-[120px] text-right border-t border-b-4 border-double ${theme.totalsBorder} py-1 px-2 ${theme.text}`}>
                                            {totalAmount.toFixed(2)}
                                        </div>
                                    ) : (
                                        <>
                                            <div className={`min-w-[120px] text-right border-t border-b-4 border-double py-1 px-2 ${totalDebit !== totalCredit ? 'text-red-600 border-red-600' : `${theme.totalsBorder} ${theme.text}`}`}>
                                                {totalDebit.toFixed(2)}
                                            </div>
                                            <div className={`min-w-[120px] text-right border-t border-b-4 border-double py-1 px-2 ${totalDebit !== totalCredit ? 'text-red-600 border-red-600' : `${theme.totalsBorder} ${theme.text}`}`}>
                                                {totalCredit.toFixed(2)}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSubmitting || !isBalanced} className={`${theme.button} h-11 min-w-[140px] px-6 font-bold text-white`}>
                                {isSubmitting ? "Saving..." : `Save ${voucherType}`}
                            </Button>
                        </div>
                    </form>
                </div>
            </section>

            <Dialog open={managedLedgerIndex !== null} onOpenChange={(open) => !open && setManagedLedgerIndex(null)}>
                <DialogContent className="max-w-4xl overflow-hidden border-slate-300 bg-[#e5f0ec] p-0 text-slate-900">
                    <DialogHeader className="border-b border-emerald-900 bg-emerald-950 px-5 py-3 text-white">
                        <DialogTitle className="text-base font-black">Bill-wise Details</DialogTitle>
                    </DialogHeader>

                    {managedLedgerIndex !== null && managedLedger && (
                        <div>
                            <div className="border-b border-slate-300 bg-[#f4fbf8] px-5 py-4 text-center text-sm font-semibold">
                                <span>Bill-wise Details for: </span>
                                <span className="font-black">{managedLedgerName || "Selected Ledger"}</span>
                                <span className="ml-2">
                                    Upto ₦{Number(managedLedger.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {managedAmountSide}
                                </span>
                            </div>

                            <div className="overflow-x-auto p-5">
                                <div className="min-w-[720px] overflow-hidden rounded-lg border border-slate-300 bg-white">
                                    <div className="grid grid-cols-[180px_1fr_180px_150px] border-b border-slate-300 bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                                        <div className="border-r border-slate-300 px-3 py-2">Type of Ref</div>
                                        <div className="border-r border-slate-300 px-3 py-2">Name</div>
                                        <div className="border-r border-slate-300 px-3 py-2">Due Date / Ref Days</div>
                                        <div className="px-3 py-2 text-right">Amount {managedAmountSide}</div>
                                    </div>

                                    <div className="grid grid-cols-[180px_1fr_180px_150px] items-center border-b border-slate-200">
                                        <div className="border-r border-slate-200 p-2">
                                            <Select
                                                value={managedLedger.adjustment_method || "On Account"}
                                                onValueChange={(value: any) => updateLedger(managedLedgerIndex, "adjustment_method", value)}
                                            >
                                                <SelectTrigger className="h-9 border-slate-300 bg-white text-sm font-semibold">
                                                    <SelectValue placeholder="Method of Adj." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-slate-300 text-slate-900">
                                                    <SelectItem value="Advance">Advance</SelectItem>
                                                    <SelectItem value="Against Reference">Agst Ref</SelectItem>
                                                    <SelectItem value="New Reference">New Ref</SelectItem>
                                                    <SelectItem value="On Account">On Account</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="border-r border-slate-200 p-2">
                                            {managedLedger.adjustment_method === "New Reference" && voucherType === "Payment" ? (
                                                <ComboboxInput
                                                    value={managedLedger.adjustment_reference || ""}
                                                    onChange={(value) => updateLedger(managedLedgerIndex, "adjustment_reference", value)}
                                                    options={programs.map(program => ({
                                                        value: program.id,
                                                        label: `${program.name}${program.amount_to_contribute ? ` - ₦${Number(program.amount_to_contribute).toLocaleString()}` : ""}`,
                                                    }))}
                                                    placeholder="Select program..."
                                                    className="h-9"
                                                    inputClassName="border-slate-300"
                                                />
                                            ) : (
                                                <Input
                                                    value={managedLedger.adjustment_reference || ""}
                                                    onChange={(event) => updateLedger(managedLedgerIndex, "adjustment_reference", event.target.value)}
                                                    placeholder={managedLedger.adjustment_method === "On Account" ? "On Account" : "Reference name"}
                                                    disabled={managedLedger.adjustment_method === "On Account"}
                                                    className="h-9 border-slate-300 bg-white"
                                                />
                                            )}
                                        </div>

                                        <div className="border-r border-slate-200 p-2">
                                            <Input
                                                type="date"
                                                value={managedLedger.due_date || ""}
                                                onChange={(event) => updateLedger(managedLedgerIndex, "due_date", event.target.value)}
                                                className="h-9 border-slate-300 bg-white"
                                            />
                                        </div>

                                        <div className="p-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={managedLedger.amount || ""}
                                                onChange={(event) => updateLedger(managedLedgerIndex, "amount", parseFloat(event.target.value) || 0)}
                                                className="h-9 border-slate-300 bg-white text-right font-mono font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end px-3 py-3 text-sm font-black">
                                        <span className="min-w-[150px] border-y-2 border-slate-800 py-1 text-right">
                                            ₦{Number(managedLedger.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {managedAmountSide}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="border-t border-emerald-200 bg-emerald-50 px-5 py-3">
                                <Button type="button" variant="outline" onClick={() => setManagedLedgerIndex(null)}>
                                    Quit
                                </Button>
                                <Button type="button" onClick={() => setManagedLedgerIndex(null)} className="bg-emerald-700 px-6 font-bold text-white hover:bg-emerald-800">
                                    Accept
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
