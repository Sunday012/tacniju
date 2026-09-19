import { AccountingShell } from "@/components/accounting/accounting-shell";
import { createClient } from "@/lib/server";
import { getAccountingOrgId } from "@/lib/accounting-org";
import { StatementRequestsManager } from "./statement-requests-manager";

export default async function StatementRequestsPage() {
  const supabase = await createClient();
  const orgId = await getAccountingOrgId();
  const [{ data: banks }, { data: requests }] = await Promise.all([
    supabase.from("ledgers").select("id, name, bank_name, account_number").eq("org_id", orgId).eq("ledger_kind", "bank").order("name"),
    supabase.from("statement_requests").select("id, period_start, period_end, purpose, delivery_method, status, created_at, ledgers(name, bank_name, account_number)").eq("org_id", orgId).order("created_at", { ascending: false }),
  ]);
  return <AccountingShell title="Statement Requests" backHref="/accounting/info/account" backLabel="Account"><StatementRequestsManager banks={banks || []} requests={requests || []} /></AccountingShell>;
}
