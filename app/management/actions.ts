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
    return data
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

export async function createLedger(payload: Omit<Ledger, "id">) {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { error } = await supabase
        .from("ledgers")
        .insert({
            org_id: orgId,
            ...payload
        })

    if (error) throw error
    revalidatePath("/management")
}

export async function updateLedger(id: string, payload: Partial<Omit<Ledger, "id">>) {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { error } = await supabase
        .from("ledgers")
        .update(payload)
        .eq("id", id)
        .eq("org_id", orgId)

    if (error) throw error
    revalidatePath("/management")
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
}
