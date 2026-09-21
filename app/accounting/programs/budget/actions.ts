"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"

export type BudgetSheet = { id: string; title: string; budget_type: "Monthly" | "Program"; budget_month: string | null; program_id: string | null; created_at: string; accounting_programs?: { name: string }[] | null }
export type BudgetGroup = { id: string; budget_sheet_id: string; name: string; section: "Income" | "Expense" | "Savings"; sort_order: number }
export type BudgetItem = { id: string; budget_sheet_id: string; budget_group_id: string; name: string; budget_amount: number; actual_amount: number; notes: string | null; sort_order: number }

async function context() {
  const supabase = await createClient()
  const orgId = await getAccountingOrgId()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("You must be signed in.")
  return { supabase, orgId, user }
}

function refreshBudgetPages() {
  revalidatePath("/accounting/programs/budget", "layout")
}

export async function getBudgetSheets(type?: "Monthly" | "Program") {
  const { supabase, orgId } = await context()
  let query = supabase.from("program_budget_sheets").select("id, title, budget_type, budget_month, program_id, created_at, accounting_programs(name)").eq("org_id", orgId).order("created_at", { ascending: false })
  if (type) query = query.eq("budget_type", type)
  const { data, error } = await query
  if (error) return [] as BudgetSheet[]
  return (data || []) as BudgetSheet[]
}

export async function getBudgetSheet(id: string) {
  const { supabase, orgId } = await context()
  const { data: sheet, error } = await supabase.from("program_budget_sheets").select("id, title, budget_type, budget_month, program_id, created_at, accounting_programs(name)").eq("id", id).eq("org_id", orgId).maybeSingle()
  if (error || !sheet) return null
  const [{ data: groups }, { data: items }] = await Promise.all([
    supabase.from("program_budget_groups").select("id, budget_sheet_id, name, section, sort_order").eq("budget_sheet_id", id).order("sort_order"),
    supabase.from("program_budget_items").select("id, budget_sheet_id, budget_group_id, name, budget_amount, actual_amount, notes, sort_order").eq("budget_sheet_id", id).order("sort_order"),
  ])
  return { sheet: sheet as BudgetSheet, groups: (groups || []) as BudgetGroup[], items: (items || []) as BudgetItem[] }
}

export async function createBudgetSheet(formData: FormData) {
  const { supabase, orgId, user } = await context()
  const type = String(formData.get("budget_type") || "Monthly") as BudgetSheet["budget_type"]
  const title = String(formData.get("title") || "").trim()
  const month = String(formData.get("budget_month") || "")
  const programId = String(formData.get("program_id") || "")
  if (!title) return { error: "Budget name is required." }
  if (!(["Monthly", "Program"] as string[]).includes(type)) return { error: "Select a valid budget type." }
  if (type === "Program" && !programId) return { error: "Select the program this budget is for." }

  const { data: sheet, error } = await supabase.from("program_budget_sheets").insert({ org_id: orgId, title, budget_type: type, budget_month: type === "Monthly" && month ? `${month}-01` : null, program_id: type === "Program" ? programId : null, created_by: user.id }).select("id").single()
  if (error || !sheet) return { error: error?.message || "Could not create budget." }

  if (type === "Monthly") {
    const { error: groupError } = await supabase.from("program_budget_groups").insert([
      { budget_sheet_id: sheet.id, name: "Income", section: "Income", sort_order: 1 },
      { budget_sheet_id: sheet.id, name: "Expenses", section: "Expense", sort_order: 2 },
      { budget_sheet_id: sheet.id, name: "Savings", section: "Savings", sort_order: 3 },
    ])
    if (groupError) return { error: groupError.message }
  }
  refreshBudgetPages()
  return { success: true, id: sheet.id as string }
}

export async function deleteBudgetSheet(id: string) {
  const { supabase, orgId } = await context()
  const { error } = await supabase.from("program_budget_sheets").delete().eq("id", id).eq("org_id", orgId)
  if (error) return { error: error.message }
  refreshBudgetPages()
  return { success: true }
}

export async function createBudgetGroup(sheetId: string, name: string, section: BudgetGroup["section"]) {
  const { supabase, orgId } = await context()
  if (!name.trim()) return { error: "Group name is required." }
  const { data: sheet } = await supabase.from("program_budget_sheets").select("id").eq("id", sheetId).eq("org_id", orgId).maybeSingle()
  if (!sheet) return { error: "Budget not found." }
  const { data: last } = await supabase.from("program_budget_groups").select("sort_order").eq("budget_sheet_id", sheetId).order("sort_order", { ascending: false }).limit(1).maybeSingle()
  const { error } = await supabase.from("program_budget_groups").insert({ budget_sheet_id: sheetId, name: name.trim(), section, sort_order: (last?.sort_order || 0) + 1 })
  if (error) return { error: error.message }
  refreshBudgetPages()
  return { success: true }
}

export async function deleteBudgetGroup(id: string) {
  const { supabase } = await context()
  const { error } = await supabase.from("program_budget_groups").delete().eq("id", id)
  if (error) return { error: error.message }
  refreshBudgetPages()
  return { success: true }
}

export async function createBudgetItem(sheetId: string, groupId: string, name: string) {
  const { supabase } = await context()
  if (!name.trim()) return { error: "Item name is required." }
  const { data: last } = await supabase.from("program_budget_items").select("sort_order").eq("budget_group_id", groupId).order("sort_order", { ascending: false }).limit(1).maybeSingle()
  const { error } = await supabase.from("program_budget_items").insert({ budget_sheet_id: sheetId, budget_group_id: groupId, name: name.trim(), sort_order: (last?.sort_order || 0) + 1 })
  if (error) return { error: error.message }
  refreshBudgetPages()
  return { success: true }
}

export async function updateBudgetItem(id: string, updates: { name?: string; budget_amount?: number; actual_amount?: number; notes?: string }) {
  const { supabase } = await context()
  const payload: Record<string, string | number | null> = { updated_at: new Date().toISOString() }
  if (updates.name !== undefined) payload.name = updates.name.trim()
  if (updates.budget_amount !== undefined) payload.budget_amount = Math.max(0, updates.budget_amount)
  if (updates.actual_amount !== undefined) payload.actual_amount = Math.max(0, updates.actual_amount)
  if (updates.notes !== undefined) payload.notes = updates.notes.trim() || null
  const { error } = await supabase.from("program_budget_items").update(payload).eq("id", id)
  if (error) return { error: error.message }
  refreshBudgetPages()
  return { success: true }
}

export async function deleteBudgetItem(id: string) {
  const { supabase } = await context()
  const { error } = await supabase.from("program_budget_items").delete().eq("id", id)
  if (error) return { error: error.message }
  refreshBudgetPages()
  return { success: true }
}
