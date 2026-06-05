import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { getAccountingParties, getLedgerTransactions, getOrCreateProfilePartyLedger } from "@/app/accounting/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function PartyProfilePage({ params }: { params: { id: string } }) {
  const parties = await getAccountingParties()
  const party = parties.find(item => item.id === params.id)

  if (!party) notFound()

  const ledgerId = party.ledgerId || (await getOrCreateProfilePartyLedger(party.id)).ledgerId
  const transactions = await getLedgerTransactions(ledgerId)

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-900">
      <div className="bg-[#ececff]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/accounting/info/party" className="inline-flex items-center gap-2 text-base font-medium text-slate-700 transition hover:text-slate-950">
            <ArrowLeft className="h-5 w-5" />
            Back to Parties
          </Link>

          <div className="mt-5">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{party.name}</h1>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="border-l border-slate-500/50 pl-5">
              <p className="text-xl font-medium text-slate-700">Debit</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
                NGN{transactions.reduce((sum, item) => sum + item.debitAmount, 0).toFixed(2)}
              </p>
            </div>
            <div className="border-l border-slate-500/50 pl-5">
              <p className="text-xl font-medium text-slate-700">Credit</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
                NGN{transactions.reduce((sum, item) => sum + item.creditAmount, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="h-auto w-full justify-start gap-8 rounded-none border-b border-slate-200 bg-transparent p-0 text-left">
            <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent px-0 py-4 text-lg font-medium text-slate-500 shadow-none data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none">
              Details
            </TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-none border-b-2 border-transparent px-0 py-4 text-lg font-medium text-slate-500 shadow-none data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="comments" className="rounded-none border-b-2 border-transparent px-0 py-4 text-lg font-medium text-slate-500 shadow-none data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none">
              Comments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
              <CardContent className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-slate-400">Name</p>
                  <p className="mt-2 text-xl font-medium text-slate-800">{party.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-slate-400">Phone</p>
                  <p className="mt-2 text-xl font-medium text-slate-800">{party.phone_number || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-slate-400">Reservation</p>
                  <p className="mt-2 text-xl font-medium text-slate-800">{party.reservation_number || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-slate-400">Linked Ledger</p>
                  <p className="mt-2 text-xl font-medium text-slate-800">{ledgerId}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="overflow-hidden rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-200 pb-4">
                <CardTitle className="text-2xl font-semibold text-slate-900">Transactions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50 [&_th]:px-5 [&_th]:py-3.5 [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Voucher Type</TableHead>
                      <TableHead>Voucher No.</TableHead>
                      <TableHead className="text-right">Debit (NGN)</TableHead>
                      <TableHead className="text-right">Credit (NGN)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100 [&_td]:px-5 [&_td]:py-3.5 [&_tr:hover]:bg-slate-50/60">
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-slate-500">
                          No transactions recorded for this party yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="text-slate-500">{new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium text-slate-800">{item.detailName}</TableCell>
                          <TableCell className="text-slate-500">{item.voucherType}</TableCell>
                          <TableCell className="text-slate-500">{item.voucherNumber || "-"}</TableCell>
                          <TableCell className="text-right text-slate-700">
                            {item.debitAmount > 0 ? item.debitAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
                          </TableCell>
                          <TableCell className="text-right text-slate-700">
                            {item.creditAmount > 0 ? item.creditAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments">
            <Card className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6 text-base text-slate-600 sm:p-8">
                No comments added yet.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
