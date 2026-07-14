"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createAccountGroup, updateAccountGroup, deleteAccountGroup, consolidateDuplicateGroups, AccountGroup, Ledger } from "@/app/management/actions"
import { useRouter } from "next/navigation"
import { FolderTree, Layers, Loader2, Plus, Printer, Shield, Trash2 } from "lucide-react"
import { toast } from "sonner"

export function GroupsManager({ groups, ledgers = [], hideTitle = false }: { groups: AccountGroup[], ledgers?: Ledger[], hideTitle?: boolean }) {
    const [isOpen, setIsOpen] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [name, setName] = useState("")
    const [nature, setNature] = useState<"Asset" | "Liability" | "Income" | "Expense">("Asset")
    const [parentId, setParentId] = useState<string>("none")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isMerging, setIsMerging] = useState(false)
    const [isDesktop, setIsDesktop] = useState(false)
    const router = useRouter()

    const duplicateGroupCount = (() => {
        const seen = new Set<string>()
        let duplicates = 0
        for (const group of groups) {
            const key = `${group.nature}::${group.name.trim().toLowerCase()}`
            if (seen.has(key)) duplicates++
            else seen.add(key)
        }
        return duplicates
    })()

    async function handleMergeDuplicates() {
        if (!confirm(`Merge ${duplicateGroupCount} duplicate group${duplicateGroupCount === 1 ? "" : "s"}? Ledgers will be moved onto the group that is kept, and the empty duplicates removed.`)) return

        setIsMerging(true)
        try {
            const result = await consolidateDuplicateGroups()
            if (!result.success) {
                toast.error("Failed to merge duplicate groups")
                return
            }
            if (result.removedGroups === 0) {
                toast.success("No duplicate groups found")
            } else {
                toast.success(`Merged ${result.removedGroups} duplicate group${result.removedGroups === 1 ? "" : "s"} · moved ${result.movedLedgers} ledger${result.movedLedgers === 1 ? "" : "s"}`)
            }
            router.refresh()
        } catch (error: any) {
            toast.error(error?.message || "Failed to merge duplicate groups")
            console.error("Failed to merge duplicate groups", error)
        } finally {
            setIsMerging(false)
        }
    }

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 768px)")
        const updateMatch = () => setIsDesktop(mediaQuery.matches)

        updateMatch()
        mediaQuery.addEventListener("change", updateMatch)

        return () => mediaQuery.removeEventListener("change", updateMatch)
    }, [])

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

    const rootGroups = groups.filter(group => !group.parent_id)
    const childGroups = groups.length - rootGroups.length
    const assignedLedgerCount = ledgers.filter(ledger => ledger.group_id).length
    const mostUsedNature = (["Asset", "Liability", "Income", "Expense"] as const)
        .map(item => ({
            label: item,
            count: groups.filter(group => group.nature === item).length,
        }))
        .sort((a, b) => b.count - a.count)[0]

    const activeGroup = editId ? groups.find(group => group.id === editId) ?? null : null
    const activeGroupLinkedLedgers = activeGroup ? getLinkedLedgersCount(activeGroup.id) : 0
    const activeGroupHasChildren = activeGroup ? getHasChildren(activeGroup.id) : false
    const activeGroupCannotDelete = !activeGroup || activeGroupHasChildren || activeGroupLinkedLedgers > 0
    const activeGroupDeleteTitle = !activeGroup
        ? "Delete group"
        : activeGroupHasChildren
            ? `Can't delete ${activeGroup.name} while it has child groups`
            : activeGroupLinkedLedgers > 0
                ? `Can't delete ${activeGroup.name} while ledgers are assigned to it`
                : `Delete ${activeGroup.name}`

    const groupForm = (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Group Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required className="border-slate-300 bg-white" />
            </div>
            <div className="space-y-2">
                <Label>Nature</Label>
                <Select value={nature} onValueChange={(val: any) => setNature(val)}>
                    <SelectTrigger className="border-slate-300 bg-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-slate-300 bg-white text-slate-900">
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
                    <SelectTrigger className="border-slate-300 bg-white">
                        <SelectValue placeholder="No Parent (Primary)" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-300 bg-white text-slate-900">
                        <SelectItem value="none">No Parent (Primary)</SelectItem>
                        {groups.filter(g => g.id !== editId).map(g => (
                            <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex justify-end">
                {activeGroup ? (
                    <div className="mr-auto flex items-center gap-2">
                        <Button asChild type="button" variant="outline" className="h-10 border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-50">
                            <Link href={`/accounting/info/group/${activeGroup.id}`}>
                                View Full Page
                            </Link>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                                await handleDelete(activeGroup)
                                setIsOpen(false)
                            }}
                            disabled={isSubmitting || activeGroupCannotDelete}
                            className="h-10 border-red-200 bg-red-50 px-3 text-red-600 hover:border-red-300 hover:bg-red-100 hover:text-red-700"
                            title={activeGroupDeleteTitle}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Group
                        </Button>
                    </div>
                ) : null}
                <Button type="submit" disabled={isSubmitting} className="h-10 bg-indigo-600 px-5 font-bold text-white hover:bg-indigo-700">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {editId ? "Save Changes" : "Create"}
                </Button>
            </div>
        </form>
    )

    return (
        <div className="space-y-8">
            <div className="relative overflow-hidden rounded-3xl border border-indigo-700/40 bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 p-8 shadow-[0_20px_40px_-15px_rgba(49,46,129,0.4)]">
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-10 pointer-events-none">
                    <Shield className="h-72 w-72 text-white" />
                </div>
                <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white shadow-lg backdrop-blur-md">
                            <FolderTree className="h-8 w-8" />
                        </div>
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80">
                                Accounts Info
                            </div>
                            {!hideTitle && <p className="text-sm font-semibold text-indigo-100/85">Account structure</p>}
                            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Groups</h1>
                            <p className="mt-1.5 text-sm text-indigo-200/80">
                                {groups.length} {groups.length === 1 ? "group" : "groups"} in your chart
                                {mostUsedNature?.count ? <> · Mostly <span className="font-semibold text-white">{mostUsedNature.label}</span></> : null}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="rounded-2xl border border-amber-300/30 bg-amber-400/15 px-4 py-3 backdrop-blur-md">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200/90">Primary Groups</p>
                            <p className="text-sm font-bold text-white">{rootGroups.length}</p>
                        </div>
                        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-100/90">Sub Groups</p>
                            <p className="text-sm font-bold text-white">{childGroups}</p>
                        </div>
                        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-100/90">Linked Ledgers</p>
                            <p className="text-sm font-bold text-white">{assignedLedgerCount}</p>
                        </div>
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

            <Card className="border-indigo-100 shadow-sm">
                <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">Group Setup</h3>
                            <p className="text-xs text-slate-500">Create primary and child groups, then map your ledgers under the right structure.</p>
                            {duplicateGroupCount > 0 ? (
                                <p className="mt-1 text-xs font-semibold text-amber-600">
                                    {duplicateGroupCount} duplicate group{duplicateGroupCount === 1 ? "" : "s"} found — merge them to tidy up your chart.
                                </p>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        {duplicateGroupCount > 0 ? (
                            <button
                                type="button"
                                onClick={handleMergeDuplicates}
                                disabled={isMerging}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-bold text-amber-800 transition hover:border-amber-300 hover:bg-amber-100 disabled:opacity-60"
                            >
                                {isMerging ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
                                Merge Duplicate Groups ({duplicateGroupCount})
                            </button>
                        ) : null}
                        {isDesktop ? (
                            <Sheet open={isOpen} onOpenChange={(open) => {
                                setIsOpen(open)
                                if (!open) {
                                    setEditId(null)
                                    setName("")
                                    setNature("Asset")
                                    setParentId("none")
                                }
                            }}>
                                <SheetTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={openCreate}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-bold text-indigo-800 transition hover:border-indigo-300 hover:bg-indigo-100"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create New Group
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-full overflow-y-auto border-slate-200 bg-slate-50 p-0 text-slate-900 sm:max-w-xl">
                                    <SheetHeader className="border-b border-slate-200 px-6 py-5">
                                        <SheetTitle>{editId ? "Edit Account Group" : "Create Account Group"}</SheetTitle>
                                        <SheetDescription>{editId ? "Modify existing category." : "Add a new category for your ledgers."}</SheetDescription>
                                    </SheetHeader>
                                    <div className="px-6 py-5">
                                        {groupForm}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        ) : (
                            <Drawer open={isOpen} onOpenChange={(open) => {
                                setIsOpen(open)
                                if (!open) {
                                    setEditId(null)
                                    setName("")
                                    setNature("Asset")
                                    setParentId("none")
                                }
                            }}>
                                <DrawerTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={openCreate}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-bold text-indigo-800 transition hover:border-indigo-300 hover:bg-indigo-100"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create New Group
                                    </button>
                                </DrawerTrigger>
                                <DrawerContent className="border-slate-200 bg-slate-50 text-slate-900">
                                    <DrawerHeader>
                                        <DrawerTitle>{editId ? "Edit Account Group" : "Create Account Group"}</DrawerTitle>
                                        <DrawerDescription>{editId ? "Modify existing category." : "Add a new category for your ledgers."}</DrawerDescription>
                                    </DrawerHeader>
                                    <div className="px-4 pb-2">
                                        {groupForm}
                                    </div>
                                    <DrawerFooter />
                                </DrawerContent>
                            </Drawer>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
                <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-slate-50 [&_th]:px-5 [&_th]:py-3.5 [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600 [&_tr]:border-b [&_tr]:border-slate-200">
                        <TableRow className="border-slate-200">
                            <TableHead className="text-slate-500">Name</TableHead>
                            <TableHead className="text-slate-500">Nature</TableHead>
                            <TableHead className="text-slate-500">Parent</TableHead>
                            <TableHead className="text-slate-500">Ledgers</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100 [&_td]:px-5 [&_td]:py-3.5 [&_tr:hover]:bg-slate-50/60">
                        {groups.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="py-6 text-center text-slate-500">No groups found.</TableCell>
                            </TableRow>
                        ) : (
                            groups.map(group => {
                                const linkedLedgersCount = getLinkedLedgersCount(group.id)
                                const hasChildren = getHasChildren(group.id)

                                return (
                                <TableRow
                                    key={group.id}
                                    className="cursor-pointer border-slate-200"
                                    onClick={() => openEdit(group)}
                                >
                                    <TableCell className="font-medium text-slate-800">
                                        <div className="flex flex-col gap-0.5">
                                            <span>{group.name}</span>
                                            {hasChildren ? <span className="text-[11px] font-medium text-indigo-500">Has sub groups</span> : null}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500">{group.nature}</TableCell>
                                    <TableCell className="text-slate-500">
                                        {group.parent_id ? groups.find(g => g.id === group.parent_id)?.name || "Unknown" : "-"}
                                    </TableCell>
                                    <TableCell className="text-slate-500">{linkedLedgersCount}</TableCell>
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
