"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";
import { getAccountingOrgId } from "@/lib/accounting-org";

export async function createStatementRequest(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getAccountingOrgId();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const bankLedgerId = String(formData.get("bank_ledger_id") || "");
  const periodStart = String(formData.get("period_start") || "");
  const periodEnd = String(formData.get("period_end") || "");
  const purpose = String(formData.get("purpose") || "").trim();
  const deliveryMethod = String(formData.get("delivery_method") || "Digital");

  if (!bankLedgerId) return { error: "Select a bank account." };
  if (!periodStart || !periodEnd) return { error: "Select the statement period." };
  if (periodStart > periodEnd) return { error: "Start date must be before the end date." };

  const { error } = await supabase.from("statement_requests").insert({
    org_id: orgId,
    bank_ledger_id: bankLedgerId,
    period_start: periodStart,
    period_end: periodEnd,
    purpose: purpose || null,
    delivery_method: deliveryMethod,
    requested_by: user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/accounting/info/account/statement-requests");
  return { success: true };
}

export async function updateStatementRequestStatus(id: string, status: string) {
  const supabase = await createClient();
  const orgId = await getAccountingOrgId();
  const allowed = ["Pending", "Requested", "Received", "Cancelled"];
  if (!allowed.includes(status)) return { error: "Invalid status." };

  const { error } = await supabase
    .from("statement_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("org_id", orgId);
  if (error) return { error: error.message };

  revalidatePath("/accounting/info/account/statement-requests");
  return { success: true };
}
