"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"

async function getOrgId() {
  return getAccountingOrgId()
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

export type ProductionJournalDetail = {
  id: string
  voucherNo: string
  batchNo: string
  journalType: "Production" | "Raw Material"
  inRows: Array<{ itemName: string; qty: number }>
  outRows: Array<{ itemName: string; qty: number }>
}

export type KitchenStockRow = {
  itemId: string
  name: string
  quantity: number
  unit: string
  rate: number
  value: number
  isVisible: boolean
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

export async function setProductionCategoryActive(categoryId: string, active: boolean) {
  const supabase = await createClient()
  const orgId = await getOrgId()
  const id = categoryId.trim()

  if (!id) return { error: "Category ID is required." }

  const { error } = await supabase
    .from("production_categories")
    .update({
      active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("org_id", orgId)

  if (error) {
    console.error("Failed to update production category status", error)
    return { error: "Failed to update category status." }
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
    .delete()
    .eq("id", id)
    .eq("org_id", orgId)

  if (error) {
    console.error("Failed to permanently delete production category", error)
    return { error: "Failed to delete category. It may still be used by existing items." }
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
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to fetch production journal summaries", error)
    return []
  }

  return (data || [])
    .filter((voucher: any) => {
      const narration = String(voucher.narration || "")
      const voucherNo = String(voucher.voucher_no || "")
      return narration === "Production" || narration === "Raw Material" || voucherNo.startsWith("STJ-") || voucherNo.startsWith("RMJ-")
    })
    .map((voucher: any) => {
      const voucherNo = String(voucher.voucher_no || "")
      const narration = String(voucher.narration || "")
      const journalType = narration === "Raw Material" || voucherNo.startsWith("RMJ-") ? "Raw Material" : "Production"

      return {
        id: voucher.id,
        voucherNo: voucher.voucher_no || "-",
        batchNo: voucher.reference || "-",
        journalType,
        itemCount: (voucher.voucher_items || []).length,
        totalQty: (voucher.voucher_items || []).reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0),
        narration: voucher.narration || journalType,
      }
    })
}

export async function getKitchenStockRows(options: { visibleOnly?: boolean } = {}): Promise<KitchenStockRow[]> {
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

  const { data: settings, error: settingsError } = await supabase
    .from("kitchen_food_items")
    .select("item_id, is_visible, deleted_at")
    .eq("org_id", orgId)

  if (settingsError) {
    console.error("Failed to fetch kitchen food visibility", settingsError)
  }

  const settingsByItem = new Map((settings || []).map((setting: any) => [
    String(setting.item_id),
    {
      isVisible: Boolean(setting.is_visible),
      deleted: Boolean(setting.deleted_at),
    },
  ]))

  const rows = new Map<string, KitchenStockRow>()
  for (const movement of data || []) {
    const item = Array.isArray((movement as any).items) ? (movement as any).items[0] : (movement as any).items
    if (!item) continue

    const itemId = String((movement as any).item_id)
    const setting = settingsByItem.get(itemId)
    if (setting?.deleted) continue
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
      isVisible: setting?.isVisible || false,
    })
  }

  return Array.from(rows.values())
    .filter(row => row.quantity > 0)
    .filter(row => options.visibleOnly ? row.isVisible : true)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function toggleKitchenFoodVisibility(itemId: string, currentVisibility: boolean) {
  const supabase = await createClient()
  const orgId = await getOrgId()
  const { data: { user } } = await supabase.auth.getUser()
  const id = itemId.trim()

  if (!id) return { error: "Food item is required." }

  const { error } = await supabase
    .from("kitchen_food_items")
    .upsert({
      org_id: orgId,
      item_id: id,
      is_visible: !currentVisibility,
      deleted_at: null,
      updated_by: user?.id || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "org_id,item_id" })

  if (error) {
    console.error("Failed to toggle kitchen food visibility", error)
    return { error: "Failed to update kitchen food visibility. Run scripts/038_create_kitchen_food_items.sql first." }
  }

  revalidatePath("/admin/dining-hall")
  revalidatePath("/admin/dining-hall/kitchen")
  revalidatePath("/admin/dining-hall/timetable")
  return { success: true }
}

export async function deleteKitchenFoodItem(itemId: string) {
  const supabase = await createClient()
  const orgId = await getOrgId()
  const { data: { user } } = await supabase.auth.getUser()
  const id = itemId.trim()

  if (!id) return { error: "Food item is required." }

  const { error } = await supabase
    .from("kitchen_food_items")
    .upsert({
      org_id: orgId,
      item_id: id,
      is_visible: false,
      deleted_at: new Date().toISOString(),
      updated_by: user?.id || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "org_id,item_id" })

  if (error) {
    console.error("Failed to delete kitchen food item", error)
    return { error: "Failed to delete kitchen food item. Run scripts/038_create_kitchen_food_items.sql first." }
  }

  revalidatePath("/admin/dining-hall")
  revalidatePath("/admin/dining-hall/kitchen")
  revalidatePath("/admin/dining-hall/timetable")
  return { success: true }
}

export async function getProductionJournalById(voucherId: string, journalType: "Production" | "Raw Material"): Promise<ProductionJournalDetail | null> {
  const supabase = await createClient()
  const orgId = await getOrgId()
  const id = voucherId.trim()
  if (!id) return null

  const { data, error } = await supabase
    .from("vouchers")
    .select(`
      id,
      voucher_no,
      reference,
      narration,
      voucher_items (
        qty,
        movement_type,
        items (
          name
        )
      )
    `)
    .eq("id", id)
    .eq("org_id", orgId)
    .eq("voucher_type", "Purchase")
    .maybeSingle()

  const voucherNo = String((data as any)?.voucher_no || "")
  const narration = String((data as any)?.narration || "")
  const matchesJournalType = journalType === "Raw Material"
    ? narration === "Raw Material" || voucherNo.startsWith("RMJ-")
    : narration === "Production" || voucherNo.startsWith("STJ-")

  if (error || !data || !matchesJournalType) {
    console.error("Failed to fetch production journal", error)
    return null
  }

  const rows: Array<{ itemName: string; qty: number; movementType: "IN" | "OUT" }> = ((data as any).voucher_items || []).map((item: any) => {
    const linkedItem = Array.isArray(item.items) ? item.items[0] : item.items
    return {
      itemName: String(linkedItem?.name || ""),
      qty: Number(item.qty || 0),
      movementType: item.movement_type as "IN" | "OUT",
    }
  })

  return {
    id: data.id,
    voucherNo: data.voucher_no || "",
    batchNo: data.reference || "",
    journalType: data.narration as "Production" | "Raw Material",
    inRows: rows.filter(row => row.movementType === "IN").map(({ itemName, qty }) => ({ itemName, qty })),
    outRows: rows.filter(row => row.movementType === "OUT").map(({ itemName, qty }) => ({ itemName, qty })),
  }
}

export async function saveProductionJournal(formData: FormData) {
  const supabase = await createClient()
  const orgId = await getOrgId()
  const { data: { user } } = await supabase.auth.getUser()
  const journalType = String(formData.get("journal_type") || "Production")
  const journalId = String(formData.get("journal_id") || "").trim()
  const voucherNo = String(formData.get("voucher_no") || "").trim()
  const batchNo = String(formData.get("batch_no") || "").trim()
  const today = new Date().toISOString().slice(0, 10)

  const rowIndexes = Array.from(formData.keys()).reduce((indexes, key) => {
    const match = String(key).match(/^(in|out)_(item|item_name|qty)_(\d+)$/)
    if (match) indexes.add(Number(match[3]))
    return indexes
  }, new Set<number>())

  const rawRows = Array.from(rowIndexes).flatMap((index) => {
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
  let voucherId = journalId
  if (journalId) {
    const { error: updateVoucherError } = await supabase
      .from("vouchers")
      .update({
        voucher_no: finalVoucherNo,
        reference: batchNo || null,
      })
      .eq("id", journalId)
      .eq("org_id", orgId)
      .eq("voucher_type", "Purchase")
      .eq("narration", journalType)

    if (updateVoucherError) {
      console.error("Failed to update production journal voucher", updateVoucherError)
      return
    }

    const { error: deleteItemsError } = await supabase
      .from("voucher_items")
      .delete()
      .eq("voucher_id", journalId)

    if (deleteItemsError) {
      console.error("Failed to clear production journal items", deleteItemsError)
      return
    }
  } else {
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
    voucherId = voucher.id
  }

  const rateMap = new Map(availableItems.map(item => [item.id, Number(item.purchase_rate || item.selling_rate || 0)]))
  const { error: itemError } = await supabase.from("voucher_items").insert(rows.map(row => {
    const rate = rateMap.get(row.item_id) || 0
    return {
      voucher_id: voucherId,
      item_id: row.item_id,
      qty: row.qty,
      rate,
      amount: rate * row.qty,
      movement_type: row.movement_type,
    }
  }))

  if (itemError) {
    if (!journalId) await supabase.from("vouchers").delete().eq("id", voucherId)
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
  redirect("/accounting/production/journal-summary")
}

export async function deleteProductionJournal(voucherId: string) {
  const supabase = await createClient()
  const orgId = await getOrgId()
  const id = voucherId.trim()
  if (!id) return { error: "Journal ID is required." }

  const { data: voucher, error: fetchError } = await supabase
    .from("vouchers")
    .select("id, voucher_no, narration")
    .eq("id", id)
    .eq("org_id", orgId)
    .eq("voucher_type", "Purchase")
    .maybeSingle()

  const voucherNo = String((voucher as any)?.voucher_no || "")
  const narration = String((voucher as any)?.narration || "")
  const isProductionJournal = narration === "Production" || narration === "Raw Material" || voucherNo.startsWith("STJ-") || voucherNo.startsWith("RMJ-")

  if (fetchError || !voucher || !isProductionJournal) {
    console.error("Failed to find production journal for delete", fetchError)
    return { error: "Could not find journal." }
  }

  const { error: itemError } = await supabase.from("voucher_items").delete().eq("voucher_id", id)
  if (itemError) {
    console.error("Failed to delete production journal items", itemError)
    return { error: "Failed to delete journal items." }
  }

  const { error: voucherError } = await supabase.from("vouchers").delete().eq("id", id).eq("org_id", orgId)
  if (voucherError) {
    console.error("Failed to delete production journal", voucherError)
    return { error: "Failed to delete journal." }
  }

  revalidatePath("/accounting/production")
  revalidatePath("/accounting/production/journal-summary")
  revalidatePath("/accounting/production/reports")
  revalidatePath("/accounting/production/reports/stock")
  revalidatePath("/accounting/production/inventory/items")
  revalidatePath("/admin/dining-hall")
  revalidatePath("/admin/dining-hall/kitchen")
  revalidatePath("/admin/dining-hall/timetable")
  return { success: true }
}
