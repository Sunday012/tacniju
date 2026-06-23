"use server"

import { createClient } from "@/lib/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { isGuestProfile } from "@/lib/profile-kind"

async function getOrgId() {
  const cookieStore = cookies()
  const orgId = cookieStore.get("active_org_id")?.value
  if (!orgId) redirect("/select-church")
  return orgId
}

async function getOrCreatePartyGroup(supabase: Awaited<ReturnType<typeof createClient>>, orgId: string) {
  const { data: existing } = await supabase
    .from("account_groups")
    .select("id")
    .eq("org_id", orgId)
    .eq("name", "Parties")
    .maybeSingle()

  if (existing?.id) return existing.id as string

  const { data, error } = await supabase
    .from("account_groups")
    .insert({ org_id: orgId, name: "Parties", nature: "Asset", parent_id: null })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

async function getOrCreateAccountGroup(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orgId: string,
  name: string,
  nature: "Asset" | "Liability" | "Income" | "Expense"
) {
  const { data: existing } = await supabase
    .from("account_groups")
    .select("id")
    .eq("org_id", orgId)
    .eq("name", name)
    .maybeSingle()

  if (existing?.id) return existing.id as string

  const { data, error } = await supabase
    .from("account_groups")
    .insert({ org_id: orgId, name, nature, parent_id: null })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

export async function getOrCreateDefaultSalesLedger() {
  const supabase = await createClient()
  const orgId = await getOrgId()

  const { data: existing } = await supabase
    .from("ledgers")
    .select("id")
    .eq("org_id", orgId)
    .ilike("name", "Sales%")
    .eq("active", true)
    .limit(1)
    .maybeSingle()

  if (existing?.id) return { ledgerId: existing.id as string }

  const groupId = await getOrCreateAccountGroup(supabase, orgId, "Income", "Income")
  const { data, error } = await supabase
    .from("ledgers")
    .insert({
      org_id: orgId,
      group_id: groupId,
      name: "Sales",
      opening_balance: 0,
      balance_type: "Cr",
      is_cash_bank: false,
      ledger_kind: "ledger",
      source_context: "accounting",
      active: true,
      description: "Default sales account",
    })
    .select("id")
    .single()

  if (error) throw error
  revalidatePath("/accounting")
  revalidatePath("/accounting/info")
  return { ledgerId: data.id as string }
}

export async function getAccountingParties() {
  const supabase = await createClient()
  const orgId = await getOrgId()
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, reservation_number, phone_number, rank, district, assembly, email")
    .order("full_name", { ascending: true })

  const memberProfiles = (profiles || [])
    .filter(profile => !isGuestProfile(profile))

  if (memberProfiles.length > 0) {
    const { data: existingLedgers } = await supabase
      .from("ledgers")
      .select("source_profile_id")
      .eq("org_id", orgId)
      .eq("ledger_kind", "party")
      .not("source_profile_id", "is", null)

    const existingProfileIds = new Set((existingLedgers || []).map(ledger => ledger.source_profile_id as string))
    const missingProfiles = memberProfiles.filter(profile => !existingProfileIds.has(profile.id))

    if (missingProfiles.length > 0) {
      const groupId = await getOrCreatePartyGroup(supabase, orgId)
      const { error } = await supabase.from("ledgers").insert(
        missingProfiles.map(profile => ({
          org_id: orgId,
          group_id: groupId,
          name: profile.full_name || "Unnamed Member",
          opening_balance: 0,
          balance_type: "Dr",
          is_cash_bank: false,
          ledger_kind: "party",
          source_context: "admin",
          source_profile_id: profile.id,
          contact_person: profile.full_name || null,
          phone_number: profile.phone_number || null,
          description: profile.reservation_number ? `Profile party ${profile.reservation_number}` : "Profile party",
          active: true,
        }))
      )

      if (error) {
        console.error("Error auto-creating accounting parties:", error)
      }
    }
  }

  const { data: manualLedgers } = await supabase
    .from("ledgers")
    .select("id, name, phone_number")
    .eq("org_id", orgId)
    .eq("ledger_kind", "party")
    .is("source_profile_id", null)
    .eq("active", true)
    .order("name", { ascending: true })

  const manualParties = (manualLedgers || []).map(ledger => ({
    id: ledger.id as string,
    ledgerId: ledger.id as string,
    name: ledger.name as string,
    reservation_number: null,
    phone_number: (ledger.phone_number as string) || null,
  }))

  const memberParties = memberProfiles.map(profile => ({
    id: profile.id,
    ledgerId: null as string | null,
    name: profile.full_name || "Unnamed Member",
    reservation_number: profile.reservation_number || null,
    phone_number: profile.phone_number || null,
  }))

  return [...memberParties, ...manualParties]
}

export async function createAccountingParty(formData: FormData) {
  const supabase = await createClient()
  const orgId = await getOrgId()

  const name = String(formData.get("name") || "").trim()
  const phone = String(formData.get("phone") || "").trim()
  const address = String(formData.get("address") || "").trim()

  if (!name) return { error: "Party name is required." }

  const groupId = await getOrCreatePartyGroup(supabase, orgId)
  const { error } = await supabase.from("ledgers").insert({
    org_id: orgId,
    group_id: groupId,
    name,
    opening_balance: 0,
    balance_type: "Dr",
    is_cash_bank: false,
    ledger_kind: "party",
    source_context: "manual",
    source_profile_id: null,
    contact_person: name,
    phone_number: phone || null,
    address: address || null,
    description: "Manually created party",
    active: true,
  })

  if (error) return { error: error.message }

  revalidatePath("/accounting/info/party")
  revalidatePath("/accounting/info")
  return { success: true }
}

export async function getOrCreateProfilePartyLedger(profileId: string) {
  const supabase = await createClient()
  const orgId = await getOrgId()

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, reservation_number, phone_number, rank, district, assembly, email")
    .eq("id", profileId)
    .maybeSingle()

  if (profileError) throw profileError
  if (!profile) throw new Error("Party profile not found.")
  if (isGuestProfile(profile)) throw new Error("Guests cannot be used as accounting parties.")

  const { data: existing } = await supabase
    .from("ledgers")
    .select("id")
    .eq("org_id", orgId)
    .eq("source_profile_id", profileId)
    .eq("ledger_kind", "party")
    .maybeSingle()

  if (existing?.id) return { ledgerId: existing.id as string }

  const groupId = await getOrCreatePartyGroup(supabase, orgId)
  const { data, error } = await supabase
    .from("ledgers")
    .insert({
      org_id: orgId,
      group_id: groupId,
      name: profile.full_name || "Unnamed Member",
      opening_balance: 0,
      balance_type: "Dr",
      is_cash_bank: false,
      ledger_kind: "party",
      source_context: "admin",
      source_profile_id: profileId,
      contact_person: profile.full_name || null,
      phone_number: profile.phone_number || null,
      description: profile.reservation_number ? `Profile party ${profile.reservation_number}` : "Profile party",
      active: true,
    })
    .select("id")
    .single()

  if (error) throw error
  revalidatePath("/accounting")
  revalidatePath("/accounting/info")
  revalidatePath("/accounting/info/party")
  return { ledgerId: data.id as string }
}

export type LedgerTransactionRow = {
  id: string
  date: string
  voucherId: string
  voucherNumber: string | null
  voucherType: string
  detailName: string
  debitAmount: number
  creditAmount: number
}

async function fetchLedgerTransactions(ledgerIds: string[], startDate?: string, endDate?: string) {
  const supabase = await createClient()
  const orgId = await getOrgId()

  if (ledgerIds.length === 0) return []

  let query = supabase
    .from("voucher_entries")
    .select(`
      id,
      debit_amount,
      credit_amount,
      ledgers!voucher_entries_ledger_id_fkey(name),
      vouchers!inner(
        id,
        org_id,
        date,
        voucher_no,
        voucher_type
      )
    `)
    .in("ledger_id", ledgerIds)
    .eq("vouchers.org_id", orgId)
    .order("date", { referencedTable: "vouchers", ascending: false })

  if (startDate) query = query.gte("vouchers.date", startDate)
  if (endDate) query = query.lte("vouchers.date", endDate)

  const { data, error } = await query

  if (error) {
    console.error("Error fetching ledger transactions:", error)
    return []
  }

  return (data || []).map((entry: any) => ({
    id: entry.id as string,
    date: entry.vouchers?.date as string,
    voucherId: entry.vouchers?.id as string,
    voucherNumber: (entry.vouchers?.voucher_no as string | null) || null,
    voucherType: (entry.vouchers?.voucher_type as string) || "Voucher",
    detailName: (entry.ledgers?.name as string) || "Ledger",
    debitAmount: Number(entry.debit_amount || 0),
    creditAmount: Number(entry.credit_amount || 0),
  })) as LedgerTransactionRow[]
}

export async function getLedgerTransactions(ledgerId: string, startDate?: string, endDate?: string) {
  return fetchLedgerTransactions([ledgerId], startDate, endDate)
}

export async function getTransactionsForLedgers(ledgerIds: string[], startDate?: string, endDate?: string) {
  return fetchLedgerTransactions(ledgerIds, startDate, endDate)
}

export async function getProfilePartyBalance(profileId: string) {
  const supabase = await createClient()
  const cookieStore = cookies()
  const orgId = cookieStore.get("active_org_id")?.value
  if (!orgId || !profileId) return null

  const { data: ledger, error: ledgerError } = await supabase
    .from("ledgers")
    .select("id, opening_balance, balance_type")
    .eq("org_id", orgId)
    .eq("source_profile_id", profileId)
    .eq("ledger_kind", "party")
    .maybeSingle()

  if (ledgerError || !ledger?.id) return null

  const { data: entries, error: entriesError } = await supabase
    .from("voucher_entries")
    .select(`
      debit_amount,
      credit_amount,
      vouchers!inner(org_id)
    `)
    .eq("ledger_id", ledger.id)
    .eq("vouchers.org_id", orgId)

  if (entriesError) return null

  const opening = Number(ledger.opening_balance || 0) * (ledger.balance_type === "Cr" ? -1 : 1)
  const movement = (entries || []).reduce((sum: number, entry: any) => {
    return sum + Number(entry.debit_amount || 0) - Number(entry.credit_amount || 0)
  }, 0)

  return opening + movement
}

export type AccountingProgram = {
  id: string
  name: string
  amount_to_contribute: number
  description: string | null
  active: boolean
  created_at: string
}

export async function getAccountingPrograms() {
  const supabase = await createClient()
  const orgId = await getOrgId()

  const { data, error } = await supabase
    .from("accounting_programs")
    .select("*")
    .eq("org_id", orgId)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching accounting programs:", error)
    return []
  }

  return data as AccountingProgram[]
}

export async function createAccountingProgram(formData: FormData) {
  const supabase = await createClient()
  const orgId = await getOrgId()

  const name = String(formData.get("name") || "").trim()
  const amount = Number(formData.get("amount") || 0)
  const description = String(formData.get("description") || "").trim()

  if (!name) return { error: "Program name is required." }
  if (amount < 0) return { error: "Amount cannot be negative." }

  const { error } = await supabase.from("accounting_programs").insert({
    org_id: orgId,
    name,
    amount_to_contribute: amount,
    description: description || null,
  })

  if (error) return { error: error.message }

  revalidatePath("/accounting/programs")
  revalidatePath("/accounting/vouchers/payment")
  return { success: true }
}

export async function deleteAccountingProgram(id: string) {
  const supabase = await createClient()
  const orgId = await getOrgId()

  const { error } = await supabase
    .from("accounting_programs")
    .delete()
    .eq("id", id)
    .eq("org_id", orgId)

  if (error) return { error: error.message }

  revalidatePath("/accounting/programs")
  revalidatePath("/accounting/vouchers/payment")
  return { success: true }
}
