"use server"

import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"

export type StatementOption = {
  id: string
  name: string
}

export type StatementRow = {
  id: string
  voucherId: string
  date: string
  voucherNo: string
  voucherType: string
  narration: string
  particulars: string
  debit: number
  credit: number
}

export type StatementReport = {
  rows: StatementRow[]
  totalDebit: number
  totalCredit: number
}

async function getOrgId() {
  return getAccountingOrgId()
}

export async function getStatementOptions(kind: "bank" | "cash" | "ledger" | "party"): Promise<StatementOption[]> {
  const supabase = await createClient()
  const orgId = await getOrgId()

  let query = supabase
    .from("ledgers")
    .select("id, name, is_cash_bank, ledger_kind, account_groups(name)")
    .eq("org_id", orgId)
    .eq("active", true)
    .order("name", { ascending: true })

  if (kind === "party") query = query.eq("ledger_kind", "party")
  if (kind === "ledger") query = query.neq("ledger_kind", "party")

  const { data, error } = await query
  if (error || !data) return []

  return (data as any[])
    .filter(ledger => {
      const groupName = String(ledger.account_groups?.name || "")
      const ledgerName = String(ledger.name || "")
      const isCashLedger = /cash-in-hand|cash in hand|cash/i.test(groupName) || /cash-in-hand|cash in hand|^cash$/i.test(ledgerName)
      if (kind === "bank") return ledger.is_cash_bank && !isCashLedger
      if (kind === "cash") return isCashLedger
      if (kind === "ledger") return ledger.ledger_kind !== "party" && !ledger.is_cash_bank && !isCashLedger
      return true
    })
    .map(ledger => ({ id: ledger.id as string, name: ledger.name as string }))
}

export async function getLedgerStatement(ledgerId?: string, startDate?: string, endDate?: string): Promise<StatementReport> {
  if (!ledgerId) return { rows: [], totalDebit: 0, totalCredit: 0 }

  const supabase = await createClient()
  const orgId = await getOrgId()

  let query = supabase
    .from("voucher_entries")
    .select(`
      id,
      ledger_id,
      debit_amount,
      credit_amount,
      vouchers!inner(
        id,
        org_id,
        date,
        voucher_no,
        voucher_type,
        narration,
        voucher_entries(
          ledger_id,
          debit_amount,
          credit_amount,
          ledgers(name)
        )
      )
    `)
    .eq("ledger_id", ledgerId)
    .eq("vouchers.org_id", orgId)
    .order("created_at", { ascending: true })

  if (startDate) query = query.gte("vouchers.date", startDate)
  if (endDate) query = query.lte("vouchers.date", endDate)

  const { data, error } = await query
  if (error || !data) return { rows: [], totalDebit: 0, totalCredit: 0 }

  const rows = (data as any[]).map(entry => {
    const voucher = entry.vouchers
    const otherEntries = (voucher?.voucher_entries || []).filter((line: any) => line.ledger_id !== ledgerId)
    const particulars = otherEntries
      .map((line: any) => line.ledgers?.name)
      .filter(Boolean)
      .filter((name: string, index: number, names: string[]) => names.indexOf(name) === index)
      .join(", ")

    return {
      id: entry.id as string,
      voucherId: voucher?.id || "",
      date: voucher?.date || "",
      voucherNo: voucher?.voucher_no || "-",
      voucherType: voucher?.voucher_type || "-",
      narration: voucher?.narration || "",
      particulars: particulars || "-",
      debit: Number(entry.debit_amount || 0),
      credit: Number(entry.credit_amount || 0),
    }
  })

  return {
    rows,
    totalDebit: rows.reduce((sum, row) => sum + row.debit, 0),
    totalCredit: rows.reduce((sum, row) => sum + row.credit, 0),
  }
}
