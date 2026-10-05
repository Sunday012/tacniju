"use server"

import { revalidatePath } from "next/cache"

import { getAccountingOrgId } from "@/lib/accounting-org"
import { createClient } from "@/lib/server"

type SalesItemInput = { itemName: string; quantity: number; amount: number }

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, orgId: null, error: "You must be signed in." }
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
  if (!profile?.is_admin) return { supabase, user, orgId: null, error: "Admin access is required." }
  return { supabase, user, orgId: await getAccountingOrgId(), error: null }
}

async function nextSalesOrderNumber(supabase: any, orgId: string) {
  const { data } = await supabase.from("sales_unit_orders").select("order_no").eq("org_id", orgId).like("order_no", "SO-%").order("created_at", { ascending: false }).limit(100)
  const next = Math.max(0, ...(data || []).map((row: { order_no?: string }) => Number(row.order_no?.match(/\d+$/)?.[0] || 0))) + 1
  return `SO-${String(next).padStart(4, "0")}`
}

export async function createSalesUnitOrder(input: { orderDate: string; partyName: string; items: SalesItemInput[]; send: boolean }) {
  const { supabase, user, orgId, error } = await requireAdmin()
  if (error || !user || !orgId) return { error }
  const partyName = input.partyName.trim()
  const items = input.items.map((item) => ({ itemName: item.itemName.trim(), quantity: Number(item.quantity), amount: Number(item.amount) })).filter((item) => item.itemName && item.quantity > 0 && item.amount >= 0)
  if (!input.orderDate || !partyName) return { error: "Date and party name are required." }
  if (items.length === 0) return { error: "Add at least one valid sales item." }

  const orderNo = await nextSalesOrderNumber(supabase, orgId)
  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.amount, 0)
  const { data: order, error: orderError } = await supabase.from("sales_unit_orders").insert({
    org_id: orgId, order_no: orderNo, order_date: input.orderDate, party_name: partyName,
    status: input.send ? "Sent" : "Draft", total_amount: totalAmount, created_by: user.id,
    sent_at: input.send ? new Date().toISOString() : null,
  }).select("id").single()
  if (orderError || !order) return { error: orderError?.message || "Could not create the sales order." }

  const { error: itemError } = await supabase.from("sales_unit_order_items").insert(items.map((item) => ({ order_id: order.id, item_name: item.itemName, quantity: item.quantity, amount: item.amount })))
  if (itemError) {
    await supabase.from("sales_unit_orders").delete().eq("id", order.id).eq("org_id", orgId)
    return { error: itemError.message }
  }

  if (input.send) {
    const lines = items.map((item) => `${item.itemName}: ${item.quantity} x NGN ${item.amount.toFixed(2)}`).join("\n")
    const { error: fileError } = await supabase.from("admin_office_files").insert({
      org_id: orgId, office_unit: "Finance Officer", title: `Sales Order ${orderNo} - ${partyName}`,
      description: `Date: ${input.orderDate}\nTotal: NGN ${totalAmount.toFixed(2)}\n\n${lines}`,
      file_type: "Sales Order", submitted_from: "Sale Unit", created_by: user.id,
    })
    if (fileError) return { error: `Order saved, but it could not be sent: ${fileError.message}` }
  }
  revalidatePath("/admin/office/secretariat/financial-secretary/sale-unit")
  revalidatePath("/admin/office/admin-office/files", "layout")
  return { success: true, orderNo }
}

export async function deleteSalesUnitOrder(id: string) {
  const { supabase, orgId, error } = await requireAdmin()
  if (error || !orgId) return { error }
  const { error: deleteError } = await supabase.from("sales_unit_orders").delete().eq("id", id).eq("org_id", orgId)
  if (deleteError) return { error: deleteError.message }
  revalidatePath("/admin/office/secretariat/financial-secretary/sale-unit")
  return { success: true }
}
