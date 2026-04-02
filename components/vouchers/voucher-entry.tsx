"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ComboboxInput } from "@/components/ui/combobox-input"
import { saveVoucher, deleteVoucher, VoucherType, VoucherItemPayload, VoucherLedgerEntry } from "@/app/vouchers/actions"
import { Ledger } from "@/app/management/actions"
import { Item } from "@/app/inventory/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

type LedgerWithGroup = Ledger & {
    account_groups?: {
        name?: string
    } | null
}

export function VoucherEntry({ ledgers, recentVouchers, items }: { ledgers: LedgerWithGroup[], recentVouchers: any[], items: Item[] }) {
    const [voucherType, setVoucherType] = useState<VoucherType>("Payment")
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
    const [narration, setNarration] = useState("")
    const [reference, setReference] = useState("")

    const [selectedItems, setSelectedItems] = useState<VoucherItemPayload[]>([])
    // We add 'amount' to support single-entry mode (Payment, Receipt, Contra)
    const [selectedLedgers, setSelectedLedgers] = useState<any[]>([{ ledger_id: "", amount: 0, debit_amount: 0, credit_amount: 0 }])
    const [masterLedgerId, setMasterLedgerId] = useState<string>("")

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deletingVoucherId, setDeletingVoucherId] = useState<string | null>(null)
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

            if (newType) {
                e.preventDefault();
                setVoucherType(newType);
                setSelectedItems(newType === 'Sales' || newType === 'Purchase' ? [{ item_id: "", qty: 1, rate: 0, amount: 0 }] : []);
                setSelectedLedgers([{ ledger_id: "", amount: 0, debit_amount: 0, credit_amount: 0 }]);
                setMasterLedgerId("");
            }
        }
        window.addEventListener('keydown', handleKeyDown, { capture: true })
        return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
    }, [])

    const needsItems = voucherType === "Sales" || voucherType === "Purchase"

    // Ensure at least one item row if needsItems
    useEffect(() => {
        if (needsItems && selectedItems.length === 0) {
            setSelectedItems([{ item_id: "", qty: 1, rate: 0, amount: 0 }])
        } else if (!needsItems && selectedItems.length > 0) {
            setSelectedItems([])
        }
    }, [voucherType, needsItems])

    const isSingleEntry = voucherType === "Payment" || voucherType === "Receipt" || voucherType === "Contra"

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

            if (voucherType === 'Payment') masterEntry.credit_amount = totalAmount
            else if (voucherType === 'Receipt') masterEntry.debit_amount = totalAmount
            else if (voucherType === 'Contra') masterEntry.debit_amount = totalAmount

            finalLedgers.push(masterEntry)

            validLines.forEach(line => {
                finalLedgers.push({
                    ledger_id: line.ledger_id,
                    debit_amount: voucherType === 'Payment' ? line.amount : (voucherType === 'Contra' ? 0 : 0),
                    credit_amount: voucherType === 'Receipt' ? line.amount : (voucherType === 'Contra' ? line.amount : 0),
                    adjustment_method: line.adjustment_method,
                    adjustment_reference: line.adjustment_reference
                })
            })
        } else {
            finalLedgers = selectedLedgers.filter(l => l.ledger_id && (l.debit_amount > 0 || l.credit_amount > 0))
            if (finalLedgers.length < 2) return toast.error("Please enter at least two valid ledger lines (one debit, one credit).")
            if (!isBalanced) return toast.error("Voucher is not balanced. Total Debit must equal Total Credit.")
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

    async function handleDeleteVoucher(voucher: any) {
        if (!confirm(`Are you sure you want to delete voucher ${voucher.voucher_no}?`)) return

        setDeletingVoucherId(voucher.id)
        try {
            await deleteVoucher(voucher.id)
            toast.success("Voucher deleted")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete voucher.")
        } finally {
            setDeletingVoucherId(null)
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

    // -- Ledgers Management --
    function updateLedger(index: number, field: string, value: any) {
        const updated = [...selectedLedgers]
        updated[index] = { ...updated[index], [field]: value }

        // If they enter debit, zero out credit and vice versa
        if (field === 'debit_amount' && value > 0) updated[index].credit_amount = 0
        if (field === 'credit_amount' && value > 0) updated[index].debit_amount = 0

        setSelectedLedgers(updated)
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

    const invisibleInputClass = "w-full bg-transparent border-transparent hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-md px-2 h-8 text-right transition-colors"
    const invisibleSelectClass = "w-full bg-transparent border-transparent hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-8 shadow-none"

    // If single entry, top account dropdown list
    const topAccountLedgers = ledgers.filter(l => voucherType === 'Contra' ? l.is_cash_bank : true) // usually filtered for cash/bank on payment/receipt too, but let's allow all just in case or filter later
    const ledgerOptions = ledgers.map((ledger) => {
        const groupName = ledger.account_groups?.name
        return {
            value: ledger.id,
            label: groupName ? `${ledger.name} (${groupName})` : ledger.name,
        }
    })
    const topAccountOptions = topAccountLedgers.map((ledger) => {
        const groupName = ledger.account_groups?.name
        return {
            value: ledger.id,
            label: groupName ? `${ledger.name} (${groupName})` : ledger.name,
        }
    })

    return (
        <div className="w-full">
            <Card className="bg-white shadow-sm border-slate-200">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Voucher Entry</CardTitle>
                        <Select value={voucherType} onValueChange={(v: VoucherType) => {
                            setVoucherType(v)
                            setSelectedItems(v === 'Sales' || v === 'Purchase' ? [{ item_id: "", qty: 1, rate: 0, amount: 0 }] : [])
                            setSelectedLedgers([{ ledger_id: "", debit_amount: 0, credit_amount: 0 }])
                        }}>
                            <SelectTrigger className="w-[180px] bg-slate-50 border-emerald-600/50 text-emerald-400 font-semibold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-300 text-slate-900">
                                <SelectItem value="Contra">Contra (Alt+C)</SelectItem>
                                <SelectItem value="Payment">Payment (Alt+P)</SelectItem>
                                <SelectItem value="Receipt">Receipt (Alt+R)</SelectItem>
                                <SelectItem value="Sales">Sales (Alt+S)</SelectItem>
                                <SelectItem value="Purchase">Purchase (Alt+U)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <Label className="w-16 text-slate-500">Date</Label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required className="h-8 bg-transparent border-t-0 border-x-0 border-b-slate-200 rounded-none focus-visible:ring-0 focus-visible:border-emerald-500 px-1 [&::-webkit-calendar-picker-indicator]:hidden" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="w-16 text-slate-500">Ref</Label>
                            <Input value={reference} onChange={e => setReference(e.target.value)} placeholder="Ref / Cheque No" className="h-8 bg-transparent border-t-0 border-x-0 border-b-slate-200 rounded-none focus-visible:ring-0 focus-visible:border-emerald-500 px-1" />
                        </div>
                    </div>

                    {isSingleEntry && (
                        <div className="mt-6 flex items-center bg-emerald-50/50 p-2 rounded-md border border-emerald-100">
                            <Label className="w-24 font-bold text-slate-700">Account :</Label>
                            <div className="flex-1">
                                <ComboboxInput
                                    value={masterLedgerId}
                                    onChange={(val) => setMasterLedgerId(val)}
                                    options={topAccountOptions}
                                    placeholder={topAccountOptions.length > 0 ? "Type ledger or group name..." : "No ledgers found. Create one in Accounts Info."}
                                    className="h-10 border-slate-300 font-semibold shadow-sm bg-white rounded-md"
                                    inputClassName="bg-transparent border-none focus-visible:ring-0 shadow-none font-semibold text-slate-800"
                                />
                            </div>
                        </div>
                    )}
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* ITEM TABLE (For Sales/Purchase) */}
                        {needsItems && (
                            <div className="rounded-md border border-slate-200 overflow-hidden mb-6">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow className="border-b-slate-200">
                                            <TableHead className="w-[40%] text-slate-500 font-semibold h-9 px-2">Name of Item</TableHead>
                                            <TableHead className="text-right text-slate-500 font-semibold h-9 px-2">Quantity</TableHead>
                                            <TableHead className="text-right text-slate-500 font-semibold h-9 px-2">Rate</TableHead>
                                            <TableHead className="text-right text-slate-500 font-semibold h-9 px-2">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedItems.map((pi, idx) => (
                                            <TableRow key={`item-${idx}`} className="border-b-slate-100 h-10 hover:bg-emerald-50/30">
                                                <TableCell className="p-1 relative group">
                                                    <ComboboxInput
                                                        value={pi.item_id}
                                                        onChange={(val) => updateItem(idx, 'item_id', val)}
                                                        options={items.map(i => ({ value: i.id, label: i.name }))}
                                                        placeholder="Type item..."
                                                        className="h-8"
                                                        inputClassName="bg-transparent border-transparent hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-none h-8 px-2"
                                                    />
                                                </TableCell>
                                                <TableCell className="p-1">
                                                    <input type="number" min="0" step="0.01" value={pi.qty || ""} onChange={e => updateItem(idx, 'qty', parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleItemKeyDown(e, idx, 'qty')} className={invisibleInputClass} />
                                                </TableCell>
                                                <TableCell className="p-1">
                                                    <input type="number" min="0" step="0.01" value={pi.rate || ""} onChange={e => updateItem(idx, 'rate', parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleItemKeyDown(e, idx, 'rate')} className={invisibleInputClass} />
                                                </TableCell>
                                                <TableCell className="p-1">
                                                    <input type="number" min="0" step="0.01" value={pi.amount || ""} onChange={e => updateItem(idx, 'amount', parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleItemKeyDown(e, idx, 'amount')} className={invisibleInputClass} readOnly />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* LEDGER TABLE (For all vouchers) */}
                        <div className="rounded-md border border-slate-200 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow className="border-b-slate-200">
                                        <TableHead className={`${isSingleEntry ? 'w-[50%]' : 'w-[40%]'} text-slate-500 font-semibold h-9 px-2`}>Particulars (Ledger)</TableHead>
                                        {isSingleEntry && (
                                            <>
                                                <TableHead className="text-slate-500 font-semibold h-9 px-2">Method</TableHead>
                                                <TableHead className="text-slate-500 font-semibold h-9 px-2">Ref</TableHead>
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
                                    {(!isSingleEntry || masterLedgerId) ? selectedLedgers.map((sl, idx) => (
                                        <TableRow key={`ledger-${idx}`} className="border-b-slate-100 h-10 hover:bg-emerald-50/30">
                                            <TableCell className="p-1 relative group">
                                                <ComboboxInput
                                                    value={sl.ledger_id}
                                                    onChange={(val) => updateLedger(idx, 'ledger_id', val)}
                                                    options={ledgerOptions}
                                                    placeholder={ledgerOptions.length > 0 ? "Type ledger or group name..." : "No ledgers found"}
                                                    className="h-8"
                                                    inputClassName="bg-transparent border-transparent hover:border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-none h-8 px-2"
                                                />
                                            </TableCell>
                                            {isSingleEntry && (
                                                <>
                                                    <TableCell className="p-1">
                                                        {sl.ledger_id && (!ledgers.find(l => l.id === sl.ledger_id)?.is_cash_bank) ? (
                                                            <Select value={sl.adjustment_method || ''} onValueChange={(v: any) => updateLedger(idx, 'adjustment_method', v)}>
                                                                <SelectTrigger className={`border-none ${invisibleSelectClass} px-1 text-xs`}>
                                                                    <SelectValue placeholder="Method" />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-white border-slate-300">
                                                                    <SelectItem value="Advance">Advance</SelectItem>
                                                                    <SelectItem value="Against Reference">Against Ref</SelectItem>
                                                                    <SelectItem value="New Reference">New Ref</SelectItem>
                                                                    <SelectItem value="On Account">On Account</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        ) : <span className="text-transparent px-2">-</span>}
                                                    </TableCell>
                                                    <TableCell className="p-1">
                                                        {(sl.adjustment_method && sl.adjustment_method !== 'On Account') ? (
                                                            <input type="text" value={sl.adjustment_reference || ""} onChange={e => updateLedger(idx, 'adjustment_reference', e.target.value)} placeholder="Ref No" className={`${invisibleInputClass} text-left text-xs`} />
                                                        ) : <span className="text-transparent px-2">-</span>}
                                                    </TableCell>
                                                    <TableCell className="p-1">
                                                        <input type="number" min="0" step="0.01" value={sl.amount || ""} onChange={e => updateLedger(idx, 'amount', parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleLedgerKeyDown(e, idx, 'amount')} className={invisibleInputClass} />
                                                    </TableCell>
                                                </>
                                            )}
                                            {!isSingleEntry && (
                                                <>
                                                    <TableCell className="p-1">
                                                        <input type="number" min="0" step="0.01" value={sl.debit_amount || ""} onChange={e => updateLedger(idx, 'debit_amount', parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleLedgerKeyDown(e, idx, 'debit_amount')} className={invisibleInputClass} disabled={sl.credit_amount > 0} />
                                                    </TableCell>
                                                    <TableCell className="p-1">
                                                        <input type="number" min="0" step="0.01" value={sl.credit_amount || ""} onChange={e => updateLedger(idx, 'credit_amount', parseFloat(e.target.value) || 0)} onKeyDown={(e) => handleLedgerKeyDown(e, idx, 'credit_amount')} className={invisibleInputClass} disabled={sl.debit_amount > 0} />
                                                    </TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-slate-400">
                                                Select an Account above to begin entries
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Footer: Narration & Totals */}
                            <div className="flex items-end justify-between bg-slate-50/50 border-t border-slate-300 px-4 py-4">
                                {/* Narration - Left Side */}
                                <div className="w-[60%] flex gap-2 items-center">
                                    <Label className="text-slate-700 font-semibold whitespace-nowrap">Narration:</Label>
                                    <Input
                                        value={narration}
                                        onChange={e => setNarration(e.target.value)}
                                        required
                                        className="h-8 bg-transparent border-t-0 border-x-0 border-b-slate-400 rounded-none focus-visible:ring-0 focus-visible:border-emerald-600 px-1 shadow-none w-full"
                                    />
                                </div>

                                {/* Totals - Right Side */}
                                <div className="flex justify-end gap-6 text-sm font-bold text-slate-800 items-center">
                                    <div className="text-slate-500 mr-2 border-b border-transparent">Total:</div>
                                    {isSingleEntry ? (
                                        <div className="min-w-[120px] text-right border-t border-b-4 border-double border-slate-800 py-1 px-2">
                                            {totalAmount.toFixed(2)}
                                        </div>
                                    ) : (
                                        <>
                                            <div className={`min-w-[120px] text-right border-t border-b-4 border-double border-slate-800 py-1 px-2 ${totalDebit !== totalCredit ? 'text-red-600 border-red-600' : ''}`}>
                                                {totalDebit.toFixed(2)}
                                            </div>
                                            <div className={`min-w-[120px] text-right border-t border-b-4 border-double border-slate-800 py-1 px-2 ${totalDebit !== totalCredit ? 'text-red-600 border-red-600' : ''}`}>
                                                {totalCredit.toFixed(2)}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSubmitting || !isBalanced} className="bg-emerald-600 hover:bg-emerald-500 min-w-[120px]">
                                {isSubmitting ? "Saving..." : `Save ${voucherType}`}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="mt-6 bg-white shadow-sm border-slate-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Recent Vouchers</CardTitle>
                    <CardDescription>Review recent entries and remove any that were posted by mistake.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-slate-200 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow className="border-b-slate-200">
                                    <TableHead className="text-slate-500 font-semibold">Voucher No</TableHead>
                                    <TableHead className="text-slate-500 font-semibold">Type</TableHead>
                                    <TableHead className="text-slate-500 font-semibold">Date</TableHead>
                                    <TableHead className="text-slate-500 font-semibold">Narration</TableHead>
                                    <TableHead className="text-right text-slate-500 font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentVouchers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-slate-400">
                                            No vouchers recorded yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentVouchers.map((voucher) => (
                                        <TableRow key={voucher.id} className="border-b-slate-100 hover:bg-slate-50/50">
                                            <TableCell className="font-medium text-slate-800">{voucher.voucher_no}</TableCell>
                                            <TableCell className="text-slate-600">{voucher.voucher_type}</TableCell>
                                            <TableCell className="text-slate-600">{new Date(voucher.date).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-slate-600 max-w-[360px] truncate">{voucher.narration || "-"}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteVoucher(voucher)}
                                                    disabled={deletingVoucherId === voucher.id}
                                                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    title={`Delete ${voucher.voucher_no}`}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
