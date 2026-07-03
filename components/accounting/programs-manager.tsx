"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { AccountingProgram, createAccountingProgram, deleteAccountingProgram } from "@/app/accounting/actions"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function ProgramsManager({ programs, hideTitle = false }: { programs: AccountingProgram[], hideTitle?: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleCreate = (formData: FormData) => {
    startTransition(async () => {
      const result = await createAccountingProgram(formData)
      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success("Program created.")
      setOpen(false)
      router.refresh()
    })
  }

  const handleDelete = (program: AccountingProgram) => {
    if (!confirm(`Delete "${program.name}"?`)) return
    startTransition(async () => {
      const result = await deleteAccountingProgram(program.id)
      if (result?.error) toast.error(result.error)
      else {
        toast.success("Program deleted.")
        router.refresh()
      }
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        {!hideTitle ? <h2 className="text-xl font-black text-slate-900">Programs</h2> : <span />}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 gap-2 bg-indigo-600 px-5 font-bold text-white hover:bg-indigo-700">
              <Plus className="h-4 w-4" />
              Create Program
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Create Program</DialogTitle>
              <DialogDescription>This program can be selected on vouchers to build its register.</DialogDescription>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="program-name">Name of program</Label>
                <Input id="program-name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="program-amount">Amount to be contributed</Label>
                <Input id="program-amount" name="amount" type="number" min="0" step="0.01" defaultValue="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="program-description">Other info</Label>
                <Textarea id="program-description" name="description" rows={3} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isPending} className="h-10 bg-indigo-600 px-5 font-bold text-white hover:bg-indigo-700">
                  {isPending ? "Creating..." : "Create Program"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader className="bg-slate-50 [&_th]:px-5 [&_th]:py-3.5 [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600">
          <TableRow>
            <TableHead>Name of Program</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Vouchers</TableHead>
            <TableHead className="text-right">Recorded Total</TableHead>
            <TableHead>Other Info</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-slate-100 [&_td]:px-5 [&_td]:py-3.5 [&_tr:hover]:bg-slate-50/60">
          {programs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-slate-500">No programs created yet.</TableCell>
            </TableRow>
          ) : programs.map(program => (
            <TableRow key={program.id}>
              <TableCell>
                <Link href={`/accounting/programs/${program.id}`} className="font-bold text-slate-800 hover:text-indigo-700 hover:underline">
                  {program.name}
                </Link>
              </TableCell>
              <TableCell className="text-right font-mono">₦{Number(program.amount_to_contribute || 0).toLocaleString()}</TableCell>
              <TableCell className="text-right font-mono">{Number(program.voucher_count || 0).toLocaleString()}</TableCell>
              <TableCell className="text-right font-mono">₦{Number(program.voucher_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
              <TableCell className="max-w-md truncate text-slate-500">{program.description || "-"}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleDelete(program)}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
