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

export type Item = {
    id: string
    name: string
    code: string | null
    category: string | null
    unit: string
    purchase_rate: number
    selling_rate: number
    opening_qty: number
    reorder_level: number
    description: string | null
    active: boolean
    current_stock?: number // calculated
    source_context?: "admin" | "accounting"
    source_asset_id?: string | null
    primary_unit?: string | null
    secondary_unit?: string | null
    secondary_per_primary?: number | null
    no_stock_alert_enabled?: boolean
    no_stock_quantity?: number
}

export async function getItems() {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { data: items, error } = await supabase
        .from("items")
        .select("*")
        .eq("org_id", orgId)
        .eq("source_context", "accounting")
        .order("name", { ascending: true })

    if (error) return []

    // Calculate current stock using opening_qty + incoming - outgoing
    const { data: movements } = await supabase
        .from("voucher_items")
        .select("item_id, qty, movement_type, vouchers!inner(org_id)")
        .eq("vouchers.org_id", orgId)

    const stockMap = new Map<string, number>()

    // Initialize with opening qty
    for (const item of items) {
        stockMap.set(item.id, Number(item.opening_qty))
    }

    if (movements) {
        for (const m of movements) {
            const current = stockMap.get(m.item_id) || 0
            if (m.movement_type === 'IN') {
                stockMap.set(m.item_id, current + Number(m.qty))
            } else if (m.movement_type === 'OUT') {
                stockMap.set(m.item_id, current - Number(m.qty))
            }
        }
    }

    return items.map(item => ({
        ...item,
        current_stock: stockMap.get(item.id) || 0
    })) as Item[]
}

export async function createItem(payload: Omit<Item, "id" | "current_stock" | "active">) {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { error } = await supabase
        .from("items")
        .insert({
            org_id: orgId,
            source_context: "accounting",
            ...payload,
            unit: payload.primary_unit || payload.unit,
        })

    if (error) throw error
    revalidatePath("/inventory")
    revalidatePath("/accounting")
    revalidatePath("/accounting/production")
}

export async function deleteItem(id: string) {
    const supabase = await createClient()
    const orgId = await getOrgId()

    const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", id)
        .eq("org_id", orgId)

    if (error) throw error

    revalidatePath("/inventory")
    revalidatePath("/accounting")
}
