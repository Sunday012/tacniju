"use client"

import Link from "next/link"
import { ArrowLeft, Building2, MessageSquareText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { LedgerTransactionRow } from "@/app/accounting/actions"

type Metric = {
  label: string
  value: string
}

type Field = {
  label: string
  value: string
}

type DetailSection = {
  title: string
  fields: Field[]
}

type TransactionDisplayMode = "raw" | "bank-daybook" | "ledger-party"

function formatIsoDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-")
  if (!year || !month || !day) return dateValue
  return `${day}/${month}/${year}`
}

function getVoucherHref(voucherType: string, voucherId: string) {
  const slug = voucherType.toLowerCase()
  return `/accounting/vouchers/${slug}/${voucherId}`
}

function getTransactionDisplayAmounts(item: LedgerTransactionRow, mode: TransactionDisplayMode) {
  if (mode === "raw") {
    return {
      debit: item.debitAmount,
      credit: item.creditAmount,
    }
  }

  const amount = Math.max(item.debitAmount, item.creditAmount)
  const bankDebitTypes = new Set(["Payment", "Sales", "Income"])
  const bankCreditTypes = new Set(["Receipt", "Contra", "Expense", "Purchase", "Program"])
  const isBankDebit = bankDebitTypes.has(item.voucherType)
  const isBankCredit = bankCreditTypes.has(item.voucherType)

  if (!isBankDebit && !isBankCredit) {
    return {
      debit: item.debitAmount,
      credit: item.creditAmount,
    }
  }

  const showDebit = mode === "bank-daybook" ? isBankDebit : isBankCredit
  return {
    debit: showDebit ? amount : 0,
    credit: showDebit ? 0 : amount,
  }
}

export function InfoRecordProfile({
  title,
  subtitle,
  backHref,
  backLabel,
  metrics,
  details,
  transactionRows = [],
  transactionStartDate,
  transactionEndDate,
  comment,
  commentTabLabel = "Comments",
  transactionDisplayMode = "raw",
}: {
  title: string
  subtitle?: string
  backHref: string
  backLabel: string
  metrics: Metric[]
  details: DetailSection[]
  transactionRows?: LedgerTransactionRow[]
  transactionStartDate?: string
  transactionEndDate?: string
  comment?: string
  commentTabLabel?: string
  transactionDisplayMode?: TransactionDisplayMode
}) {
  const currentYear = new Date().getFullYear()
  const startDate = transactionStartDate || `${currentYear}-01-01`
  const endDate = transactionEndDate || `${currentYear}-12-31`
  const transactionPeriod = `${formatIsoDate(startDate)} to ${formatIsoDate(endDate)}`

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-900">
      <div className="bg-[#ececff]">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <Link href={backHref} className="inline-flex items-center gap-2 text-base font-medium text-slate-700 transition hover:text-slate-950">
            <ArrowLeft className="h-5 w-5" />
            Back to {backLabel}
          </Link>

          <div className="mt-5">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-2 text-base text-slate-600">{subtitle}</p> : null}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {metrics.map(metric => (
              <div key={metric.label} className="border-l border-slate-500/50 pl-5">
                <p className="text-xl font-medium text-slate-700">{metric.label}</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="h-auto w-full justify-start gap-8 rounded-none border-b border-slate-200 bg-transparent p-0 text-left">
            <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent px-0 py-4 text-lg font-medium text-slate-500 shadow-none data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none">
              Details
            </TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-none border-b-2 border-transparent px-0 py-4 text-lg font-medium text-slate-500 shadow-none data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="comments" className="rounded-none border-b-2 border-transparent px-0 py-4 text-lg font-medium text-slate-500 shadow-none data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none">
              {commentTabLabel}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-5">
            {details.map(section => (
              <Card key={section.title} className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900">{section.title}</h2>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {section.fields.map(field => (
                      <div key={field.label}>
                        <p className="text-sm font-medium uppercase tracking-wide text-slate-400">{field.label}</p>
                        <p className="mt-2 text-xl font-medium text-slate-800">{field.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="overflow-hidden rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-200 pb-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <CardTitle className="text-2xl font-semibold text-slate-900">Transactions</CardTitle>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Period</p>
                      <p className="mt-1 font-semibold text-slate-800">{transactionPeriod}</p>
                    </div>
                  </div>
                  <form className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="space-y-1.5">
                      <label htmlFor="start" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Start</label>
                      <Input id="start" name="start" type="date" defaultValue={startDate} className="w-full sm:w-[180px]" onChange={(event) => event.currentTarget.form?.requestSubmit()} />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="end" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">End</label>
                      <Input id="end" name="end" type="date" defaultValue={endDate} className="w-full sm:w-[180px]" onChange={(event) => event.currentTarget.form?.requestSubmit()} />
                    </div>
                  </form>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50 [&_th]:px-5 [&_th]:py-3.5 [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="pl-8">VCH Type</TableHead>
                      <TableHead>VCH No.</TableHead>
                      <TableHead className="text-right">Debit (NGN)</TableHead>
                      <TableHead className="text-right">Credit (NGN)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100 [&_td]:px-5 [&_td]:py-3.5 [&_tr:hover]:bg-slate-50/60">
                    {transactionRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                          No transactions recorded for this period.
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactionRows.map(item => {
                        const displayAmounts = getTransactionDisplayAmounts(item, transactionDisplayMode)
                        return (
                          <TableRow key={item.id} className="cursor-pointer">
                            <TableCell className="text-slate-500">{formatIsoDate(item.date)}</TableCell>
                            <TableCell className="font-medium text-slate-800">
                              <Link href={getVoucherHref(item.voucherType, item.voucherId)} className="block hover:text-indigo-700">
                                {item.detailName}
                              </Link>
                            </TableCell>
                            <TableCell className="pl-8 text-slate-500">{item.voucherType}</TableCell>
                            <TableCell className="text-slate-500">
                              <Link href={getVoucherHref(item.voucherType, item.voucherId)} className="hover:text-indigo-700">
                                {item.voucherNumber || "-"}
                              </Link>
                            </TableCell>
                            <TableCell className="text-right text-slate-700">
                              {displayAmounts.debit > 0 ? displayAmounts.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
                            </TableCell>
                            <TableCell className="text-right text-slate-700">
                              {displayAmounts.credit > 0 ? displayAmounts.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments">
            <Card className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <MessageSquareText className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-900">{commentTabLabel}</h2>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-base text-slate-600">
                  {comment || "No comments added yet."}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
