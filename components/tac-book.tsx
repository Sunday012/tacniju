"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { saveTransaction, deleteTransaction, createAccount } from "@/app/tac-book/actions"

type Money = number

export type TacBookAccount = {
  id: string
  name: string
  description?: string
  balance: Money
}

export type TacBookTransactionType = "credit" | "debit"

export type TacBookTransaction = {
  id: string
  accountId: string
  date: string
  description: string
  type: TacBookTransactionType
  amount: Money
  mode?: string
  category?: string
}

export type TacBookInitialData = {
  accounts: TacBookAccount[]
  transactions: TacBookTransaction[]
}

type FormState = {
  id?: string
  accountId: string
  date: string
  type: TacBookTransactionType
  amount: string
  description: string
  mode: string
  category: string
}

const emptyForm: FormState = {
  accountId: "",
  date: new Date().toISOString().slice(0, 10),
  type: "debit",
  amount: "",
  description: "",
  mode: "",
  category: "",
}

function formatMoney(value: Money) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(value)
}

export function TacBook({ initialData }: { initialData: TacBookInitialData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // We prioritize Props (Server Data) > State for optimistic updates
  // But since we are using server actions + revalidatePath, 
  // we can rely on props updating after action completes.
  // Ideally, we would use useOptimistic here, but let's keep it simple first.

  const transactions = initialData.transactions

  // Calculate balances dynamically from transactions
  const accounts = useMemo(() => {
    const base = initialData.accounts.map((a) => ({ ...a, balance: 0 }))
    for (const tx of transactions) {
      const account = base.find((a) => a.id === tx.accountId)
      if (!account) continue
      if (tx.type === "credit") {
        account.balance += tx.amount
      } else {
        account.balance -= tx.amount
      }
    }
    return base
  }, [initialData.accounts, transactions])

  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    initialData.accounts[0]?.id ?? ""
  )
  const [form, setForm] = useState<FormState>({ ...emptyForm, accountId: selectedAccountId })
  const [dialogOpen, setDialogOpen] = useState(false)

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + account.balance, 0),
    [accounts]
  )

  const visibleTransactions = useMemo(
    () =>
      transactions
        .filter((tx) => (selectedAccountId ? tx.accountId === selectedAccountId : true))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [transactions, selectedAccountId]
  )

  function resetForm(accountId = selectedAccountId) {
    setForm({
      ...emptyForm,
      accountId: accountId || initialData.accounts[0]?.id || "",
      date: new Date().toISOString().slice(0, 10),
    })
  }

  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [newAccountName, setNewAccountName] = useState("")
  const [newAccountDesc, setNewAccountDesc] = useState("")

  function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault()
    if (!newAccountName) return

    startTransition(async () => {
      try {
        await createAccount(newAccountName, newAccountDesc)
        setAccountDialogOpen(false)
        setNewAccountName("")
        setNewAccountDesc("")
        toast.success("Account created successfully")
      } catch (error) {
        toast.error("Failed to create account")
        console.error(error)
      }
    })
  }

  function openForNew() {
    resetForm()
    setDialogOpen(true)
  }

  function openForEdit(tx: TacBookTransaction) {
    setForm({
      id: tx.id,
      accountId: tx.accountId,
      date: tx.date,
      type: tx.type,
      amount: tx.amount.toString(),
      description: tx.description,
      mode: tx.mode ?? "",
      category: tx.category ?? "",
    })
    setDialogOpen(true)
  }

  function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this transaction?")) return

    startTransition(async () => {
      try {
        await deleteTransaction(id)
        toast.success("Transaction deleted")
      } catch (error) {
        toast.error("Failed to delete transaction")
        console.error(error)
      }
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const amountNumber = Number(form.amount)
    if (!form.accountId || !form.date || !form.description || !amountNumber || amountNumber <= 0) {
      return
    }

    const tx: TacBookTransaction = {
      id: form.id ?? `temp-${Date.now()}`, // Temporary ID for potential optimistic logic
      accountId: form.accountId,
      date: form.date,
      type: form.type,
      amount: amountNumber,
      description: form.description,
      mode: form.mode || undefined,
      category: form.category || undefined,
    }

    startTransition(async () => {
      try {
        await saveTransaction(tx)
        setDialogOpen(false)
        resetForm(tx.accountId)
        toast.success(form.id ? "Transaction updated" : "Transaction added")
      } catch (error) {
        toast.error("Failed to save transaction")
        console.error(error)
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">
              TACN IJU STATION AREA
            </p>
            <h1 className="mt-2 text-2xl md:text-3xl font-bold">
              Church Book Keeping
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Daily records for The Apostolic Church Nigeria – Iju Assembly accounts.
            </p>
          </div>
        </header>

        <main className="space-y-6">
          <Card className="bg-slate-900/80 border-slate-800 shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-sm font-semibold text-slate-300">
                <span>ACCOUNTS OVERVIEW</span>
                <span className="text-xs font-normal text-slate-400">
                  All balances accredited to TACN Iju church accounts
                </span>
                <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-xs border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300">
                      + New Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-950 text-slate-50 border-slate-800">
                    <DialogHeader>
                      <DialogTitle>Create New Account</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Add a new wallet or bank account to track.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateAccount} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label>Account Name</Label>
                        <Input
                          placeholder="e.g. Building Fund"
                          value={newAccountName}
                          onChange={e => setNewAccountName(e.target.value)}
                          required
                          className="bg-slate-900 border-slate-700"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Description</Label>
                        <Input
                          placeholder="Brief details about this account"
                          value={newAccountDesc}
                          onChange={e => setNewAccountDesc(e.target.value)}
                          className="bg-slate-900 border-slate-700"
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-500">
                          {isPending ? "Creating..." : "Create Account"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 flex items-center justify-between">
                <div className="text-xs font-medium tracking-[0.15em] text-slate-400">
                  TOTAL
                </div>
                <div className="text-lg md:text-2xl font-black text-emerald-400 tabular-nums">
                  {formatMoney(totalBalance)}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => setSelectedAccountId(account.id)}
                    className={`flex flex-col items-start rounded-2xl border px-4 py-3 text-left shadow-sm transition ${selectedAccountId === account.id
                      ? "border-emerald-400/80 bg-emerald-950/40 shadow-emerald-900/40"
                      : "border-slate-800 bg-slate-950/40 hover:border-emerald-500/40 hover:bg-slate-900/70"
                      }`}
                  >
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                      Account
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-50 line-clamp-1">
                      {account.name}
                    </div>
                    {account.description && (
                      <div className="mt-0.5 text-[11px] text-slate-400 line-clamp-1">
                        {account.description}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-slate-400">Balance</div>
                    <div className="mt-0.5 text-base font-bold text-emerald-400 tabular-nums">
                      {formatMoney(account.balance)}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-800 shadow-2xl">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-200">
                  Entries
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Track all credits and debits for the selected account.
                </CardDescription>
              </div>

              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Account</span>
                  <Select
                    value={selectedAccountId}
                    onValueChange={(value) => {
                      setSelectedAccountId(value)
                      setForm((prev) => ({ ...prev, accountId: value }))
                    }}
                  >
                    <SelectTrigger className="h-8 w-52 border-slate-700 bg-slate-900 text-xs">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 text-xs text-slate-50">
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="h-8 rounded-full bg-emerald-500 px-4 text-xs font-semibold text-emerald-950 hover:bg-emerald-400"
                      onClick={openForNew}
                    >
                      + Add transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-950 text-slate-50 border-slate-800">
                    <DialogHeader>
                      <DialogTitle className="text-base font-semibold">
                        {form.id ? "Edit transaction" : "Add transaction"}
                      </DialogTitle>
                      <DialogDescription className="text-xs text-slate-400">
                        Record a credit or debit for TACN Iju church accounts.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Date</Label>
                          <Input
                            type="date"
                            value={form.date}
                            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                            className="h-8 border-slate-700 bg-slate-900 text-xs"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Type</Label>
                          <Select
                            value={form.type}
                            onValueChange={(value: TacBookTransactionType) =>
                              setForm((prev) => ({ ...prev, type: value }))
                            }
                          >
                            <SelectTrigger className="h-8 border-slate-700 bg-slate-900 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 text-xs text-slate-50">
                              <SelectItem value="credit">Credit (+)</SelectItem>
                              <SelectItem value="debit">Debit (-)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Account</Label>
                        <Select
                          value={form.accountId}
                          onValueChange={(value) => setForm((prev) => ({ ...prev, accountId: value }))}
                        >
                          <SelectTrigger className="h-8 border-slate-700 bg-slate-900 text-xs">
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 text-xs text-slate-50">
                            {accounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Amount (₦)</Label>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.amount}
                            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                            className="h-8 border-slate-700 bg-slate-900 text-xs"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Mode</Label>
                          <Input
                            placeholder="Opay, FCMB, Cash..."
                            value={form.mode}
                            onChange={(e) => setForm((prev) => ({ ...prev, mode: e.target.value }))}
                            className="h-8 border-slate-700 bg-slate-900 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Category</Label>
                          <Input
                            placeholder="Offering, Welfare, Transport..."
                            value={form.category}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, category: e.target.value }))
                            }
                            className="h-8 border-slate-700 bg-slate-900 text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Description</Label>
                          <Input
                            placeholder="Short note for this entry"
                            value={form.description}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, description: e.target.value }))
                            }
                            className="h-8 border-slate-700 bg-slate-900 text-xs"
                            required
                          />
                        </div>
                      </div>

                      <DialogFooter className="pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-8 px-3 text-xs text-slate-300"
                          onClick={() => {
                            setDialogOpen(false)
                            resetForm()
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isPending}
                          className="h-8 rounded-full bg-emerald-500 px-4 text-xs font-semibold text-emerald-950 hover:bg-emerald-400"
                        >
                          {isPending ? "Saving..." : (form.id ? "Save changes" : "Add transaction")}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="w-[90px] text-[11px] text-slate-400">
                      Date
                    </TableHead>
                    <TableHead className="text-[11px] text-slate-400">
                      Description
                    </TableHead>
                    <TableHead className="w-[110px] text-[11px] text-slate-400">
                      Mode
                    </TableHead>
                    <TableHead className="w-[110px] text-[11px] text-slate-400">
                      Category
                    </TableHead>
                    <TableHead className="w-[80px] text-right text-[11px] text-red-400">
                      Debit (-)
                    </TableHead>
                    <TableHead className="w-[80px] text-right text-[11px] text-emerald-400">
                      Credit (+)
                    </TableHead>
                    <TableHead className="w-[90px] text-right text-[11px] text-slate-400">
                      Balance
                    </TableHead>
                    <TableHead className="w-[80px] text-[11px] text-slate-400">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="py-6 text-center text-[11px] text-slate-500"
                      >
                        No transactions yet for this account.
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleTransactions.reduce(
                      (rows, tx, index) => {
                        const prevBalance =
                          index === 0 ? 0 : rows.balances[index - 1]
                        const delta = tx.type === "credit" ? tx.amount : -tx.amount
                        const nextBalance = prevBalance + delta
                        rows.balances.push(nextBalance)

                        rows.elements.push(
                          <TableRow key={tx.id} className="border-slate-800/80">
                            <TableCell className="py-2 align-top text-[11px] text-slate-300">
                              {new Date(tx.date).toLocaleDateString("en-NG", {
                                year: "2-digit",
                                month: "short",
                                day: "2-digit",
                              })}
                            </TableCell>
                            <TableCell className="py-2 align-top text-[11px]">
                              <div className="font-medium text-slate-100">
                                {tx.description}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {
                                  accounts.find((a) => a.id === tx.accountId)
                                    ?.name
                                }
                              </div>
                            </TableCell>
                            <TableCell className="py-2 align-top text-[11px] text-slate-300">
                              {tx.mode || "-"}
                            </TableCell>
                            <TableCell className="py-2 align-top text-[11px] text-slate-300">
                              {tx.category || "-"}
                            </TableCell>
                            <TableCell className="py-2 align-top text-right text-[11px] text-red-400 tabular-nums">
                              {tx.type === "debit" ? formatMoney(tx.amount) : "-"}
                            </TableCell>
                            <TableCell className="py-2 align-top text-right text-[11px] text-emerald-400 tabular-nums">
                              {tx.type === "credit" ? formatMoney(tx.amount) : "-"}
                            </TableCell>
                            <TableCell className="py-2 align-top text-right text-[11px] text-slate-200 tabular-nums">
                              {formatMoney(nextBalance)}
                            </TableCell>
                            <TableCell className="py-2 align-top text-[11px]">
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  disabled={isPending}
                                  className="h-6 w-6 text-[10px] text-slate-300 hover:bg-slate-800"
                                  onClick={() => openForEdit(tx)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  disabled={isPending}
                                  className="h-6 w-6 text-[10px] text-red-300 hover:bg-red-950/40"
                                  onClick={() => handleDelete(tx.id)}
                                >
                                  Del
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )

                        return rows
                      },
                      { elements: [] as JSX.Element[], balances: [] as number[] }
                    ).elements
                  )}
                </TableBody>
                <TableCaption className="text-[10px] text-slate-500">
                  Internal bookkeeping tool for TACN Iju Station Area. Values here should match the official
                  church account statements.
                </TableCaption>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

