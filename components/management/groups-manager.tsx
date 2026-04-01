"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createAccountGroup, updateAccountGroup, AccountGroup, seedDefaultGroups } from "@/app/management/actions"
import { useRouter } from "next/navigation"

export function GroupsManager({ groups }: { groups: AccountGroup[] }) {
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

    return (
        <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-xl">Account Groups</CardTitle>
                    <CardDescription>Organize ledgers hierarchically.</CardDescription>
                </div>
                <div className="flex gap-2">
                    {groups.length === 0 && (
                        <Button variant="outline" size="sm" onClick={handleSeed} disabled={isSubmitting} className="border-emerald-600 text-emerald-500">
                            Seed Defaults
                        </Button>
                    )}
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
                            <Button size="sm" onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-500">+ New Group</Button>
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
                                    <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500">
                                        {editId ? "Save Changes" : "Create"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-200">
                            <TableHead className="text-slate-500">Name</TableHead>
                            <TableHead className="text-slate-500">Nature</TableHead>
                            <TableHead className="text-slate-500">Parent</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groups.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-slate-500 py-6">No groups found.</TableCell>
                            </TableRow>
                        ) : (
                            groups.map(group => (
                                <TableRow key={group.id} className="border-slate-200">
                                    <TableCell className="font-medium text-slate-800">{group.name}</TableCell>
                                    <TableCell className="text-slate-500">{group.nature}</TableCell>
                                    <TableCell className="text-slate-500">
                                        {group.parent_id ? groups.find(g => g.id === group.parent_id)?.name || "Unknown" : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => openEdit(group)} className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
