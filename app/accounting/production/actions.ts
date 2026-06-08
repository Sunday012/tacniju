"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/server"

async function getOrgId() {
  const cookieStore = cookies()
  const orgId = cookieStore.get("active_org_id")?.value
  if (!orgId) redirect("/select-church")
  return orgId
}

export type ProductionCategory = {
  id: string
  name: string
  description: string | null
  active: boolean
}

export type ProductionUnit = {
  id: string
  name: string
  short_name: string
  decimal_places: number
  active: boolean
}

export async function getProductionCategories() {
  const supabase = await createClient()
  const orgId = await getOrgId()
  const { data, error } = await supabase
    .from("production_categories")
    .select("id, name, description, active")
    .eq("org_id", orgId)
    .order("name", { ascending: true })

  if (error) return { rows: [] as ProductionCategory[], error: error.message }
  return { rows: (data || []) as ProductionCategory[], error: null }
}

export async function createProductionCategory(formData: FormData) {
  const supabase = await createClient()
  const orgId = await getOrgId()
  const { data: { user } } = await supabase.auth.getUser()
  const name = String(formData.get("name") || "").trim()
  const description = String(formData.get("description") || "").trim()

  if (!name) return

  const { error } = await supabase.from("production_categories").insert({
    org_id: orgId,
    name,
    description: description || null,
    created_by: user?.id || null,
  })

  if (error) {
    console.error("Failed to create production category", error)
    return
  }
  revalidatePath("/accounting/production/inventory/categories")
  revalidatePath("/accounting/production/inventory/items")
}

export async function getProductionUnits() {
  const supabase = await createClient()
  const orgId = await getOrgId()
  const { data, error } = await supabase
    .from("production_units")
    .select("id, name, short_name, decimal_places, active")
    .eq("org_id", orgId)
    .order("name", { ascending: true })

  if (error) return { rows: [] as ProductionUnit[], error: error.message }
  return { rows: (data || []) as ProductionUnit[], error: null }
}

export async function createProductionUnit(formData: FormData) {
  const supabase = await createClient()
  const orgId = await getOrgId()
  const { data: { user } } = await supabase.auth.getUser()
  const name = String(formData.get("name") || "").trim()
  const shortName = String(formData.get("short_name") || "").trim()
  const decimalPlaces = Number(formData.get("decimal_places") || 0)

  if (!name || !shortName) return
  if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > 6) {
    return
  }

  const { error } = await supabase.from("production_units").insert({
    org_id: orgId,
    name,
    short_name: shortName,
    decimal_places: decimalPlaces,
    created_by: user?.id || null,
  })

  if (error) {
    console.error("Failed to create production unit", error)
    return
  }
  revalidatePath("/accounting/production/inventory/units")
  revalidatePath("/accounting/production/inventory/items")
}

export async function saveProductionJournal(formData: FormData) {
  const supabase = await createClient()
  const orgId = await getOrgId()
  const { data: { user } } = await supabase.auth.getUser()
  const journalType = String(formData.get("journal_type") || "Production")
  const voucherNo = String(formData.get("voucher_no") || "").trim()
  const batchNo = String(formData.get("batch_no") || "").trim()
  const today = new Date().toISOString().slice(0, 10)

  const rawRows = Array.from({ length: 10 }).flatMap((_, index) => {
    const result: Array<{ itemRef: string; qty: number; movement_type: "IN" | "OUT" }> = []
    const inItem = String(formData.get(`in_item_${index}`) || formData.get(`in_item_name_${index}`) || "").trim()
    const inQty = Number(formData.get(`in_qty_${index}`) || 0)
    const outItem = String(formData.get(`out_item_${index}`) || formData.get(`out_item_name_${index}`) || "").trim()
    const outQty = Number(formData.get(`out_qty_${index}`) || 0)

    if (inItem && Number.isFinite(inQty) && inQty > 0) result.push({ itemRef: inItem, qty: inQty, movement_type: "IN" })
    if (outItem && Number.isFinite(outQty) && outQty > 0) result.push({ itemRef: outItem, qty: outQty, movement_type: "OUT" })
    return result
  })

  if (rawRows.length === 0) return

  const { data: allItems, error: itemsError } = await supabase
    .from("items")
    .select("id, name, purchase_rate, selling_rate, source_context, source_asset_id")
    .eq("org_id", orgId)

  if (itemsError || !allItems?.length) {
    console.error("Failed to resolve production journal items", itemsError)
    return
  }

  const availableItems = allItems.filter(item => item.source_context !== "admin" && !item.source_asset_id)
  const itemById = new Map(availableItems.map(item => [item.id, item]))
  const itemByName = new Map(availableItems.map(item => [String(item.name || "").trim().toLowerCase(), item]))
  const rows = rawRows.flatMap(row => {
    const item = itemById.get(row.itemRef) || itemByName.get(row.itemRef.toLowerCase())
    return item ? [{ item_id: item.id, qty: row.qty, movement_type: row.movement_type as "IN" | "OUT" }] : []
  })

  if (rows.length === 0) {
    console.error("No matching production items were found for the journal rows.")
    return
  }

  const prefix = journalType === "Raw Material" ? "RMJ" : "STJ"
  const finalVoucherNo = voucherNo || `${prefix}-${Date.now().toString().slice(-6)}`
  const { data: voucher, error: voucherError } = await supabase
    .from("vouchers")
    .insert({
      org_id: orgId,
      voucher_type: "Purchase",
      voucher_no: finalVoucherNo,
      date: today,
      reference: batchNo || null,
      narration: journalType,
      created_by: user?.id || null,
    })
    .select("id")
    .single()

  if (voucherError) {
    console.error("Failed to create production journal voucher", voucherError)
    return
  }

  const rateMap = new Map(availableItems.map(item => [item.id, Number(item.purchase_rate || item.selling_rate || 0)]))
  const { error: itemError } = await supabase.from("voucher_items").insert(rows.map(row => {
    const rate = rateMap.get(row.item_id) || 0
    return {
      voucher_id: voucher.id,
      item_id: row.item_id,
      qty: row.qty,
      rate,
      amount: rate * row.qty,
      movement_type: row.movement_type,
    }
  }))

  if (itemError) {
    await supabase.from("vouchers").delete().eq("id", voucher.id)
    console.error("Failed to create production journal items", itemError)
    return
  }

  revalidatePath("/accounting/production")
  revalidatePath("/accounting/production/reports")
  revalidatePath("/accounting/production/reports/stock")
  revalidatePath("/accounting/production/inventory/items")
}
