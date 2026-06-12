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

export type ProductionJournalSummary = {
  id: string
  voucherNo: string
  batchNo: string
  journalType: string
  itemCount: number
  totalQty: number
  narration: string
}

export type KitchenStockRow = {
  itemId: string
  name: string
  quantity: number
  unit: string
  rate: number
  value: number
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

export async function updateProductionCategory(formData: FormData) {
  const supabase = await createClient()
  const orgId = await getOrgId()
  const id = String(formData.get("id") || "").trim()
  const name = String(formData.get("name") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const active = String(formData.get("active") || "true") === "true"

  if (!id) return { error: "Category ID is required." }
  if (!name) return { error: "Category name is required." }

  const { error } = await supabase
    .from("production_categories")
    .update({
      name,
      description: description || null,
      active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("org_id", orgId)

  if (error) {
    console.error("Failed to update production category", error)
    return { error: "Failed to update category." }
  }

  revalidatePath("/accounting/production/inventory/categories")
  revalidatePath("/accounting/production/inventory/items")
  revalidatePath("/accounting/production/reports/category")
  return { success: true }
}

export async function deleteProductionCategory(categoryId: string) {
  const supabase = await createClient()
  const orgId = await getOrgId()
  const id = categoryId.trim()

  if (!id) return { error: "Category ID is required." }

  const { error } = await supabase
    .from("production_categories")
    .update({
      active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("org_id", orgId)

  if (error) {
    console.error("Failed to delete production category", error)
    return { error: "Failed to delete category." }
  }

  revalidatePath("/accounting/production/inventory/categories")
  revalidatePath("/accounting/production/inventory/items")
  revalidatePath("/accounting/production/reports/category")
  return { success: true }
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

export async function updateProductionUnit(formData: FormData) {
  const supabase = await createClient()
  const orgId = await getOrgId()
  const id = String(formData.get("id") || "").trim()
  const name = String(formData.get("name") || "").trim()
  const shortName = String(formData.get("short_name") || "").trim()
  const decimalPlaces = Number(formData.get("decimal_places") || 0)
  const active = String(formData.get("active") || "true") === "true"

  if (!id) return { error: "Unit ID is required." }
  if (!name || !shortName) return { error: "Unit name and short name are required." }
  if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > 6) {
    return { error: "Decimal places must be between 0 and 6." }
  }

  const { error } = await supabase
    .from("production_units")
    .update({
      name,
      short_name: shortName,
      decimal_places: decimalPlaces,
      active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("org_id", orgId)

  if (error) {
    console.error("Failed to update production unit", error)
    return { error: "Failed to update unit." }
  }

  revalidatePath("/accounting/production/inventory/units")
  revalidatePath("/accounting/production/inventory/items")
  return { success: true }
}

export async function deleteProductionUnit(unitId: string) {
  const supabase = await createClient()
  const orgId = await getOrgId()
  const id = unitId.trim()

  if (!id) return { error: "Unit ID is required." }

  const { error } = await supabase
    .from("production_units")
    .update({
      active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("org_id", orgId)

  if (error) {
    console.error("Failed to delete production unit", error)
    return { error: "Failed to delete unit." }
  }

  revalidatePath("/accounting/production/inventory/units")
  revalidatePath("/accounting/production/inventory/items")
  return { success: true }
}

export async function getProductionJournalSummaries(): Promise<ProductionJournalSummary[]> {
  const supabase = await createClient()
  const orgId = await getOrgId()

  const { data, error } = await supabase
    .from("vouchers")
    .select(`
      id,
      voucher_no,
      reference,
      narration,
      voucher_items (
        qty
      )
    `)
    .eq("org_id", orgId)
    .eq("voucher_type", "Purchase")
    .in("narration", ["Production", "Raw Material"])
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to fetch production journal summaries", error)
    return []
  }

  return (data || []).map((voucher: any) => ({
    id: voucher.id,
    voucherNo: voucher.voucher_no || "-",
    batchNo: voucher.reference || "-",
    journalType: voucher.narration || "-",
    itemCount: (voucher.voucher_items || []).length,
    totalQty: (voucher.voucher_items || []).reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0),
    narration: voucher.narration || "-",
  }))
}

export async function getKitchenStockRows(): Promise<KitchenStockRow[]> {
  const supabase = await createClient()
  const orgId = await getOrgId()

  const { data, error } = await supabase
    .from("voucher_items")
    .select(`
      item_id,
      qty,
      amount,
      items (
        name,
        unit,
        primary_unit,
        purchase_rate,
        selling_rate
      ),
      vouchers!inner (
        org_id,
        voucher_type,
        narration
      )
    `)
    .eq("vouchers.org_id", orgId)
    .eq("vouchers.voucher_type", "Purchase")
    .eq("vouchers.narration", "Production")
    .eq("movement_type", "IN")

  if (error) {
    console.error("Failed to fetch kitchen stock rows", error)
    return []
  }

  const rows = new Map<string, KitchenStockRow>()
  for (const movement of data || []) {
    const item = Array.isArray((movement as any).items) ? (movement as any).items[0] : (movement as any).items
    if (!item) continue

    const itemId = String((movement as any).item_id)
    const qty = Number((movement as any).qty || 0)
    const amount = Number((movement as any).amount || 0)
    const current = rows.get(itemId)
    const quantity = (current?.quantity || 0) + qty
    const value = (current?.value || 0) + amount
    const fallbackRate = Number(item.purchase_rate || item.selling_rate || 0)

    rows.set(itemId, {
      itemId,
      name: String(item.name || "-"),
      quantity,
      unit: String(item.primary_unit || item.unit || ""),
      rate: quantity > 0 && value > 0 ? value / quantity : fallbackRate,
      value,
    })
  }

  return Array.from(rows.values())
    .filter(row => row.quantity > 0)
    .sort((a, b) => a.name.localeCompare(b.name))
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
  revalidatePath("/accounting/production/journal-summary")
  revalidatePath("/accounting/production/reports")
  revalidatePath("/accounting/production/reports/stock")
  revalidatePath("/accounting/production/inventory/items")
  revalidatePath("/admin/dining-hall")
  revalidatePath("/admin/dining-hall/kitchen")
  revalidatePath("/admin/dining-hall/timetable")
}
