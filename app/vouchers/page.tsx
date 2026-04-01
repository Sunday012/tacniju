import { getLedgers } from "@/app/management/actions"
import { getRecentVouchers } from "@/app/vouchers/actions"
import { getItems } from "@/app/inventory/actions"
import { VoucherEntry } from "@/components/vouchers/voucher-entry"

export default async function VouchersPage() {
    const [ledgers, vouchers, items] = await Promise.all([
        getLedgers(),
        getRecentVouchers(),
        getItems()
    ])

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="w-full space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Accounting Vouchers</h1>
                    <p className="text-slate-500 dark:text-slate-400">Record payments, receipts, contra transfers, and journal entries.</p>
                </div>

                <VoucherEntry ledgers={ledgers} recentVouchers={vouchers} items={items} />
            </div>
        </div>
    )
}
