"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"

export type BillPendingKind = "sales" | "purchase" | "payment" | "expense" | "income"

export type BillPendingRow = {
  id: string
  date: string
  voucherNo: string
  voucherType: string
  party: string
  itemName: string
  initialQty: number
  pendingQty: number
  rate: number
  value: number
  pendingValue: number
}

async function getOrgId() {
  const cookieStore = cookies()
  const orgId = cookieStore.get("active_org_id")?.value
  if (!orgId) redirect("/select-church")
  return orgId
}

const kindToVoucherType: Record<BillPendingKind, string> = {
  sales: "Sales",
  purchase: "Purchase",
  payment: "Payment",
  expense: "Expense",
  income: "Income",
}

const allocationTypes: Record<BillPendingKind, string[]> = {
  sales: ["Receipt"],
  purchase: ["Payment"],
  payment: [],
  expense: ["Payment"],
  income: ["Receipt"],
}

function getEntryTotal(entries: any[] = []) {
  return entries.reduce(
    (total, entry) => Math.max(total, Number(entry.debit_amount || 0), Number(entry.credit_amount || 0)),
    0
  )
}

function getParty(voucherType: string, entries: any[] = []) {
  const nonCash = entries.filter(entry => !entry.ledgers?.is_cash_bank)
  const preferred = nonCash.filter(entry => {
    if (voucherType === "Sales") return Number(entry.debit_amount || 0) > 0
    if (voucherType === "Purchase") return Number(entry.credit_amount || 0) > 0
    if (voucherType === "Payment" || voucherType === "Expense") return Number(entry.debit_amount || 0) > 0
    if (voucherType === "Income") return Number(entry.debit_amount || 0) > 0
    return true
  })
  return (preferred[0] || nonCash[0] || entries[0])?.ledgers?.name || "-"
}

function getItemSummary(items: any[] = []) {
  const validItems = items.filter(item => item.items?.name)
  const qty = validItems.reduce((sum, item) => sum + Number(item.qty || 0), 0)
  const value = validItems.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const first = validItems[0]
  return {
    itemName: first ? first.items.name : "-",
    qty,
    rate: first ? Number(first.rate || 0) : 0,
    value,
  }
}

export async function getBillPendingRows(kind: BillPendingKind): Promise<BillPendingRow[]> {
  const supabase = await createClient()
  const orgId = await getOrgId()
  const voucherType = kindToVoucherType[kind]

  const { data: vouchers, error } = await supabase
    .from("vouchers")
    .select(`
      id,
      date,
      voucher_no,
      voucher_type,
      voucher_entries (
        ledger_id,
        debit_amount,
        credit_amount,
        adjustment_method,
        adjustment_reference,
        ledgers ( name, is_cash_bank )
      ),
      voucher_items (
        qty,
        rate,
        amount,
        movement_type,
        items ( name )
      )
    `)
    .eq("org_id", orgId)
    .eq("voucher_type", voucherType)
    .order("date", { ascending: true })

  if (error || !vouchers) return []

  const allocationVoucherTypes = allocationTypes[kind]
  let allocationsByReference = new Map<string, number>()

  if (allocationVoucherTypes.length > 0) {
    const { data: allocations } = await supabase
      .from("voucher_entries")
      .select(`
        debit_amount,
        credit_amount,
        adjustment_method,
        adjustment_reference,
        vouchers!inner(org_id, voucher_type)
      `)
      .eq("vouchers.org_id", orgId)
      .in("vouchers.voucher_type", allocationVoucherTypes)
      .in("adjustment_method", ["Against Reference", "Advance"])

    allocationsByReference = (allocations || []).reduce((map, entry: any) => {
      const reference = String(entry.adjustment_reference || "").trim()
      if (!reference) return map
      const amount = Math.max(Number(entry.debit_amount || 0), Number(entry.credit_amount || 0))
      map.set(reference, (map.get(reference) || 0) + amount)
      return map
    }, new Map<string, number>())
  }

  return vouchers
    .filter((voucher: any) => {
      const voucherNo = String(voucher.voucher_no || "")
      const narration = String(voucher.narration || "")
      return narration !== "Batch" && !voucherNo.startsWith("BAT-")
    })
    .map((voucher: any) => {
      const itemSummary = getItemSummary(voucher.voucher_items || [])
      const value = itemSummary.value || getEntryTotal(voucher.voucher_entries || [])
      const allocated = allocationsByReference.get(voucher.voucher_no) || 0
      const pendingValue = Math.max(value - allocated, 0)
      const pendingQty = value > 0 && itemSummary.qty > 0
        ? Math.max(itemSummary.qty * (pendingValue / value), 0)
        : 0

      return {
        id: voucher.id,
        date: voucher.date,
        voucherNo: voucher.voucher_no,
        voucherType: voucher.voucher_type,
        party: getParty(voucher.voucher_type, voucher.voucher_entries || []),
        itemName: itemSummary.itemName,
        initialQty: itemSummary.qty,
        pendingQty,
        rate: itemSummary.rate,
        value,
        pendingValue,
      }
    })
    .filter(row => {
      if (kind === "payment") return row.pendingValue > 0
      return row.pendingValue > 0
    })
}
