"use server"

import { createClient } from "@/lib/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function getOrgId() {
    const cookieStore = cookies()
    const orgId = cookieStore.get("active_org_id")?.value
    if (!orgId) redirect("/select-church")
    return orgId
}

export type VoucherType = 'Payment' | 'Receipt' | 'Sales' | 'Purchase' | 'Contra' | 'Expense' | 'Income' | 'Program'

export type VoucherItemPayload = {
    item_id: string
    qty: number
    rate: number
    amount: number
}

export type VoucherLedgerEntry = {
    ledger_id: string
    debit_amount: number
    credit_amount: number
    adjustment_method?: 'New Reference' | 'Against Reference' | 'Advance' | 'On Account'
    adjustment_reference?: string
}

export type VoucherFormPayload = {
    voucher_type: VoucherType
    date: string
    narration: string
    reference?: string
    items?: VoucherItemPayload[]
    ledger_entries: VoucherLedgerEntry[]
}

async function cleanupVoucherOnFailure(supabase: Awaited<ReturnType<typeof createClient>>, voucherId: string) {
    await supabase
        .from("vouchers")
        .delete()
        .eq("id", voucherId)
}

export async function saveVoucher(payload: VoucherFormPayload) {
    const supabase = await createClient()
    const orgId = await getOrgId()

    // 1. Get user
    const { data: { user } } = await supabase.auth.getUser()

    // 2. Auto-increment Voucher Number
    const prefix = payload.voucher_type.substring(0, 3).toUpperCase() + "-"
    const { data: lastVoucher } = await supabase
        .from("vouchers")
        .select("voucher_no")
        .eq("org_id", orgId)
        .eq("voucher_type", payload.voucher_type)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

    let nextNum = 1
    if (lastVoucher && lastVoucher.voucher_no) {
        const parts = lastVoucher.voucher_no.split("-")
        if (parts.length === 2) {
            nextNum = parseInt(parts[1], 10) + 1
        }
    }
    const voucherNo = `${prefix}${nextNum.toString().padStart(3, '0')}`

    // 3. Insert Voucher Header
    const { data: header, error: headerErr } = await supabase.from("vouchers").insert({
        org_id: orgId,
        voucher_type: payload.voucher_type,
        voucher_no: voucherNo,
        date: payload.date,
        reference: payload.reference,
        narration: payload.narration,
        created_by: user?.id
    }).select().single()

    if (headerErr) throw headerErr

    // 4. Insert Double Entry Lines
    const entries = payload.ledger_entries.map(e => ({
        voucher_id: header.id,
        ledger_id: e.ledger_id,
        debit_amount: e.debit_amount || 0,
        credit_amount: e.credit_amount || 0,
    }))

    const { error: lineErr } = await supabase.from("voucher_entries").insert(entries)

    if (lineErr) {
        await cleanupVoucherOnFailure(supabase, header.id)
        throw lineErr
    }

    // 5. Insert Inventory Items (if any)
    if (payload.items && payload.items.length > 0) {
        const movementType = payload.voucher_type === 'Purchase' ? 'IN' : 'OUT'
        const voucherItems = payload.items.map(item => ({
            voucher_id: header.id,
            item_id: item.item_id,
            qty: item.qty,
            rate: item.rate,
            amount: item.amount,
            movement_type: movementType
        }))
        const { error: itemErr } = await supabase.from("voucher_items").insert(voucherItems)
        if (itemErr) {
            await cleanupVoucherOnFailure(supabase, header.id)
            throw itemErr
        }
    }

    revalidatePath("/vouchers")
    revalidatePath("/inventory")
    revalidatePath("/accounting")
    return header
}

export async function getRecentVouchers() {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { data, error } = await supabase
        .from("vouchers")
        .select(`
            *,
            voucher_entries (
                ledger_id,
                debit_amount,
                credit_amount,
                ledgers ( name )
            )
        `)
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(50)

    if (error) {
        console.error("Error fetching vouchers:", error)
        return []
    }
    return data
}

export async function deleteVoucher(id: string) {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { error } = await supabase
        .from("vouchers")
        .delete()
        .eq("id", id)
        .eq("org_id", orgId)

    if (error) throw error

    revalidatePath("/vouchers")
    revalidatePath("/inventory")
    revalidatePath("/accounting")
}
