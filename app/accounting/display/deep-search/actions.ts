"use server"

import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"

export type DeepSearchField =
  | "attendance_type"
  | "batch_number"
  | "party_name"
  | "ledger"
  | "narration"
  | "stock_item"
  | "tracking_number"
  | "voucher_type"
  | "voucher_number"
  | "amount"

export type DeepSearchOperator =
  | "contains"
  | "starts_with"
  | "ends_with"
  | "equals"
  | "greater_than"
  | "less_than"
  | "not_contains"

export type DeepSearchCriterion = {
  field: DeepSearchField
  operator: DeepSearchOperator
  value: string
}

export type DeepSearchResult = {
  id: string
  date: string
  recordType: string
  title: string
  voucherNo: string
  voucherType: string
  details: string
  amount: number
  href: string
}

const voucherTypeToSlug: Record<string, string> = {
  Payment: "payment",
  Receipt: "receipt",
  Sales: "sales",
  Purchase: "purchase",
  Expense: "expense",
  Levy: "levy",
  Income: "income",
  Contra: "contra",
  Program: "program",
}

function normalize(value: unknown) {
  return String(value || "").trim().toLowerCase()
}

function getVoucherAmount(voucher: any) {
  const entryAmount = (voucher.voucher_entries || []).reduce((largest: number, entry: any) => (
    Math.max(largest, Number(entry.debit_amount || 0), Number(entry.credit_amount || 0))
  ), 0)
  const itemAmount = (voucher.voucher_items || []).reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0)
  return Math.max(entryAmount, itemAmount)
}

function compareText(source: string, operator: DeepSearchOperator, value: string) {
  const haystack = normalize(source)
  const needle = normalize(value)
  if (!needle) return true

  if (operator === "equals") return haystack === needle
  if (operator === "starts_with") return haystack.startsWith(needle)
  if (operator === "ends_with") return haystack.endsWith(needle)
  if (operator === "not_contains") return !haystack.includes(needle)
  if (operator === "greater_than") return haystack > needle
  if (operator === "less_than") return haystack < needle
  return haystack.includes(needle)
}

function compareNumber(source: number, operator: DeepSearchOperator, value: string) {
  const target = Number(String(value).replace(/,/g, ""))
  if (!Number.isFinite(target)) return false

  if (operator === "equals") return source === target
  if (operator === "greater_than") return source > target
  if (operator === "less_than") return source < target
  if (operator === "not_contains") return !String(source).includes(String(target))
  return String(source).includes(String(target))
}

function voucherValues(voucher: any, amount: number): Record<DeepSearchField, Array<string | number>> {
  const entries = voucher.voucher_entries || []
  const items = voucher.voucher_items || []
  const ledgerNames = entries.map((entry: any) => entry.ledgers?.name).filter(Boolean)
  const partyNames = entries
    .filter((entry: any) => entry.ledgers?.ledger_kind === "party")
    .map((entry: any) => entry.ledgers?.name)
    .filter(Boolean)
  const stockItems = items.map((item: any) => item.items?.name).filter(Boolean)

  return {
    attendance_type: [],
    batch_number: [voucher.reference, voucher.voucher_no],
    party_name: partyNames,
    ledger: ledgerNames,
    narration: [voucher.narration],
    stock_item: stockItems,
    tracking_number: [],
    voucher_type: [voucher.voucher_type],
    voucher_number: [voucher.voucher_no],
    amount: [amount],
  }
}

function matchesCriterion(values: Array<string | number>, criterion: DeepSearchCriterion) {
  if (criterion.field === "amount") {
    return values.some(value => compareNumber(Number(value || 0), criterion.operator, criterion.value))
  }
  return values.some(value => compareText(String(value || ""), criterion.operator, criterion.value))
}

function matchesAllCriteria(values: Record<DeepSearchField, Array<string | number>>, criteria: DeepSearchCriterion[]) {
  return criteria.every(criterion => matchesCriterion(values[criterion.field] || [], criterion))
}

