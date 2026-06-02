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

async function syncAdminAssetsToAccountingItems(supabase: Awaited<ReturnType<typeof createClient>>, orgId: string) {
    const { data: assets } = await supabase
        .from("assets")
        .select("id, name, category, money_price, total_quantity, available_quantity")
        .order("name", { ascending: true })

    if (!assets?.length) return

    const { data: existing } = await supabase
        .from("items")
        .select("source_asset_id")
        .eq("org_id", orgId)
        .not("source_asset_id", "is", null)

    const existingAssetIds = new Set((existing || []).map(item => item.source_asset_id))
    const missingAssets = assets.filter(asset => !existingAssetIds.has(asset.id))

    if (missingAssets.length === 0) return

    await supabase.from("items").insert(missingAssets.map(asset => ({
        org_id: orgId,
        name: asset.name,
        code: null,
        category: asset.category || "Admin Stock",
        unit: "Unit",
        primary_unit: "Unit",
        secondary_unit: null,
        secondary_per_primary: 1,
        purchase_rate: 0,
        selling_rate: Number(asset.money_price || 0),
        opening_qty: Number(asset.available_quantity ?? asset.total_quantity ?? 0),
        reorder_level: 0,
        no_stock_alert_enabled: false,
        no_stock_quantity: 0,
        source_context: "admin",
        source_asset_id: asset.id,
        description: "Synced from admin stock",
        active: true,
    })))
}

export async function getItems() {
    const supabase = await createClient()
    const orgId = await getOrgId()

    await syncAdminAssetsToAccountingItems(supabase, orgId)

    // Get items
    const { data: items, error } = await supabase
        .from("items")
        .select("*")
        .eq("org_id", orgId)
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
