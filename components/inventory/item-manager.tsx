"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createItem, deleteItem, Item, updateItem } from "@/app/inventory/actions"
import { useRouter } from "next/navigation"
import { Bell, Edit2, Trash2 } from "lucide-react"
import { toast } from "sonner"

export function ItemManager({
    items,
    hideTitle = false,
    categories = [],
    units = [],
}: {
    items: Item[]
    hideTitle?: boolean
    categories?: string[]
    units?: string[]
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState("")
    const [code, setCode] = useState("")
    const [unit, setUnit] = useState("Pieces")
    const [secondaryUnit, setSecondaryUnit] = useState("")
    const [secondaryPerPrimary, setSecondaryPerPrimary] = useState("1")
    const [category, setCategory] = useState("")
    const [purchaseRate, setPurchaseRate] = useState("0")
    const [sellingRate, setSellingRate] = useState("0")
    const [openingQty, setOpeningQty] = useState("0")
    const [reorderLevel, setReorderLevel] = useState("0")
    const [alertOpen, setAlertOpen] = useState(false)
    const [noStockAlert, setNoStockAlert] = useState(false)
    const [noStockQuantity, setNoStockQuantity] = useState("0")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [activeItem, setActiveItem] = useState<Item | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState("")
    const [editCategory, setEditCategory] = useState("")
    const [editUnit, setEditUnit] = useState("")
    const [editSecondaryUnit, setEditSecondaryUnit] = useState("")
    const [editSecondaryPerPrimary, setEditSecondaryPerPrimary] = useState("1")
    const [editPurchaseRate, setEditPurchaseRate] = useState("0")
    const [editSellingRate, setEditSellingRate] = useState("0")
    const [editOpeningQty, setEditOpeningQty] = useState("0")
    const [editReorderLevel, setEditReorderLevel] = useState("0")
    const [editNoStockAlert, setEditNoStockAlert] = useState(false)
    const [editNoStockQuantity, setEditNoStockQuantity] = useState("0")
    const router = useRouter()

    useEffect(() => {
        if (units.length > 0 && !units.includes(unit)) {
            setUnit(units[0])
        }
    }, [unit, units])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await createItem({
                name,
                code: code || null,
                category: category || null,
                unit,
                primary_unit: unit,
                secondary_unit: secondaryUnit || null,
                secondary_per_primary: parseFloat(secondaryPerPrimary) || 1,
                purchase_rate: parseFloat(purchaseRate),
                selling_rate: parseFloat(sellingRate),
                opening_qty: parseFloat(openingQty),
                reorder_level: parseFloat(reorderLevel),
                no_stock_alert_enabled: noStockAlert,
                no_stock_quantity: parseFloat(noStockQuantity) || 0,
                source_context: "accounting",
                source_asset_id: null,
                description: null
            })
            setIsOpen(false)
            // Reset
            setName("")
            setCode("")
            setPurchaseRate("0")
            setSellingRate("0")
            setOpeningQty("0")
            setReorderLevel("0")
            setSecondaryUnit("")
            setSecondaryPerPrimary("1")
            setCategory("")
            setNoStockAlert(false)
            setNoStockQuantity("0")
            router.refresh()
        } catch (error) {
            console.error("Failed to create item", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleDelete(item: Item) {
        if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return

        setIsSubmitting(true)
        try {
            await deleteItem(item.id)
            toast.success("Item deleted")
            router.refresh()
        } catch (error: any) {
            toast.error(error?.message || "Failed to delete item")
            console.error("Failed to delete item", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    function openDetails(item: Item) {
        setActiveItem(item)
        setIsEditing(false)
        setEditName(item.name || "")
        setEditCategory(item.category || "")
        setEditUnit(item.primary_unit || item.unit || "")
        setEditSecondaryUnit(item.secondary_unit || "")
        setEditSecondaryPerPrimary(String(item.secondary_per_primary || 1))
        setEditPurchaseRate(String(item.purchase_rate || 0))
        setEditSellingRate(String(item.selling_rate || 0))
        setEditOpeningQty(String(item.opening_qty || 0))
        setEditReorderLevel(String(item.reorder_level || 0))
        setEditNoStockAlert(!!item.no_stock_alert_enabled)
        setEditNoStockQuantity(String(item.no_stock_quantity || 0))
        setDetailsOpen(true)
    }

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault()
        if (!activeItem) return

        setIsSubmitting(true)
        try {
            await updateItem(activeItem.id, {
                name: editName,
                code: activeItem.code || null,
                category: editCategory || null,
                unit: editUnit,
                primary_unit: editUnit,
                secondary_unit: editSecondaryUnit || null,
                secondary_per_primary: parseFloat(editSecondaryPerPrimary) || 1,
                purchase_rate: parseFloat(editPurchaseRate),
                selling_rate: parseFloat(editSellingRate),
                opening_qty: parseFloat(editOpeningQty),
                reorder_level: parseFloat(editReorderLevel),
                no_stock_alert_enabled: editNoStockAlert,
                no_stock_quantity: parseFloat(editNoStockQuantity) || 0,
                source_context: activeItem.source_context || "accounting",
                source_asset_id: activeItem.source_asset_id || null,
                description: activeItem.description || null
            })
            toast.success("Item updated")
            setIsEditing(false)
            router.refresh()
        } catch (error: any) {
            toast.error(error?.message || "Failed to update item")
            console.error("Failed to update item", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
        <Card className="overflow-hidden bg-white shadow-sm border-slate-200 rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    {!hideTitle && <CardTitle className="text-xl">Inventory Management</CardTitle>}
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-9 bg-emerald-600 px-4 font-bold text-white hover:bg-emerald-500">Create Item</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-50 border-slate-200 text-slate-900 max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Create Production Item</DialogTitle>
                            <DialogDescription>Production items stay separate from admin gift stock.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Item</Label>
                                    <Input value={name} onChange={e => setName(e.target.value)} required className="bg-white border-slate-300" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    {categories.length > 0 ? (
                                        <select value={category} onChange={e => setCategory(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500">
                                            <option value="">Select category</option>
                                            {categories.map(categoryName => (
                                                <option key={categoryName} value={categoryName}>{categoryName}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Input value={category} onChange={e => setCategory(e.target.value)} className="bg-white border-slate-300" placeholder="Books, Beverage..." />
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Primary Unit</Label>
                                    {units.length > 0 ? (
                                        <select value={unit} onChange={e => setUnit(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500">
                                            {units.map(unitName => (
                                                <option key={unitName} value={unitName}>{unitName}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Input value={unit} onChange={e => setUnit(e.target.value)} required className="bg-white border-slate-300" placeholder="Pack" />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Secondary Unit</Label>
                                    <Input value={secondaryUnit} onChange={e => setSecondaryUnit(e.target.value)} className="bg-white border-slate-300" placeholder="Piece" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Secondary Qty</Label>
                                    <Input type="number" step="0.01" min="1" value={secondaryPerPrimary} onChange={e => setSecondaryPerPrimary(e.target.value)} className="bg-white border-slate-300" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Purchase Price</Label>
                                    <Input type="number" step="0.01" min="0" value={purchaseRate} onChange={e => setPurchaseRate(e.target.value)} className="bg-white border-slate-300" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Sales Price</Label>
                                    <Input type="number" step="0.01" min="0" value={sellingRate} onChange={e => setSellingRate(e.target.value)} className="bg-white border-slate-300" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Opening Stock Qty</Label>
                                    <Input type="number" min="0" value={openingQty} onChange={e => setOpeningQty(e.target.value)} className="bg-white border-slate-300" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reorder Alert Level</Label>
                                    <Input type="number" min="0" value={reorderLevel} onChange={e => setReorderLevel(e.target.value)} className="bg-white border-slate-300" />
                                </div>
                            </div>

                            <div className="rounded-md border border-slate-200 bg-white p-3">
                                <button
                                    type="button"
                                    onClick={() => setAlertOpen(true)}
                                    className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${noStockAlert ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                                >
                                    <Bell className="h-4 w-4" />
                                    No Stock Alert
                                </button>
                                {noStockAlert && (
                                    <span className="ml-3 text-sm font-medium text-red-600">Alert at {noStockQuantity || 0}</span>
                                )}
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting} className="h-10 bg-emerald-600 px-5 font-bold text-white hover:bg-emerald-500">Create Item</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
                    <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-sm">
                        <DialogHeader>
                            <DialogTitle>No Stock Alert</DialogTitle>
                            <DialogDescription>Set the stock quantity that should trigger an alert.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                            <Label>Alert Quantity</Label>
                            <Input type="number" min="0" value={noStockQuantity} onChange={e => setNoStockQuantity(e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => { setNoStockAlert(false); setAlertOpen(false) }}>Disable</Button>
                            <Button onClick={() => { setNoStockAlert(true); setAlertOpen(false) }} className="h-10 bg-red-600 px-5 font-bold text-white hover:bg-red-500">Save Alert</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-slate-50 [&_th]:px-5 [&_th]:py-3.5 [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600 [&_tr]:border-b [&_tr]:border-slate-200">
                        <TableRow className="border-slate-200">
                            <TableHead className="text-slate-500">Name</TableHead>
                            <TableHead className="text-slate-500">Category</TableHead>
                            <TableHead className="text-slate-500 text-center">Unit</TableHead>
                            <TableHead className="text-slate-500 text-right">Qty</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100 [&_td]:px-5 [&_td]:py-3.5 [&_tr:hover]:bg-slate-50/60">
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-slate-500 py-6">No items in inventory.</TableCell>
                            </TableRow>
                        ) : (
                            items.map(item => (
                                <TableRow key={item.id} className="cursor-pointer border-slate-200" onClick={() => openDetails(item)}>
                                    <TableCell className="font-medium text-slate-800">
                                        <button type="button" onClick={() => openDetails(item)} className="w-full text-left font-medium text-slate-800 hover:text-indigo-700">
                                            {item.name}
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-slate-500">{item.category || "-"}</TableCell>
                                    <TableCell className="text-center text-slate-500">{item.primary_unit || item.unit}</TableCell>
                                    <TableCell className="text-right font-bold text-slate-800">
                                        <span className={
                                            ((item.no_stock_alert_enabled && (item.current_stock || 0) <= (item.no_stock_quantity || 0)) ||
                                            ((item.current_stock || 0) <= item.reorder_level && item.reorder_level > 0))
                                                ? "text-red-500"
                                                : ""
                                        }>
                                            {item.current_stock}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Sheet
            open={detailsOpen}
            onOpenChange={(open) => {
                setDetailsOpen(open)
                if (!open) setActiveItem(null)
                if (!open) setIsEditing(false)
            }}
        >
            <SheetContent side="right" className="w-full overflow-y-auto border-slate-200 bg-slate-50 p-0 text-slate-900 sm:max-w-xl">
                {activeItem && (
                    <>
                        <SheetHeader className="border-b border-slate-200 bg-white px-6 py-5">
                            <SheetTitle className="text-xl font-black text-slate-900">{activeItem.name}</SheetTitle>
                            <SheetDescription>Production item details</SheetDescription>
                        </SheetHeader>

                        {isEditing ? (
                            <form onSubmit={handleUpdate} className="space-y-4 p-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Item</Label>
                                        <Input value={editName} onChange={e => setEditName(e.target.value)} required className="bg-white border-slate-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        {categories.length > 0 ? (
                                            <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500">
                                                <option value="">Select category</option>
                                                {categories.map(categoryName => (
                                                    <option key={categoryName} value={categoryName}>{categoryName}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <Input value={editCategory} onChange={e => setEditCategory(e.target.value)} className="bg-white border-slate-300" />
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Primary Unit</Label>
                                        {units.length > 0 ? (
                                            <select value={editUnit} onChange={e => setEditUnit(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500">
                                                {units.map(unitName => (
                                                    <option key={unitName} value={unitName}>{unitName}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <Input value={editUnit} onChange={e => setEditUnit(e.target.value)} required className="bg-white border-slate-300" />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Secondary Unit</Label>
                                        <Input value={editSecondaryUnit} onChange={e => setEditSecondaryUnit(e.target.value)} className="bg-white border-slate-300" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Secondary Qty</Label>
                                        <Input type="number" step="0.01" min="1" value={editSecondaryPerPrimary} onChange={e => setEditSecondaryPerPrimary(e.target.value)} className="bg-white border-slate-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Purchase Price</Label>
                                        <Input type="number" step="0.01" min="0" value={editPurchaseRate} onChange={e => setEditPurchaseRate(e.target.value)} className="bg-white border-slate-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sales Price</Label>
                                        <Input type="number" step="0.01" min="0" value={editSellingRate} onChange={e => setEditSellingRate(e.target.value)} className="bg-white border-slate-300" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Opening Stock Qty</Label>
                                        <Input type="number" min="0" value={editOpeningQty} onChange={e => setEditOpeningQty(e.target.value)} className="bg-white border-slate-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Reorder Alert Level</Label>
                                        <Input type="number" min="0" value={editReorderLevel} onChange={e => setEditReorderLevel(e.target.value)} className="bg-white border-slate-300" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700">
                                        <input type="checkbox" checked={editNoStockAlert} onChange={e => setEditNoStockAlert(e.target.checked)} />
                                        No Stock Alert
                                    </label>
                                    <div className="space-y-2">
                                        <Label>Alert Quantity</Label>
                                        <Input type="number" min="0" value={editNoStockQuantity} onChange={e => setEditNoStockQuantity(e.target.value)} className="bg-white border-slate-300" />
                                    </div>
                                </div>

                                <SheetFooter className="gap-3 border-t border-slate-200 bg-white pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 font-bold text-white hover:bg-emerald-500">
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        Save Item
                                    </Button>
                                </SheetFooter>
                            </form>
                        ) : (
                            <div className="space-y-4 p-6">
                                <DetailRow label="Category" value={activeItem.category || "-"} />
                                <DetailRow label="Unit" value={activeItem.primary_unit || activeItem.unit || "-"} />
                                <DetailRow label="Secondary" value={activeItem.secondary_unit ? `${activeItem.secondary_per_primary || 1} ${activeItem.secondary_unit}` : "-"} />
                                <DetailRow label="Cost" value={`₦${Number(activeItem.purchase_rate || 0).toLocaleString()}`} />
                                <DetailRow label="Price" value={`₦${Number(activeItem.selling_rate || 0).toLocaleString()}`} />
                                <DetailRow label="Qty" value={Number(activeItem.current_stock || 0).toLocaleString()} />
                                <DetailRow label="Opening Qty" value={Number(activeItem.opening_qty || 0).toLocaleString()} />
                                <DetailRow label="Reorder Level" value={Number(activeItem.reorder_level || 0).toLocaleString()} />
                                <DetailRow label="No Stock Alert" value={activeItem.no_stock_alert_enabled ? `At ${activeItem.no_stock_quantity || 0}` : "Off"} />
                            </div>
                        )}

                        {!isEditing && <SheetFooter className="gap-3 border-t border-slate-200 bg-white p-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditing(true)}
                                disabled={isSubmitting}
                                className="w-full border-indigo-200 bg-indigo-50 font-bold text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 sm:w-auto"
                            >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit Item
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleDelete(activeItem)}
                                disabled={isSubmitting}
                                className="w-full border-red-200 bg-red-50 font-bold text-red-700 hover:bg-red-100 hover:text-red-800 sm:w-auto"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Item
                            </Button>
                        </SheetFooter>}
                    </>
                )}
            </SheetContent>
        </Sheet>
        </>
    )
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p>
            <p className="mt-1 font-bold text-slate-800">{value}</p>
        </div>
    )
}
