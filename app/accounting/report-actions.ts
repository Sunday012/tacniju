"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { getItems } from "@/app/inventory/actions"

async function getOrgId() {
  const cookieStore = cookies()
  const orgId = cookieStore.get("active_org_id")?.value
  if (!orgId) redirect("/select-church")
  return orgId
}

export type ReportLine = {
  name: string
  amount: number
  children?: ReportLine[]
}

export type BalanceSheetReport = {
  liabilities: ReportLine[]
  assets: ReportLine[]
  liabilityTotal: number
  assetTotal: number
  difference: number
}

export type ProfitLossReport = {
  left: ReportLine[]
  right: ReportLine[]
  leftTotal: number
  rightTotal: number
}

export type StockSummaryRow = {
  name: string
  quantity: number
  unit: string
  rate: number
  value: number
}

function signedOpening(ledger: any) {
  const amount = Number(ledger.opening_balance || 0)
  return ledger.balance_type === "Dr" ? amount : -amount
}

function makeLineMap() {
  return new Map<string, number>()
}

function addToMap(map: Map<string, number>, key: string, amount: number) {
  map.set(key, (map.get(key) || 0) + amount)
}

function linesFromMap(map: Map<string, number>, positiveOnly = true): ReportLine[] {
  return Array.from(map.entries())
    .map(([name, amount]) => ({ name, amount: Math.abs(amount) }))
    .filter(line => positiveOnly ? line.amount > 0 : true)
    .sort((a, b) => a.name.localeCompare(b.name))
}

async function getLedgerSnapshots() {
  const supabase = await createClient()
  const orgId = await getOrgId()

  const { data: ledgers } = await supabase
    .from("ledgers")
    .select("id, name, opening_balance, balance_type, account_groups(name, nature)")
    .eq("org_id", orgId)

  const { data: entries } = await supabase
    .from("voucher_entries")
    .select("ledger_id, debit_amount, credit_amount, vouchers!inner(org_id)")
    .eq("vouchers.org_id", orgId)

  const movements = new Map<string, number>()
  for (const entry of entries || []) {
    const current = movements.get(entry.ledger_id) || 0
    movements.set(entry.ledger_id, current + Number(entry.debit_amount || 0) - Number(entry.credit_amount || 0))
  }

  return (ledgers || []).map((ledger: any) => ({
    ...ledger,
    groupName: ledger.account_groups?.name || "Unassigned",
    nature: ledger.account_groups?.nature || "Asset",
    closing: signedOpening(ledger) + (movements.get(ledger.id) || 0),
  }))
}

export async function getBalanceSheetReport(): Promise<BalanceSheetReport> {
  const ledgers = await getLedgerSnapshots()
  const liabilities = makeLineMap()
  const assets = makeLineMap()

  for (const ledger of ledgers) {
    if (ledger.nature === "Liability") addToMap(liabilities, ledger.groupName, -ledger.closing)
    if (ledger.nature === "Asset") addToMap(assets, ledger.groupName, ledger.closing)
  }

  const liabilityLines = linesFromMap(liabilities)
  const assetLines = linesFromMap(assets)
  const liabilityTotal = liabilityLines.reduce((sum, line) => sum + line.amount, 0)
  const assetTotal = assetLines.reduce((sum, line) => sum + line.amount, 0)

  return {
    liabilities: liabilityLines,
    assets: assetLines,
    liabilityTotal,
    assetTotal,
    difference: Math.abs(liabilityTotal - assetTotal),
  }
}

export async function getProfitLossReport(): Promise<ProfitLossReport> {
  const ledgers = await getLedgerSnapshots()
  const items = await getItems()
  const openingStock = items.reduce((sum, item) => sum + Number(item.opening_qty || 0) * Number(item.purchase_rate || 0), 0)
  const closingStock = items.reduce((sum, item) => sum + Number(item.current_stock || 0) * Number(item.purchase_rate || 0), 0)
  const expenses = makeLineMap()
  const incomes = makeLineMap()

  for (const ledger of ledgers) {
    if (ledger.nature === "Expense") addToMap(expenses, ledger.groupName, ledger.closing)
    if (ledger.nature === "Income") addToMap(incomes, ledger.groupName, -ledger.closing)
  }

  const left = [
    { name: "Opening Stock", amount: openingStock },
    ...linesFromMap(expenses),
  ].filter(line => line.amount > 0)
  const right = [
    ...linesFromMap(incomes),
    { name: "Closing Stock", amount: closingStock },
  ].filter(line => line.amount > 0)

  const leftBeforeProfit = left.reduce((sum, line) => sum + line.amount, 0)
  const rightBeforeProfit = right.reduce((sum, line) => sum + line.amount, 0)
  if (rightBeforeProfit > leftBeforeProfit) {
    left.push({ name: "Net Profit", amount: rightBeforeProfit - leftBeforeProfit })
  } else if (leftBeforeProfit > rightBeforeProfit) {
    right.push({ name: "Net Loss", amount: leftBeforeProfit - rightBeforeProfit })
  }

  const leftTotal = left.reduce((sum, line) => sum + line.amount, 0)
  const rightTotal = right.reduce((sum, line) => sum + line.amount, 0)

  return { left, right, leftTotal, rightTotal }
}

export async function getStockSummaryReport(): Promise<StockSummaryRow[]> {
  const items = await getItems()
  return items
    .map(item => {
      const quantity = Number(item.current_stock || 0)
      const rate = Number(item.purchase_rate || item.selling_rate || 0)
      return {
        name: item.name,
        quantity,
        unit: item.primary_unit || item.unit || "",
        rate,
        value: quantity * rate,
      }
    })
    .filter(row => row.quantity !== 0 || row.value !== 0)
    .sort((a, b) => a.name.localeCompare(b.name))
}
