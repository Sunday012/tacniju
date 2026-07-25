"use server"

import { createClient } from "@/lib/server"
import { revalidatePath } from "next/cache"
import { getNextVoucherNo, getVoucherPrefix } from "@/lib/voucher-numbering"
import { getAccountingOrgId } from "@/lib/accounting-org"

async function getOrgId() {
    return getAccountingOrgId()
}

export type VoucherType = 'Payment' | 'Receipt' | 'Sales' | 'Purchase' | 'Contra' | 'Expense' | 'Levy' | 'Income' | 'Program'

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
    adjustment_method?: 'New Reference' | 'Against Reference' | 'Through Reference' | 'For Reference' | 'Advance' | 'On Account'
    adjustment_reference?: string
    due_date?: string
}

export type VoucherFormPayload = {
    voucher_type: VoucherType
    date: string
    narration: string
    reference?: string
    items?: VoucherItemPayload[]
    ledger_entries: VoucherLedgerEntry[]
}

export type VoucherUpdatePayload = VoucherFormPayload & {
    id: string
}

async function cleanupVoucherOnFailure(supabase: Awaited<ReturnType<typeof createClient>>, voucherId: string) {
    await supabase
        .from("vouchers")
        .delete()
        .eq("id", voucherId)
}

function optionalVoucherValue(value: string | undefined) {
    if (!value || value === "$undefined") return null
    return value
}

export async function saveVoucher(payload: VoucherFormPayload) {
    const supabase = await createClient()
    const orgId = await getOrgId()

    // 1. Get user
    const { data: { user } } = await supabase.auth.getUser()

    // 2. Auto-increment Voucher Number
    const prefix = getVoucherPrefix(payload.voucher_type)
    const { data: lastVoucher } = await supabase
        .from("vouchers")
        .select("voucher_no")
        .eq("org_id", orgId)
        .eq("voucher_type", payload.voucher_type)
        .like("voucher_no", `${prefix}-%`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

    const voucherNo = getNextVoucherNo(payload.voucher_type, lastVoucher ? [lastVoucher] : [])

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
        adjustment_method: optionalVoucherValue(e.adjustment_method),
        adjustment_reference: optionalVoucherValue(e.adjustment_reference),
        due_date: optionalVoucherValue(e.due_date),
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
    revalidatePath("/accounting/programs")
    if (payload.voucher_type === "Expense") revalidatePath("/accounting/display/expense-purchase-register")
    if (payload.voucher_type === "Income") revalidatePath("/accounting/display/income-register")
    return header
}

export async function updateVoucher(payload: VoucherUpdatePayload) {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { data: existing, error: existingError } = await supabase
        .from("vouchers")
        .select("id, voucher_type")
        .eq("id", payload.id)
        .eq("org_id", orgId)
        .maybeSingle()

    if (existingError) throw existingError
    if (!existing) throw new Error("Voucher not found.")
    if (existing.voucher_type !== payload.voucher_type) {
        throw new Error("Voucher type cannot be changed while editing.")
    }

    const { error: headerErr } = await supabase
        .from("vouchers")
        .update({
            date: payload.date,
            reference: payload.reference || null,
            narration: payload.narration,
        })
        .eq("id", payload.id)
        .eq("org_id", orgId)

    if (headerErr) throw headerErr

    const { data: existingEntries, error: existingEntriesError } = await supabase
        .from("voucher_entries")
        .select("id")
        .eq("voucher_id", payload.id)

    if (existingEntriesError) throw existingEntriesError

    const { error: deleteEntriesError } = await supabase
        .from("voucher_entries")
        .delete()
        .eq("voucher_id", payload.id)

    if (deleteEntriesError) throw deleteEntriesError

    if ((existingEntries || []).length > 0) {
        const { data: remainingEntries, error: remainingEntriesError } = await supabase
            .from("voucher_entries")
            .select("id")
            .eq("voucher_id", payload.id)

        if (remainingEntriesError) throw remainingEntriesError
        if ((remainingEntries || []).length > 0) {
            throw new Error("Could not clear the old voucher entries before saving the edit.")
        }
    }

    const { data: existingItems, error: existingItemsError } = await supabase
        .from("voucher_items")
        .select("id")
        .eq("voucher_id", payload.id)

    if (existingItemsError) throw existingItemsError

    const { error: deleteItemsError } = await supabase
        .from("voucher_items")
        .delete()
        .eq("voucher_id", payload.id)

    if (deleteItemsError) throw deleteItemsError

    if ((existingItems || []).length > 0) {
        const { data: remainingItems, error: remainingItemsError } = await supabase
            .from("voucher_items")
            .select("id")
            .eq("voucher_id", payload.id)

        if (remainingItemsError) throw remainingItemsError
        if ((remainingItems || []).length > 0) {
            throw new Error("Could not clear the old voucher items before saving the edit.")
        }
    }

    const entries = payload.ledger_entries.map(e => ({
        voucher_id: payload.id,
        ledger_id: e.ledger_id,
        debit_amount: e.debit_amount || 0,
        credit_amount: e.credit_amount || 0,
        adjustment_method: optionalVoucherValue(e.adjustment_method),
        adjustment_reference: optionalVoucherValue(e.adjustment_reference),
        due_date: optionalVoucherValue(e.due_date),
    }))

    const { error: lineErr } = await supabase.from("voucher_entries").insert(entries)
    if (lineErr) throw lineErr

    if (payload.items && payload.items.length > 0) {
        const movementType = payload.voucher_type === 'Purchase' ? 'IN' : 'OUT'
        const voucherItems = payload.items.map(item => ({
            voucher_id: payload.id,
            item_id: item.item_id,
            qty: item.qty,
            rate: item.rate,
            amount: item.amount,
            movement_type: movementType
        }))
        const { error: itemErr } = await supabase.from("voucher_items").insert(voucherItems)
        if (itemErr) throw itemErr
    }

    revalidatePath("/vouchers")
    revalidatePath("/inventory")
    revalidatePath("/accounting")
    revalidatePath("/accounting/day-book")
    revalidatePath("/accounting/programs")
    if (payload.voucher_type === "Expense") revalidatePath("/accounting/display/expense-purchase-register")
    if (payload.voucher_type === "Income") revalidatePath("/accounting/display/income-register")
    revalidatePath(`/accounting/vouchers/${payload.voucher_type.toLowerCase()}/${payload.id}`)
    return { id: payload.id }
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
                adjustment_method,
                adjustment_reference,
                due_date,
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

export async function getVoucherById(id: string) {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { data, error } = await supabase
        .from("vouchers")
        .select(`
            *,
            voucher_entries (
                id,
                ledger_id,
                debit_amount,
                credit_amount,
                adjustment_method,
                adjustment_reference,
                due_date,
                ledgers ( name )
            ),
            voucher_items (
                id,
                item_id,
                qty,
                rate,
                amount,
                movement_type,
                items ( name )
            )
        `)
        .eq("id", id)
        .eq("org_id", orgId)
        .maybeSingle()

    if (error) {
        console.error("Error fetching voucher:", error)
        return null
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
    revalidatePath("/accounting/day-book")
    revalidatePath("/accounting/programs")
    revalidatePath("/accounting/display/expense-purchase-register")
    revalidatePath("/accounting/display/income-register")
}
