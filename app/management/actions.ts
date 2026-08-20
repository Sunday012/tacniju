"use server"

import { createClient } from "@/lib/server"
import { revalidatePath } from "next/cache"
import { getAccountingOrgId } from "@/lib/accounting-org"

async function getOrgId() {
    return getAccountingOrgId()
}

export type AccountGroup = {
    id: string
    name: string
    nature: 'Asset' | 'Liability' | 'Income' | 'Expense'
    parent_id: string | null
}

export async function getAccountGroups() {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { data, error } = await supabase
        .from("account_groups")
        .select("*")
        .eq("org_id", orgId)
        .order("name", { ascending: true })

    if (error) {
        console.error("Error fetching account groups:", error)
        return []
    }
    return data as AccountGroup[]
}

export async function createAccountGroup(payload: Omit<AccountGroup, "id">) {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { data, error } = await supabase
        .from("account_groups")
        .insert({
            org_id: orgId,
            ...payload
        })
        .select()
        .single()

    if (error) throw error
    revalidatePath("/management")
    revalidatePath("/accounting")
    return data
}

export async function updateAccountGroup(id: string, payload: Partial<Omit<AccountGroup, "id">>) {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { data, error } = await supabase
        .from("account_groups")
        .update(payload)
        .eq("id", id)
        .eq("org_id", orgId)
        .select()
        .single()

    if (error) throw error
    revalidatePath("/management")
    revalidatePath("/accounting")
    return data
}

export async function consolidateDuplicateGroups() {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { data: groups, error: groupsError } = await supabase
        .from("account_groups")
        .select("id, name, nature, created_at")
        .eq("org_id", orgId)
        .order("created_at", { ascending: true })

    if (groupsError) throw groupsError

    // Bucket groups that share the same nature + name. The earliest one in each
    // bucket is the canonical group; the rest are duplicates to be merged in.
    const buckets = new Map<string, { canonicalId: string; duplicateIds: string[] }>()
    for (const group of groups || []) {
        const key = `${group.nature}::${String(group.name || "").trim().toLowerCase()}`
        const bucket = buckets.get(key)
        if (bucket) {
            bucket.duplicateIds.push(group.id as string)
        } else {
            buckets.set(key, { canonicalId: group.id as string, duplicateIds: [] })
        }
    }

    const duplicateToCanonical = new Map<string, string>()
    for (const bucket of Array.from(buckets.values())) {
        for (const duplicateId of bucket.duplicateIds) {
            duplicateToCanonical.set(duplicateId, bucket.canonicalId)
        }
    }

    if (duplicateToCanonical.size === 0) {
        return { success: true, removedGroups: 0, movedLedgers: 0 }
    }

    let movedLedgers = 0
    for (const [duplicateId, canonicalId] of Array.from(duplicateToCanonical.entries())) {
        // Move ledgers off the duplicate group onto the canonical one.
        const { data: movedRows, error: moveLedgerError } = await supabase
            .from("ledgers")
            .update({ group_id: canonicalId })
            .eq("org_id", orgId)
            .eq("group_id", duplicateId)
            .select("id")

        if (moveLedgerError) throw moveLedgerError
        movedLedgers += (movedRows || []).length

        // Re-point any child groups that used the duplicate as their parent.
        const { error: moveChildError } = await supabase
            .from("account_groups")
            .update({ parent_id: canonicalId })
            .eq("org_id", orgId)
            .eq("parent_id", duplicateId)

        if (moveChildError) throw moveChildError
    }

    const duplicateIds = Array.from(duplicateToCanonical.keys())
    const { error: deleteError } = await supabase
        .from("account_groups")
        .delete()
        .eq("org_id", orgId)
        .in("id", duplicateIds)

    if (deleteError) throw deleteError

    revalidatePath("/management")
    revalidatePath("/accounting")

    return { success: true, removedGroups: duplicateIds.length, movedLedgers }
}

export async function deleteAccountGroup(id: string) {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const [{ data: linkedLedger }, { data: childGroup }] = await Promise.all([
        supabase
            .from("ledgers")
            .select("id, name")
            .eq("org_id", orgId)
            .eq("group_id", id)
            .limit(1)
            .maybeSingle(),
        supabase
            .from("account_groups")
            .select("id, name")
            .eq("org_id", orgId)
            .eq("parent_id", id)
            .limit(1)
            .maybeSingle()
    ])

    if (linkedLedger) {
        return {
            success: false,
            error: `You can't delete this group yet because ledger "${linkedLedger.name}" is still assigned to it.`,
        }
    }

    if (childGroup) {
        return {
            success: false,
            error: `You can't delete this group yet because child group "${childGroup.name}" still belongs to it.`,
        }
    }

    const { error } = await supabase
        .from("account_groups")
        .delete()
        .eq("id", id)
        .eq("org_id", orgId)

    if (error) {
        if ((error as { code?: string }).code === "23503") {
            return {
                success: false,
                error: "This group is still linked to other records and cannot be deleted yet.",
            }
        }

        throw error
    }

    revalidatePath("/management")
    revalidatePath("/accounting")

    return { success: true }
}

