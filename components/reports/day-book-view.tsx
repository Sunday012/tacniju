"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { deleteVoucher } from "@/app/vouchers/actions"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

// Vouchers are listed serially by type: all Receipts, then Payments, then Sales, etc.
const voucherOrder = ["Receipt", "Payment", "Sales", "Purchase", "Expense", "Income", "Program", "Contra"]

const typeBadge: Record<string, string> = {
    Receipt: "bg-emerald-100 text-emerald-700",
    Payment: "bg-red-100 text-red-700",
    Sales: "bg-blue-100 text-blue-700",
    Purchase: "bg-indigo-100 text-indigo-700",
    Expense: "bg-amber-100 text-amber-700",
    Income: "bg-amber-100 text-amber-700",
    Program: "bg-violet-100 text-violet-700",
    Contra: "bg-slate-200 text-slate-700",
}

function formatIsoDate(dateValue: string) {
    const [year, month, day] = dateValue.split("-")
    if (!year || !month || !day) return dateValue
    return `${day}/${month}/${year}`
}

function getVoucherHref(voucherType: string, voucherId: string, fromDayBook = false) {
    return `/accounting/vouchers/${voucherType.toLowerCase()}/${voucherId}${fromDayBook ? "?from=daybook" : ""}`
}

function getVoucherDisplayAmounts(voucherType: string, debit: number, credit: number) {
    const total = Math.max(debit, credit)

    switch (voucherType) {
        case "Payment":
        case "Expense":
        case "Sales":
            return { debitDisplay: null as number | null, creditDisplay: total }
        case "Receipt":
        case "Income":
        case "Program":
        case "Purchase":
            return { debitDisplay: total, creditDisplay: null as number | null }
        case "Contra":
            return { debitDisplay: null as number | null, creditDisplay: total }
        default:
            return { debitDisplay: debit || null, creditDisplay: credit || null }
    }
}

type DayBookViewProps = {
    data: any[]
    selectedDate: string
    startDate: string
    endDate: string
    actionPath?: string
    onBack?: () => void
}

