"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"
import { getNextVoucherNo, getVoucherPrefix } from "@/lib/voucher-numbering"
import { isGuestProfile } from "@/lib/profile-kind"

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

async function getOrgId() {
  return getAccountingOrgId()
}

async function getOrCreateAccountGroup(
  supabase: SupabaseClient,
  orgId: string,
  name: string,
  nature: "Asset" | "Liability" | "Income" | "Expense"
) {
  const { data: existing } = await supabase
    .from("account_groups")
    .select("id")
    .eq("org_id", orgId)
    .eq("name", name)
    .order("created_at", { ascending: true })
    .limit(1)

  if (existing?.[0]?.id) return existing[0].id as string

  const { data, error } = await supabase
    .from("account_groups")
    .insert({ org_id: orgId, name, nature, parent_id: null })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

async function getOrCreateLevyIncomeLedger(supabase: SupabaseClient, orgId: string) {
  const { data: existing } = await supabase
    .from("ledgers")
    .select("id")
    .eq("org_id", orgId)
    .eq("name", "Levy Income")
    .eq("active", true)
    .limit(1)
    .maybeSingle()

  if (existing?.id) return existing.id as string

  const groupId = await getOrCreateAccountGroup(supabase, orgId, "Income", "Income")
  const { data, error } = await supabase
    .from("ledgers")
    .insert({
      org_id: orgId,
      group_id: groupId,
      name: "Levy Income",
      opening_balance: 0,
      balance_type: "Cr",
      is_cash_bank: false,
      ledger_kind: "ledger",
      source_context: "accounting",
      active: true,
      description: "Default ledger for member levy income",
    })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

async function getOrCreatePartyLedgers(
  supabase: SupabaseClient,
  orgId: string,
  profiles: Array<{
    id: string
    full_name: string | null
    reservation_number: string | null
    phone_number?: string | null
    rank?: string | null
    email?: string | null
  }>
) {
  const profileIds = profiles.map((profile) => profile.id)
  const ledgerIds = new Map<string, string>()

  const { data: existingLedgers, error: existingError } = await supabase
    .from("ledgers")
    .select("id, source_profile_id")
    .eq("org_id", orgId)
    .eq("ledger_kind", "party")
    .in("source_profile_id", profileIds)

  if (existingError) throw existingError

  for (const ledger of existingLedgers || []) {
    if (ledger.source_profile_id) ledgerIds.set(ledger.source_profile_id as string, ledger.id as string)
  }

  const missingProfiles = profiles.filter((profile) => !ledgerIds.has(profile.id))
  if (missingProfiles.length === 0) return ledgerIds

  const groupId = await getOrCreateAccountGroup(supabase, orgId, "Parties", "Asset")
  const { data: createdLedgers, error: createError } = await supabase
    .from("ledgers")
    .insert(
      missingProfiles.map((profile) => ({
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
    .select("id, source_profile_id")

  if (createError) throw createError

  for (const ledger of createdLedgers || []) {
    if (ledger.source_profile_id) ledgerIds.set(ledger.source_profile_id as string, ledger.id as string)
  }

  return ledgerIds
}

async function cleanupVoucherOnFailure(supabase: SupabaseClient, voucherId: string) {
  await supabase.from("vouchers").delete().eq("id", voucherId)
}

export async function createBulkLevyVoucher(formData: FormData) {
  const supabase = await createClient()
  const orgId = await getOrgId()

  const levyName = String(formData.get("levy_name") || "").trim()
  const amount = Number(formData.get("amount") || 0)
  const date = String(formData.get("date") || "").trim()
  const dueDate = String(formData.get("due_date") || "").trim()
  const profileIds = Array.from(new Set(formData.getAll("profile_ids").map((value) => String(value)).filter(Boolean)))

  if (!levyName) return { error: "Levy name is required." }
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Enter a valid levy amount." }
  if (!date) return { error: "Levy date is required." }
  if (profileIds.length === 0) return { error: "Select at least one member." }

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, reservation_number, phone_number, rank, district, assembly, email, member_role, department, office_position")
    .in("id", profileIds)

  if (profileError) return { error: profileError.message }

  const memberProfiles = (profiles || []).filter((profile) => !isGuestProfile(profile))
  if (memberProfiles.length === 0) return { error: "No eligible member was selected." }

  try {
    const [levyLedgerId, partyLedgerIds] = await Promise.all([
      getOrCreateLevyIncomeLedger(supabase, orgId),
      getOrCreatePartyLedgers(supabase, orgId, memberProfiles),
    ])

    const prefix = getVoucherPrefix("Levy")
    const { data: lastVoucher } = await supabase
      .from("vouchers")
      .select("voucher_no")
      .eq("org_id", orgId)
      .eq("voucher_type", "Levy")
      .like("voucher_no", `${prefix}-%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    const voucherNo = getNextVoucherNo("Levy", lastVoucher ? [lastVoucher] : [])
    const { data: { user } } = await supabase.auth.getUser()
    const totalAmount = memberProfiles.length * amount
    const { data: voucher, error: voucherError } = await supabase
      .from("vouchers")
      .insert({
        org_id: orgId,
        voucher_type: "Levy",
        voucher_no: voucherNo,
        date,
        reference: dueDate || null,
        narration: levyName,
        created_by: user?.id,
      })
      .select("id, voucher_no")
      .single()

    if (voucherError) throw voucherError

    const entries = [
      ...memberProfiles.map((profile) => ({
        voucher_id: voucher.id,
        ledger_id: partyLedgerIds.get(profile.id),
        debit_amount: amount,
        credit_amount: 0,
        adjustment_method: "On Account",
        adjustment_reference: levyName,
        due_date: dueDate || null,
      })),
      {
        voucher_id: voucher.id,
        ledger_id: levyLedgerId,
        debit_amount: 0,
        credit_amount: totalAmount,
        adjustment_method: null,
        adjustment_reference: levyName,
        due_date: dueDate || null,
      },
    ].filter((entry) => Boolean(entry.ledger_id))

    const { error: entryError } = await supabase.from("voucher_entries").insert(entries)
    if (entryError) {
      await cleanupVoucherOnFailure(supabase, voucher.id)
      throw entryError
    }

    revalidatePath("/accounting")
    revalidatePath("/accounting/vouchers")
    revalidatePath("/accounting/vouchers/levy")
    revalidatePath("/accounting/vouchers/levy-bulk")
    revalidatePath("/accounting/info")
    revalidatePath("/accounting/info/party")
    revalidatePath("/accounting/display/outstanding-receivable")

    return {
      success: true,
      voucherId: voucher.id as string,
      voucherNo: voucher.voucher_no as string,
      count: memberProfiles.length,
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create levy voucher." }
  }
}
