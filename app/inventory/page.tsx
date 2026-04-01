import { getItems } from "@/app/inventory/actions"
import { ItemManager } from "@/components/inventory/item-manager"

export default async function InventoryPage() {
    const items = await getItems()

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Inventory</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track and manage church assets, books, merchandise, and event tickets.</p>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr]">
                    <ItemManager items={items} />
                </div>
            </div>
        </div>
    )
}
