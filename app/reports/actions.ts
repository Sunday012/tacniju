"use server"

import { createClient } from "@/lib/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Ledger, AccountGroup } from "@/app/management/actions"

async function getOrgId() {
    const cookieStore = cookies()
    const orgId = cookieStore.get("active_org_id")?.value
    if (!orgId) redirect("/select-church")
    return orgId
}

export type TrialBalanceRow = {
    ledgerName: string
    groupName: string
    nature: string
    openingDr: number
    openingCr: number
    movementDr: number
    movementCr: number
    closingDr: number
    closingCr: number
}

export async function getTrialBalance(startDate?: string, endDate?: string): Promise<TrialBalanceRow[]> {
    const supabase = await createClient()
    const orgId = await getOrgId()

    // 1. Fetch Ledgers with Groups
    const { data: ledgersData, error: lErr } = await supabase
        .from("ledgers")
        .select(`*, account_groups(name, nature)`)
        .eq("org_id", orgId)

    if (lErr || !ledgersData) return []

    // 2. Fetch Movements within date range
    let query = supabase
        .from("voucher_entries")
        .select(`
            ledger_id, debit_amount, credit_amount,
            vouchers!inner(org_id, date)
        `)
        .eq("vouchers.org_id", orgId)

    if (startDate) query = query.gte("vouchers.date", startDate)
    if (endDate) query = query.lte("vouchers.date", endDate)

    const { data: movementsData, error: mErr } = await query

    if (mErr) return []

    const movementsByLedger = new Map<string, { dr: number, cr: number }>()
    for (const m of movementsData || []) {
        const id = m.ledger_id
        if (!movementsByLedger.has(id)) {
            movementsByLedger.set(id, { dr: 0, cr: 0 })
        }
        const curr = movementsByLedger.get(id)!
        curr.dr += Number(m.debit_amount || 0)
        curr.cr += Number(m.credit_amount || 0)
    }

    const rows: TrialBalanceRow[] = []

    for (const ledger of ledgersData) {
        const openingDr = ledger.balance_type === 'Dr' ? Number(ledger.opening_balance || 0) : 0
        const openingCr = ledger.balance_type === 'Cr' ? Number(ledger.opening_balance || 0) : 0

        const moves = movementsByLedger.get(ledger.id) || { dr: 0, cr: 0 }

        let closingDr = openingDr + moves.dr
        let closingCr = openingCr + moves.cr

        // Netting
        if (closingDr > closingCr) {
            closingDr -= closingCr
            closingCr = 0
        } else {
            closingCr -= closingDr
            closingDr = 0
        }

        // Only include if there is some activity or balance
        if (openingDr || openingCr || moves.dr || moves.cr || closingDr || closingCr) {
            rows.push({
                ledgerName: ledger.name,
                groupName: ledger.account_groups?.name || 'Unknown',
                nature: ledger.account_groups?.nature || 'Unknown',
                openingDr,
                openingCr,
                movementDr: moves.dr,
                movementCr: moves.cr,
                closingDr,
                closingCr
            })
        }
    }

    return rows.sort((a, b) => a.nature.localeCompare(b.nature) || a.groupName.localeCompare(b.groupName) || a.ledgerName.localeCompare(b.ledgerName))
}

export async function getDayBook(filters?: { date?: string; startDate?: string; endDate?: string }) {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const date = filters?.date
    const startDate = filters?.startDate
    const endDate = filters?.endDate
    
    let query = supabase
        .from("vouchers")
        .select(`
            *,
            voucher_entries (
                ledger_id,
                debit_amount,
                credit_amount,
                ledgers ( name, is_cash_bank )
            ),
            voucher_items (
                qty,
                amount,
                movement_type,
                items ( name )
            )
        `)
        .eq("org_id", orgId)
        .order("created_at", { ascending: true })

    if (date) {
        query = query.eq("date", date)
    } else {
        if (startDate) query = query.gte("date", startDate)
        if (endDate) query = query.lte("date", endDate)
    }

    const { data, error } = await query

    if (error) return []
    return data
}
