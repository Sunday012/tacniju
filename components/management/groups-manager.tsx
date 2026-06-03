"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createAccountGroup, updateAccountGroup, deleteAccountGroup, AccountGroup, Ledger, seedDefaultGroups } from "@/app/management/actions"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

export function GroupsManager({ groups, ledgers = [] }: { groups: AccountGroup[], ledgers?: Ledger[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [name, setName] = useState("")
    const [nature, setNature] = useState<"Asset" | "Liability" | "Income" | "Expense">("Asset")
    const [parentId, setParentId] = useState<string>("none")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    function openEdit(group: AccountGroup) {
        setEditId(group.id)
        setName(group.name)
        setNature(group.nature)
        setParentId(group.parent_id || "none")
        setIsOpen(true)
    }

    function openCreate() {
        setEditId(null)
        setName("")
        setNature("Asset")
        setParentId("none")
        setIsOpen(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const payload = {
                name,
                nature,
                parent_id: parentId === "none" ? null : parentId
            }
            if (editId) {
                await updateAccountGroup(editId, payload)
            } else {
                await createAccountGroup(payload)
            }
            setIsOpen(false)
            setEditId(null)
            setName("")
            setNature("Asset")
            setParentId("none")
        } catch (error) {
            console.error("Failed to save group", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleSeed() {
        setIsSubmitting(true)
        try {
            await seedDefaultGroups()
            router.refresh()
        } catch (error) {
            console.error("Failed to seed", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleDelete(group: AccountGroup) {
        const hasChildren = groups.some((item) => item.parent_id === group.id)
        const linkedLedgers = ledgers.filter((ledger) => ledger.group_id === group.id)

        if (hasChildren) {
            toast.error(`Delete blocked: "${group.name}" still has child groups.`)
            return
        }

        if (linkedLedgers.length > 0) {
            const label = linkedLedgers.length === 1 ? "ledger" : "ledgers"
            toast.error(`Delete blocked: "${group.name}" still has ${linkedLedgers.length} ${label} assigned.`)
            return
        }

        if (!confirm(`Are you sure you want to delete "${group.name}"?`)) return

        setIsSubmitting(true)
        try {
            const result = await deleteAccountGroup(group.id)

            if (!result.success) {
                toast.error(result.error)
                return
            }

            toast.success("Account group deleted")
            router.refresh()
        } catch (error: any) {
            toast.error(error?.message || "Failed to delete account group")
            console.error("Failed to delete group", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    function getLinkedLedgersCount(groupId: string) {
        return ledgers.filter((ledger) => ledger.group_id === groupId).length
    }

    function getHasChildren(groupId: string) {
        return groups.some((item) => item.parent_id === groupId)
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) {
                        setEditId(null)
                        setName("")
                        setNature("Asset")
                        setParentId("none")
                    }
                }}>
                    <DialogTrigger asChild>
                        <button
                            type="button"
                            onClick={openCreate}
                            className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-dashed border-indigo-300 bg-white p-6 text-left shadow-sm transition hover:border-indigo-400 hover:bg-indigo-50"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                                <Plus className="h-5 w-5" />
                            </span>
                            <span className="text-lg font-black text-slate-800">Create New Group</span>
                        </button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-50 border-slate-200 text-slate-900">
                        <DialogHeader>
                            <DialogTitle>{editId ? "Edit Account Group" : "Create Account Group"}</DialogTitle>
                            <DialogDescription>{editId ? "Modify existing category." : "Add a new category for your ledgers."}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Group Name</Label>
                                <Input value={name} onChange={e => setName(e.target.value)} required className="bg-white border-slate-300" />
                            </div>
                            <div className="space-y-2">
                                <Label>Nature</Label>
                                <Select value={nature} onValueChange={(val: any) => setNature(val)}>
                                    <SelectTrigger className="bg-white border-slate-300">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white text-slate-900 border-slate-300">
                                        <SelectItem value="Asset">Asset</SelectItem>
                                        <SelectItem value="Liability">Liability</SelectItem>
                                        <SelectItem value="Income">Income</SelectItem>
                                        <SelectItem value="Expense">Expense</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Parent Group</Label>
                                <Select value={parentId} onValueChange={setParentId}>
                                    <SelectTrigger className="bg-white border-slate-300">
                                        <SelectValue placeholder="No Parent (Primary)" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white text-slate-900 border-slate-300">
                                        <SelectItem value="none">No Parent (Primary)</SelectItem>
                                        {groups.filter(g => g.id !== editId).map(g => (
                                            <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting} className="h-10 bg-indigo-600 px-5 font-bold text-white hover:bg-indigo-700">
                                    {editId ? "Save Changes" : "Create"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                {groups.length === 0 && (
                    <Button variant="outline" onClick={handleSeed} disabled={isSubmitting} className="min-h-[120px] rounded-2xl border-indigo-200 bg-white px-6 font-black text-indigo-700 hover:bg-indigo-50">
                        Seed Defaults
                    </Button>
                )}
            </div>

            <Card className="bg-white shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                    <div>
                        <CardTitle className="text-xl">Account Groups</CardTitle>
                        <CardDescription>Organize ledgers hierarchically.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader className="bg-slate-50 [&_th]:px-5 [&_th]:py-3.5 [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600">
                        <TableRow className="border-slate-200">
                            <TableHead className="text-slate-500">Name</TableHead>
                            <TableHead className="text-slate-500">Nature</TableHead>
                            <TableHead className="text-slate-500">Parent</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="[&_td]:px-5 [&_td]:py-3.5 [&_tr:hover]:bg-slate-50/60">
                        {groups.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-slate-500 py-6">No groups found.</TableCell>
                            </TableRow>
                        ) : (
                            groups.map(group => {
                                const linkedLedgersCount = getLinkedLedgersCount(group.id)
                                const hasChildren = getHasChildren(group.id)
                                const cannotDelete = hasChildren || linkedLedgersCount > 0
                                const deleteTitle = hasChildren
                                    ? `Can't delete ${group.name} while it has child groups`
                                    : linkedLedgersCount > 0
                                        ? `Can't delete ${group.name} while ledgers are assigned to it`
                                        : `Delete ${group.name}`

                                return (
                                <TableRow key={group.id} className="border-slate-200">
                                    <TableCell className="font-medium text-slate-800">{group.name}</TableCell>
                                    <TableCell className="text-slate-500">{group.nature}</TableCell>
                                    <TableCell className="text-slate-500">
                                        {group.parent_id ? groups.find(g => g.id === group.parent_id)?.name || "Unknown" : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => openEdit(group)} className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">Edit</Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(group)}
                                                disabled={isSubmitting || cannotDelete}
                                                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                title={deleteTitle}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </div>
    )
}