export type CustomFieldDef = {
    id: string
    name: string
    field_type: 'Text' | 'Number' | 'Date' | 'Dropdown' | 'Toggle'
    scope: string
    options_json: string[]
}

export async function getCustomFields() {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { data, error } = await supabase
        .from("custom_field_definitions")
        .select("*")
        .eq("org_id", orgId)

    if (error) return []
    return data as CustomFieldDef[]
}

export async function createCustomField(payload: Omit<CustomFieldDef, "id">) {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { error } = await supabase
        .from("custom_field_definitions")
        .insert({
            org_id: orgId,
            ...payload
        })

    if (error) throw error
    revalidatePath("/management")
}

export type Ledger = {
    id: string
    group_id: string
    name: string
    opening_balance: number
    balance_type: 'Dr' | 'Cr'
    is_cash_bank: boolean
    description: string | null
    account_number: string | null
    bank_name: string | null
    contact_person: string | null
    phone_number: string | null
    email: string | null
    address: string | null
    tax_id: string | null
    custom_data: Record<string, any>
    active: boolean
    ledger_kind?: 'ledger' | 'party' | 'bank'
    source_context?: 'admin' | 'accounting'
    source_profile_id?: string | null
}

export async function getLedgers() {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { data, error } = await supabase
        .from("ledgers")
        .select("*, account_groups(name)")
        .eq("org_id", orgId)
        .order("name", { ascending: true })

    if (error) return []
    return data
}

export type LedgerBalance = { amount: number; type: 'Dr' | 'Cr' }

// Current (closing) balance per ledger: opening balance + netted voucher movements.
export async function getLedgerBalances(): Promise<Record<string, LedgerBalance>> {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { data: ledgersData } = await supabase
        .from("ledgers")
        .select("id, opening_balance, balance_type")
        .eq("org_id", orgId)

    const { data: movements } = await supabase
        .from("voucher_entries")
        .select("ledger_id, debit_amount, credit_amount, vouchers!inner(org_id)")
        .eq("vouchers.org_id", orgId)

    const moves = new Map<string, { dr: number; cr: number }>()
    for (const m of movements || []) {
        const id = m.ledger_id as string
        const curr = moves.get(id) || { dr: 0, cr: 0 }
        curr.dr += Number(m.debit_amount || 0)
        curr.cr += Number(m.credit_amount || 0)
        moves.set(id, curr)
    }

    const balances: Record<string, LedgerBalance> = {}
    for (const ledger of ledgersData || []) {
        const openingDr = ledger.balance_type === 'Dr' ? Number(ledger.opening_balance || 0) : 0
        const openingCr = ledger.balance_type === 'Cr' ? Number(ledger.opening_balance || 0) : 0
        const move = moves.get(ledger.id) || { dr: 0, cr: 0 }
        const net = (openingDr + move.dr) - (openingCr + move.cr)
        balances[ledger.id] = {
            amount: Math.abs(net),
            type: net >= 0 ? 'Dr' : 'Cr',
        }
    }

    return balances
}

export async function createLedger(payload: Omit<Ledger, "id">) {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { error } = await supabase
        .from("ledgers")
        .insert({
            org_id: orgId,
            ledger_kind: payload.is_cash_bank ? "bank" : (payload.ledger_kind || "ledger"),
            source_context: payload.source_context || "accounting",
            ...payload
        })

    if (error) throw error
    revalidatePath("/management")
    revalidatePath("/accounting")
}

export async function updateLedger(id: string, payload: Partial<Omit<Ledger, "id">>) {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { error } = await supabase
        .from("ledgers")
        .update({
            ...payload,
            ledger_kind: payload.is_cash_bank ? "bank" : (payload.ledger_kind || undefined),
        })
        .eq("id", id)
        .eq("org_id", orgId)

    if (error) throw error
    revalidatePath("/management")
    revalidatePath("/accounting")
}

export async function adjustLedgerBalance(id: string, payload: { adjustmentType: "add" | "reduce"; amount: number; note?: string; date?: string }) {
    const supabase = await createClient()
    const orgId = await getOrgId()
    const amount = Number(payload.amount || 0)

    if (!id) return { success: false, error: "Ledger is required." }
    if (amount <= 0) return { success: false, error: "Amount must be greater than zero." }

    const { data: ledger, error: fetchError } = await supabase
        .from("ledgers")
        .select("id, opening_balance, balance_type, description")
        .eq("id", id)
        .eq("org_id", orgId)
        .maybeSingle()

    if (fetchError) throw fetchError
    if (!ledger) return { success: false, error: "Ledger not found." }

    const currentOpening = ledger.balance_type === "Cr"
        ? -Number(ledger.opening_balance || 0)
        : Number(ledger.opening_balance || 0)
    const adjustedOpening = currentOpening + (payload.adjustmentType === "add" ? amount : -amount)
    const note = payload.note?.trim()
    const date = payload.date?.trim()
    const adjustmentNote = [
        date ? `Date: ${date}` : null,
        note || null,
    ].filter(Boolean).join(" - ")
    const description = adjustmentNote
        ? [ledger.description, `Balance adjusted: ${adjustmentNote}`].filter(Boolean).join("\n")
        : ledger.description

    const { error } = await supabase
        .from("ledgers")
        .update({
            opening_balance: Math.abs(adjustedOpening),
            balance_type: adjustedOpening < 0 ? "Cr" : "Dr",
            description,
        })
        .eq("id", id)
        .eq("org_id", orgId)

    if (error) throw error
    revalidatePath("/management")
    revalidatePath("/accounting")
    revalidatePath("/accounting/info")
    revalidatePath("/accounting/info/bank-account")
    revalidatePath(`/accounting/info/bank-account/${id}`)
    revalidatePath("/accounting/info/ledger")
    revalidatePath(`/accounting/info/ledger/${id}`)
    revalidatePath("/accounting/info/party")
    revalidatePath(`/accounting/info/party/${id}`)
    revalidatePath("/accounting/statements")
    return { success: true }
}