export function DayBookView({
    data,
    selectedDate,
    startDate,
    endDate,
    actionPath = "/accounting/day-book",
    onBack,
}: DayBookViewProps) {
    const router = useRouter()
    const isPeriodMode = Boolean(startDate || endDate)

    function clearPeriod(form: HTMLFormElement) {
        const dateInput = form.elements.namedItem("date") as HTMLInputElement | null
        const startInput = form.elements.namedItem("start") as HTMLInputElement | null
        const endInput = form.elements.namedItem("end") as HTMLInputElement | null
        if (!dateInput || !startInput || !endInput) return
        startInput.value = ""
        endInput.value = ""
    }

    function clearDate(form: HTMLFormElement) {
        const dateInput = form.elements.namedItem("date") as HTMLInputElement | null
        if (!dateInput) return
        dateInput.value = ""
    }

    function getEntryTotals(entries: any[] = []) {
        return entries.reduce(
            (totals, entry) => ({
                debit: totals.debit + Number(entry.debit_amount || 0),
                credit: totals.credit + Number(entry.credit_amount || 0),
            }),
            { debit: 0, credit: 0 }
        )
    }

    function getQtyTotals(vItems: any[] = []) {
        return vItems.reduce(
            (totals, item) => {
                const qty = Number(item.qty || 0)
                if (item.movement_type === "IN") totals.inward += qty
                else totals.outward += qty
                return totals
            },
            { inward: 0, outward: 0 }
        )
    }

    function getMainParties(voucherType: string, entries: any[] = []) {
        if (voucherType === "Contra") {
            const sendingEntries = entries.filter(entry => Number(entry.credit_amount || 0) > 0)
            const names = sendingEntries
                .map(entry => entry.ledgers?.name)
                .filter(Boolean)

            return Array.from(new Set(names))
        }

        const preferredSideByType: Record<string, "debit" | "credit" | null> = {
            Receipt: "credit",
            Payment: "debit",
            Sales: "debit",
            Purchase: "credit",
            Expense: "debit",
            Income: "credit",
            Program: "credit",
            Contra: null,
        }
        const nonCashEntries = entries.filter(entry => !entry.ledgers?.is_cash_bank)
        const preferredSide = preferredSideByType[voucherType] ?? null
        const preferredEntries = preferredSide
            ? nonCashEntries.filter(entry => Number(entry[`${preferredSide}_amount`] || 0) > 0)
            : nonCashEntries
        const displayEntries = preferredEntries.length > 0
            ? preferredEntries
            : nonCashEntries.length > 0
                ? nonCashEntries
                : entries
        const names = displayEntries
            .map(entry => entry.ledgers?.name)
            .filter(Boolean)

        return Array.from(new Set(names))
    }

    const sortedData = [...data].sort((a, b) => {
        const typeDiff = voucherOrder.indexOf(a.voucher_type) - voucherOrder.indexOf(b.voucher_type)
        if (typeDiff !== 0) return typeDiff
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })

    const totals = sortedData.reduce((acc, voucher) => {
        const entryTotals = getEntryTotals(voucher.voucher_entries || [])
        const value = Math.max(entryTotals.debit, entryTotals.credit)
        if (voucher.voucher_type === "Receipt") acc.receiptsPayments += value
        if (voucher.voucher_type === "Payment") acc.receiptsPayments += value
        if (voucher.voucher_type === "Sales") acc.sales += value
        if (voucher.voucher_type === "Purchase") acc.purchases += value
        if (voucher.voucher_type === "Expense") acc.expenses += value
        return acc
    }, { receiptsPayments: 0, sales: 0, purchases: 0, expenses: 0 })

    // Group serially so each voucher type renders together with a section header.
    const groups = voucherOrder
        .map(type => ({ type, vouchers: sortedData.filter(v => v.voucher_type === type) }))
        .filter(group => group.vouchers.length > 0)

    async function handleDeleteVoucher(voucher: any) {
        if (!confirm(`Delete ${voucher.voucher_type} voucher ${voucher.voucher_no}?`)) return

        try {
            await deleteVoucher(voucher.id)
            toast.success("Voucher deleted")
            router.refresh()
        } catch (error: any) {
            toast.error(error?.message || "Failed to delete voucher")
        }
    }

    return (
        <div className="space-y-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <form method="get" action={actionPath} className="flex flex-col gap-3 lg:flex-row lg:items-end">
                <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Date</span>
                    <input
                        type="date"
                        name="date"
                        defaultValue={selectedDate}
                        onChange={(event) => clearPeriod(event.currentTarget.form!)}
                        className="h-11 min-w-[180px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none"
                    />
                </label>
                <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Period Start</span>
                    <input
                        type="date"
                        name="start"
                        defaultValue={startDate}
                        onChange={(event) => clearDate(event.currentTarget.form!)}
                        className="h-11 min-w-[180px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none"
                    />
                </label>
                <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Period End</span>
                    <input
                        type="date"
                        name="end"
                        defaultValue={endDate}
                        onChange={(event) => clearDate(event.currentTarget.form!)}
                        className="h-11 min-w-[180px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm focus:border-indigo-400 focus:outline-none"
                    />
                </label>
                <Button type="submit" className="h-11 bg-indigo-600 px-6 font-bold text-white hover:bg-indigo-700">Go</Button>
              </form>
              {onBack && <button onClick={onBack} className="h-10 rounded-xl bg-slate-100 px-4 text-sm font-bold text-slate-700 hover:bg-slate-200">Back</button>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    ["Total Receipts / Payment", totals.receiptsPayments],
                    ["Total Sales", totals.sales],
                    ["Total Purchase", totals.purchases],
                    ["Total Expenses", totals.expenses],
                ].map(([label, value]) => (
                    <div key={label as string} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
                        <p className="mt-2 text-2xl font-black text-slate-900">₦{Number(value).toLocaleString()}</p>
                    </div>
                ))}
            </div>

            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-xl">
                            {isPeriodMode
                                ? `Day Book — ${startDate && endDate ? `${formatIsoDate(startDate)} to ${formatIsoDate(endDate)}` : "Period View"}`
                                : `Day Book — ${formatIsoDate(selectedDate)}`}
                        </CardTitle>
                        {isPeriodMode ? (
                            <p className="text-sm text-slate-500">
                                Period: {(startDate && formatIsoDate(startDate)) || "-"} to {(endDate && formatIsoDate(endDate)) || "-"}
                            </p>
                        ) : null}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <Table>
                        <TableHeader className="bg-slate-50 [&_th]:px-5 [&_th]:py-3.5 [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600">
                            <TableRow className="border-slate-200">
                                <TableHead className="text-slate-500">Details</TableHead>
                                <TableHead className="text-slate-500">Vch Type</TableHead>
                                <TableHead className="text-slate-500">Vch No.</TableHead>
                                <TableHead className="text-slate-500 text-right">Debit (₦)<span className="block text-[10px] font-normal normal-case">Inward Qty</span></TableHead>
                                <TableHead className="text-slate-500 text-right">Credit (₦)<span className="block text-[10px] font-normal normal-case">Outward Qty</span></TableHead>
                                <TableHead className="text-right text-slate-500">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="[&_td]:px-5 [&_td]:py-3.5">
                            {groups.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-slate-500 py-6">
                                        {isPeriodMode ? "No transactions recorded in this period." : "No transactions recorded on this date."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                groups.map(group => (
                                    <GroupRows key={group.type} group={group} getEntryTotals={getEntryTotals} getQtyTotals={getQtyTotals} />
                                ))
                            )}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )

    function GroupRows({ group, getEntryTotals, getQtyTotals }: { group: { type: string, vouchers: any[] }, getEntryTotals: (e: any[]) => { debit: number, credit: number }, getQtyTotals: (i: any[]) => { inward: number, outward: number } }) {
        return (
            <>
                <TableRow className="border-slate-200 bg-slate-50">
                    <TableCell colSpan={6} className="py-2 text-xs font-black uppercase tracking-widest text-slate-500">
                        {group.type} ({group.vouchers.length})
                    </TableCell>
                </TableRow>
                {group.vouchers.map(v => {
                    const entries = v.voucher_entries || []
                    const eTotals = getEntryTotals(entries)
                    const qty = getQtyTotals(v.voucher_items || [])
                    const mainParties = getMainParties(v.voucher_type, entries)
                    return (
                        <TableRow
                            key={v.id}
                            onClick={() => router.push(getVoucherHref(v.voucher_type, v.id, true))}
                            className="cursor-pointer border-slate-200 align-top hover:bg-slate-50"
                        >
                            <TableCell>
                                <div className="space-y-0.5">
                                    {mainParties.length === 0 ? (
                                        <div className="text-xs text-red-600">No ledger entries saved.</div>
                                    ) : mainParties.map((name: string) => (
                                        <div key={name} className="text-sm font-semibold text-emerald-700">
                                            {name}
                                        </div>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold ${typeBadge[v.voucher_type] || 'bg-slate-100 text-slate-600'}`}>
                                    {v.voucher_type}
                                </span>
                            </TableCell>
                            <TableCell className="font-bold text-slate-700 text-xs">
                                {v.voucher_no}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                                <div>
                                    {getVoucherDisplayAmounts(v.voucher_type, eTotals.debit, eTotals.credit).debitDisplay
                                        ? getVoucherDisplayAmounts(v.voucher_type, eTotals.debit, eTotals.credit).debitDisplay!.toLocaleString(undefined, { minimumFractionDigits: 2 })
                                        : '-'}
                                </div>
                                {qty.inward > 0 && <div className="text-[11px] text-slate-400">{qty.inward} in</div>}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                                <div>
                                    {getVoucherDisplayAmounts(v.voucher_type, eTotals.debit, eTotals.credit).creditDisplay
                                        ? getVoucherDisplayAmounts(v.voucher_type, eTotals.debit, eTotals.credit).creditDisplay!.toLocaleString(undefined, { minimumFractionDigits: 2 })
                                        : '-'}
                                </div>
                                {qty.outward > 0 && <div className="text-[11px] text-slate-400">{qty.outward} out</div>}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    <Link
                                        href={`${getVoucherHref(v.voucher_type, v.id, true)}&edit=1`}
                                        title="Edit voucher"
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-amber-700">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            handleDeleteVoucher(v)
                                        }}
                                        className="h-8 w-8 text-slate-500 hover:bg-red-50 hover:text-red-700"
                                        title="Delete voucher"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </>
        )
    }
}
