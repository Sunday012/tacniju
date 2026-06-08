"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createItem, deleteItem, Item } from "@/app/inventory/actions"
import { useRouter } from "next/navigation"
import { Bell, Trash2 } from "lucide-react"
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

    return (
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
                            <TableHead className="text-slate-500">Stock</TableHead>
                            <TableHead className="text-slate-500">Category</TableHead>
                            <TableHead className="text-slate-500 text-center">Unit</TableHead>
                            <TableHead className="text-slate-500 text-center">Secondary</TableHead>
                            <TableHead className="text-slate-500 text-right">Cost</TableHead>
                            <TableHead className="text-slate-500 text-right">Price</TableHead>
                            <TableHead className="text-slate-500 text-right">Stock</TableHead>
                            <TableHead className="text-right text-slate-500">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100 [&_td]:px-5 [&_td]:py-3.5 [&_tr:hover]:bg-slate-50/60">
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-slate-500 py-6">No items in inventory.</TableCell>
                            </TableRow>
                        ) : (
                            items.map(item => (
                                <TableRow key={item.id} className="border-slate-200">
                                    <TableCell className="font-medium text-slate-800">
                        {item.name}
                                    </TableCell>
                                    <TableCell className="text-slate-500">{item.category || "-"}</TableCell>
                                    <TableCell className="text-center text-slate-500">{item.primary_unit || item.unit}</TableCell>
                                    <TableCell className="text-center text-slate-500">
                                        {item.secondary_unit ? `${item.secondary_per_primary || 1} ${item.secondary_unit}` : "-"}
                                    </TableCell>
                                    <TableCell className="text-right text-slate-500">₦{Number(item.purchase_rate).toLocaleString()}</TableCell>
                                    <TableCell className="text-right text-slate-500">₦{Number(item.selling_rate).toLocaleString()}</TableCell>
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
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(item)}
                                            disabled={isSubmitting}
                                            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            title={`Delete ${item.name}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
