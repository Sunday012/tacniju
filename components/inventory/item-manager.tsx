"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createItem, Item } from "@/app/inventory/actions"
import { useRouter } from "next/navigation"

export function ItemManager({ items }: { items: Item[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState("")
    const [code, setCode] = useState("")
    const [unit, setUnit] = useState("Pieces")
    const [purchaseRate, setPurchaseRate] = useState("0")
    const [sellingRate, setSellingRate] = useState("0")
    const [openingQty, setOpeningQty] = useState("0")
    const [reorderLevel, setReorderLevel] = useState("0")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await createItem({
                name,
                code: code || null,
                category: null,
                unit,
                purchase_rate: parseFloat(purchaseRate),
                selling_rate: parseFloat(sellingRate),
                opening_qty: parseFloat(openingQty),
                reorder_level: parseFloat(reorderLevel),
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
            router.refresh()
        } catch (error) {
            console.error("Failed to create item", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-xl">Inventory Items</CardTitle>
                    <CardDescription>Manage stock items, books, merchandise.</CardDescription>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500">+ Add Item</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-50 border-slate-200 text-slate-900 max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Create Inventory Item</DialogTitle>
                            <DialogDescription>Add a new item to track in stock.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Item Name</Label>
                                    <Input value={name} onChange={e => setName(e.target.value)} required className="bg-white border-slate-300" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Code / SKU</Label>
                                    <Input value={code} onChange={e => setCode(e.target.value)} className="bg-white border-slate-300" placeholder="Optional" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Unit of Measure</Label>
                                    <Input value={unit} onChange={e => setUnit(e.target.value)} required className="bg-white border-slate-300" placeholder="Pieces, Copies..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Purchase Cost (₦)</Label>
                                    <Input type="number" step="0.01" min="0" value={purchaseRate} onChange={e => setPurchaseRate(e.target.value)} className="bg-white border-slate-300" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Selling Price (₦)</Label>
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

                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500">Create Item</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-200">
                            <TableHead className="text-slate-500">Item</TableHead>
                            <TableHead className="text-slate-500 text-center">Unit</TableHead>
                            <TableHead className="text-slate-500 text-right">Cost</TableHead>
                            <TableHead className="text-slate-500 text-right">Price</TableHead>
                            <TableHead className="text-slate-500 text-right">Stock</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-slate-500 py-6">No items in inventory.</TableCell>
                            </TableRow>
                        ) : (
                            items.map(item => (
                                <TableRow key={item.id} className="border-slate-200">
                                    <TableCell className="font-medium text-slate-800">
                                        {item.name}
                                        {item.code && <span className="ml-2 text-[10px] text-slate-500">({item.code})</span>}
                                    </TableCell>
                                    <TableCell className="text-center text-slate-500">{item.unit}</TableCell>
                                    <TableCell className="text-right text-slate-500">₦{Number(item.purchase_rate).toLocaleString()}</TableCell>
                                    <TableCell className="text-right text-slate-500">₦{Number(item.selling_rate).toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-bold text-slate-800">
                                        <span className={(item.current_stock || 0) <= item.reorder_level && item.reorder_level > 0 ? "text-red-400" : ""}>
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
    )
}