export async function getDeepSearchResults(criteria: DeepSearchCriterion[]): Promise<DeepSearchResult[]> {
  const activeCriteria = criteria.filter(criterion => criterion.field && criterion.operator && criterion.value.trim())
  if (activeCriteria.length === 0) return []

  const supabase = await createClient()
  const orgId = await getAccountingOrgId()

  const [{ data: vouchers }, { data: attendance }, { data: receiptNotes }] = await Promise.all([
    supabase
      .from("vouchers")
      .select(`
        id,
        date,
        voucher_no,
        voucher_type,
        reference,
        narration,
        voucher_entries (
          debit_amount,
          credit_amount,
          ledgers ( name, ledger_kind )
        ),
        voucher_items (
          amount,
          items ( name )
        )
      `)
      .eq("org_id", orgId)
      .order("date", { ascending: false })
      .limit(800),
    supabase
      .from("attendance")
      .select("id, date, service_name, men_count, women_count, children_count, total_count, notes")
      .eq("org_id", orgId)
      .order("date", { ascending: false })
      .limit(500),
    supabase
      .from("receipt_notes")
      .select(`
        id,
        receipt_no,
        received_date,
        supplier,
        bill_reference,
        narration,
        receipt_note_items (
          item_name,
          stock_tracking_number,
          stock_group_tracking_number,
          gift_number,
          quantity
        )
      `)
      .eq("org_id", orgId)
      .order("received_date", { ascending: false })
      .limit(500),
  ])

  const voucherResults = (vouchers || []).flatMap((voucher: any): DeepSearchResult[] => {
    const amount = getVoucherAmount(voucher)
    if (!matchesAllCriteria(voucherValues(voucher, amount), activeCriteria)) return []

    const slug = voucherTypeToSlug[voucher.voucher_type] || String(voucher.voucher_type || "").toLowerCase()
    const ledgerNames = (voucher.voucher_entries || []).map((entry: any) => entry.ledgers?.name).filter(Boolean).join(", ")
    const stockItems = (voucher.voucher_items || []).map((item: any) => item.items?.name).filter(Boolean).join(", ")

    return [{
      id: voucher.id,
      date: voucher.date,
      recordType: "Voucher",
      title: voucher.narration || voucher.reference || voucher.voucher_no,
      voucherNo: voucher.voucher_no || "-",
      voucherType: voucher.voucher_type || "-",
      details: [ledgerNames, stockItems].filter(Boolean).join(" | ") || "-",
      amount,
      href: `/accounting/vouchers/${slug}/${voucher.id}`,
    }]
  })

  const attendanceResults = (attendance || []).flatMap((row: any): DeepSearchResult[] => {
    const total = Number(row.total_count || 0) || Number(row.men_count || 0) + Number(row.women_count || 0) + Number(row.children_count || 0)
    const values: Record<DeepSearchField, Array<string | number>> = {
      attendance_type: [row.service_name],
      batch_number: [],
      party_name: [],
      ledger: [],
      narration: [row.notes],
      stock_item: [],
      tracking_number: [],
      voucher_type: ["Attendance"],
      voucher_number: [],
      amount: [total],
    }
    if (!matchesAllCriteria(values, activeCriteria)) return []

    return [{
      id: row.id,
      date: row.date,
      recordType: "Attendance",
      title: row.service_name || "Attendance",
      voucherNo: "-",
      voucherType: "Attendance",
      details: row.notes || "-",
      amount: total,
      href: "/accounting/programs/reports/attendance",
    }]
  })

  const receiptNoteResults = (receiptNotes || []).flatMap((note: any): DeepSearchResult[] => {
    const items = note.receipt_note_items || []
    const quantity = items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0)
    const trackingNumbers = items.flatMap((item: any) => [
      item.stock_tracking_number,
      item.stock_group_tracking_number,
      item.gift_number,
    ]).filter(Boolean)
    const values: Record<DeepSearchField, Array<string | number>> = {
      attendance_type: [],
      batch_number: [note.bill_reference],
      party_name: [note.supplier],
      ledger: [],
      narration: [note.narration],
      stock_item: items.map((item: any) => item.item_name).filter(Boolean),
      tracking_number: trackingNumbers,
      voucher_type: ["Receipt Note"],
      voucher_number: [note.receipt_no],
      amount: [],
    }
    if (!matchesAllCriteria(values, activeCriteria)) return []

    const itemSummary = items.map((item: any) => `${item.item_name} (${Number(item.quantity || 0).toLocaleString()})`)
    return [{
      id: note.id,
      date: note.received_date,
      recordType: "Receipt Note",
      title: note.supplier || note.narration || note.receipt_no,
      voucherNo: note.receipt_no || "-",
      voucherType: "Receipt Note",
      details: [note.bill_reference, itemSummary.join(", "), trackingNumbers.join(", "), `Total quantity: ${quantity.toLocaleString()}`].filter(Boolean).join(" | ") || "-",
      amount: 0,
      href: "/accounting/vouchers/receipt-note",
    }]
  })

  return [...voucherResults, ...attendanceResults, ...receiptNoteResults]
    .sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime())
    .slice(0, 300)
}