export async function deleteLedger(id: string) {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { error } = await supabase
        .from("ledgers")
        .delete()
        .eq("id", id)
        .eq("org_id", orgId)

    if (error) {
        if ((error as { code?: string }).code === "23503") {
            return {
                success: false,
                error: "You can't delete this ledger because it is already used in vouchers or other records.",
            }
        }

        throw error
    }

    revalidatePath("/management")
    revalidatePath("/accounting")
    revalidatePath("/vouchers")

    return { success: true }
}

export async function seedDefaultGroups() {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const defaultGroups = [
        { org_id: orgId, name: 'Capital Account', nature: 'Liability' },
        { org_id: orgId, name: 'Income', nature: 'Income' },
        { org_id: orgId, name: 'Direct Expenses', nature: 'Expense' },
        { org_id: orgId, name: 'Indirect Expenses', nature: 'Expense' },
        { org_id: orgId, name: 'Cash-in-Hand', nature: 'Asset' },
        { org_id: orgId, name: 'Bank Accounts', nature: 'Asset' },
        { org_id: orgId, name: 'Fixed Assets', nature: 'Asset' },
        { org_id: orgId, name: 'Sundry Debtors', nature: 'Asset' },
        { org_id: orgId, name: 'Sundry Creditors', nature: 'Liability' },
        { org_id: orgId, name: 'Reserves & Surplus', nature: 'Liability' },
    ]

    for (const group of defaultGroups) {
        // Only insert if doesn't exist
        const { data } = await supabase.from('account_groups').select('id').eq('org_id', orgId).eq('name', group.name).maybeSingle()
        if (!data) {
            await supabase.from('account_groups').insert(group)
        }
    }
    revalidatePath("/management")
    revalidatePath("/accounting")
}

export async function seedDefaultLedgers() {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const defaultGroups = [
        { name: "Indirect Expenses", nature: "Expense" as const },
        { name: "Bank charges", nature: "Expense" as const },
        { name: "Suspense A/c", nature: "Liability" as const },
    ]

    const groupIds = new Map<string, string>()

    for (const group of defaultGroups) {
        const { data: existingGroup, error: groupLookupError } = await supabase
            .from("account_groups")
            .select("id")
            .eq("org_id", orgId)
            .eq("name", group.name)
            .maybeSingle()

        if (groupLookupError) throw groupLookupError

        if (existingGroup?.id) {
            groupIds.set(group.name, existingGroup.id as string)
            continue
        }

        const { data: createdGroup, error: createGroupError } = await supabase
            .from("account_groups")
            .insert({
                org_id: orgId,
                name: group.name,
                nature: group.nature,
                parent_id: null,
            })
            .select("id")
            .single()

        if (createGroupError) throw createGroupError
        groupIds.set(group.name, createdGroup.id as string)
    }

    const defaultLedgers = [
        { name: "R/off", groupName: "Indirect Expenses", balance_type: "Dr" as const },
        { name: "Stamp Duty", groupName: "Bank charges", balance_type: "Dr" as const },
        { name: "Suspense A/c", groupName: "Suspense A/c", balance_type: "Dr" as const },
    ]

    for (const ledger of defaultLedgers) {
        const groupId = groupIds.get(ledger.groupName)
        if (!groupId) continue

        const { data: existingLedger, error: ledgerLookupError } = await supabase
            .from("ledgers")
            .select("id")
            .eq("org_id", orgId)
            .eq("name", ledger.name)
            .eq("ledger_kind", "ledger")
            .maybeSingle()

        if (ledgerLookupError) throw ledgerLookupError
        if (existingLedger?.id) continue

        const { error: createLedgerError } = await supabase
            .from("ledgers")
            .insert({
                org_id: orgId,
                group_id: groupId,
                name: ledger.name,
                opening_balance: 0,
                balance_type: ledger.balance_type,
                is_cash_bank: false,
                ledger_kind: "ledger",
                source_context: "accounting",
                source_profile_id: null,
                description: "Seeded default ledger",
                account_number: null,
                bank_name: null,
                contact_person: null,
                phone_number: null,
                email: null,
                address: null,
                tax_id: null,
                custom_data: {},
                active: true,
            })

        if (createLedgerError) throw createLedgerError
    }

    revalidatePath("/management")
    revalidatePath("/accounting")
}
