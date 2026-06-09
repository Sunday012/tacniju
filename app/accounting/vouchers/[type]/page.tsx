import { notFound, redirect } from "next/navigation"
import { AccountingShell } from "@/components/accounting/accounting-shell"
import { VoucherEntry } from "@/components/vouchers/voucher-entry"
import { getLedgers, getLedgerBalances } from "@/app/management/actions"
import { getRecentVouchers, VoucherType } from "@/app/vouchers/actions"
import { getItems } from "@/app/inventory/actions"
import { getAccountingParties, getAccountingPrograms } from "@/app/accounting/actions"

const typeMap: Record<string, VoucherType> = {
  payment: "Payment",
  receipt: "Receipt",
  sales: "Sales",
  purchase: "Purchase",
  expense: "Expense",
  income: "Income",
  contra: "Contra",
  program: "Program",
}

const heroStyles: Record<VoucherType, { className: string; eyebrowClassName: string; badgeClassName: string }> = {
  Receipt: {
    className: "bg-gradient-to-br from-red-500 via-rose-500 to-red-700",
    eyebrowClassName: "text-red-100",
    badgeClassName: "text-red-700",
  },
  Payment: {
    className: "bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-600",
    eyebrowClassName: "text-amber-100",
    badgeClassName: "text-amber-700",
  },
  Sales: {
    className: "bg-gradient-to-br from-blue-500 via-sky-500 to-indigo-600",
    eyebrowClassName: "text-blue-100",
    badgeClassName: "text-blue-700",
  },
  Purchase: {
    className: "bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600",
    eyebrowClassName: "text-emerald-100",
    badgeClassName: "text-emerald-700",
  },
  Expense: {
    className: "bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-600",
    eyebrowClassName: "text-amber-100",
    badgeClassName: "text-amber-700",
  },
  Income: {
    className: "bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-600",
    eyebrowClassName: "text-amber-100",
    badgeClassName: "text-amber-700",
  },
  Contra: {
    className: "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950",
    eyebrowClassName: "text-slate-200",
    badgeClassName: "text-slate-800",
  },
  Program: {
    className: "bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900",
    eyebrowClassName: "text-indigo-100",
    badgeClassName: "text-indigo-700",
  },
}

export default async function AccountingVoucherPage({ params }: { params: { type: string } }) {
  const voucherType = typeMap[params.type]
  if (!voucherType) notFound()
  if (voucherType === "Program") redirect("/accounting/programs")

  const parties = await getAccountingParties()
  const [ledgers, vouchers, items, programs, balances] = await Promise.all([
    getLedgers(),
    getRecentVouchers(),
    getItems(),
    getAccountingPrograms(),
    getLedgerBalances(),
  ])

  return (
    <AccountingShell
      title={`${voucherType} Voucher`}
      framed={false}
      backHref="/accounting/vouchers"
      backLabel="Vouchers"
      hero={{
        title: `${voucherType} Voucher`,
        badge: voucherType,
        ...heroStyles[voucherType],
      }}
    >
      <VoucherEntry
        fixedType={voucherType}
        ledgers={ledgers}
        recentVouchers={(vouchers || []).filter((voucher: any) => voucher.voucher_type === voucherType)}
        items={items}
        parties={parties}
        programs={programs}
        balances={balances}
      />
    </AccountingShell>
  )
}
