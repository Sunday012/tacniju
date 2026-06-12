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

export type BatchListItem = {
  id: string
  batchNo: string
  voucherNo: string
  itemCount: number
  totalQty: number
}

export async function getBatches(): Promise<BatchListItem[]> {
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
    .like("voucher_no", "BAT-%")
    .not("reference", "is", null)
    .order("created_at", { ascending: true })

  if (error) return []

  return (data || [])
    .filter(voucher => String(voucher.reference || "").trim())
    .map((voucher: any, index) => ({
      id: voucher.id,
      batchNo: String(voucher.reference || `Batch ${index + 1}`),
      voucherNo: voucher.voucher_no,
      itemCount: (voucher.voucher_items || []).length,
      totalQty: (voucher.voucher_items || []).reduce((sum: number, item: any) => sum + Number(item.qty || 0), 0),
    }))
}

export async function getBatch(id: string) {
  if (id === "new") return null

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
        id,
        item_id,
        qty,
        rate,
        amount,
        items ( name )
      )
    `)
    .eq("id", id)
    .eq("org_id", orgId)
    .maybeSingle()

  if (error) return null
  return data
}

export async function saveBatch(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const orgId = await getOrgId()
  const { data: { user } } = await supabase.auth.getUser()
  const batchId = String(formData.get("batch_id") || "").trim()
  const batchNo = String(formData.get("batch_no") || "").trim()
  const narration = String(formData.get("narration") || "").trim()

  if (!batchNo) return { error: "Batch No is required" }

  const rawRows = Array.from({ length: 10 }).map((_, index) => ({
    itemRef: String(formData.get(`item_${index}`) || "").trim(),
    qty: Number(formData.get(`qty_${index}`) || 0),
    rate: Number(formData.get(`rate_${index}`) || 0),
  })).filter(row => row.itemRef && Number.isFinite(row.qty) && row.qty > 0)

  if (rawRows.length === 0) return { error: "Please enter at least one valid item with a quantity." }

  const { data: items } = await supabase
    .from("items")
    .select("id, name, purchase_rate, selling_rate, source_context, source_asset_id")
    .eq("org_id", orgId)

  const availableItems = (items || []).filter(item => item.source_context !== "admin" && !item.source_asset_id)
  const itemById = new Map(availableItems.map(item => [item.id, item]))
  const itemByName = new Map(availableItems.map(item => [String(item.name || "").trim().toLowerCase(), item]))
  
  for (const row of rawRows) {
    const item = itemById.get(row.itemRef) || itemByName.get(row.itemRef.toLowerCase())
    if (!item) {
      return { error: `Item "${row.itemRef}" not found in inventory. Please select an existing item.` }
    }
  }

  const rows = rawRows.flatMap(row => {
    const item = itemById.get(row.itemRef) || itemByName.get(row.itemRef.toLowerCase())
    return item ? [{ item, qty: row.qty, rate: row.rate }] : []
  })

  if (rows.length === 0) return { error: "No valid items found." }

  let voucherId = batchId
  if (batchId) {
    const { error } = await supabase
      .from("vouchers")
      .update({
        reference: batchNo,
        narration: narration || "Batch",
      })
      .eq("id", batchId)
      .eq("org_id", orgId)

    if (error) return { error: "Failed to update batch reference." }
    await supabase.from("voucher_items").delete().eq("voucher_id", batchId)
  } else {
    const { data: lastVoucher } = await supabase
      .from("vouchers")
      .select("voucher_no")
      .eq("org_id", orgId)
      .like("voucher_no", "BAT-%")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    const lastNumber = Number(String(lastVoucher?.voucher_no || "").split("-")[1] || 0)
    const voucherNo = `BAT-${String(lastNumber + 1).padStart(3, "0")}`
    const { data: voucher, error } = await supabase
      .from("vouchers")
      .insert({
        org_id: orgId,
        voucher_type: "Purchase",
        voucher_no: voucherNo,
        date: new Date().toISOString().slice(0, 10),
        reference: batchNo,
        narration: narration || "Batch",
        created_by: user?.id || null,
      })
      .select("id")
      .single()

    if (error || !voucher) return { error: "Failed to create batch voucher." }
    voucherId = voucher.id
  }

  const { error: itemError } = await supabase.from("voucher_items").insert(rows.map(row => {
    const finalRate = row.rate || Number(row.item.purchase_rate || row.item.selling_rate || 0)
    return {
      voucher_id: voucherId,
      item_id: row.item.id,
      qty: row.qty,
      rate: finalRate,
      amount: finalRate * row.qty,
      movement_type: "IN",
    }
  }))

  if (itemError) return { error: "Failed to save batch items." }

  revalidatePath("/accounting/display/batch")
  revalidatePath(`/accounting/display/batch/${voucherId}`)
  revalidatePath("/accounting/stock-summary")
  redirect(`/accounting/display/batch/${voucherId}`)
}

export async function deleteBatch(batchId: string) {
  if (!batchId) return { error: "Invalid batch ID" }
  
  const supabase = await createClient()
  const orgId = await getOrgId()

  const { error: itemsError } = await supabase
    .from("voucher_items")
    .delete()
    .eq("voucher_id", batchId)

  if (itemsError) return { error: "Failed to delete batch items." }

  const { error } = await supabase
    .from("vouchers")
    .delete()
    .eq("id", batchId)
    .eq("org_id", orgId)
    .eq("voucher_type", "Purchase")

  if (error) return { error: "Failed to delete batch." }

  revalidatePath("/accounting/display/batch")
  revalidatePath("/accounting/stock-summary")
  redirect("/accounting/display/batch")
}
