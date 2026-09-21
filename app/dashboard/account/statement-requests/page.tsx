import Link from "next/link";
import { ArrowLeft, FileClock } from "lucide-react";
import { createClient } from "@/lib/server";
import { getAccountingOrgId } from "@/lib/accounting-org";
import { StatementRequestForm } from "./statement-request-form";

type Bank = { id: string; name: string; bank_name: string | null; account_number: string | null };
type StatementRequest = {
  id: string;
  period_start: string;
  period_end: string;
  purpose: string | null;
  delivery_method: string;
  status: string;
  created_at: string;
  ledgers: { name: string; bank_name: string | null; account_number: string | null }[] | null;
};

export default async function MemberStatementRequestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const orgId = await getAccountingOrgId();
  const [{ data: banks }, { data: requests }] = await Promise.all([
    supabase.from("ledgers").select("id, name, bank_name, account_number").eq("org_id", orgId).eq("ledger_kind", "bank").order("name"),
    user
      ? supabase.from("statement_requests").select("id, period_start, period_end, purpose, delivery_method, status, created_at, ledgers(name, bank_name, account_number)").eq("org_id", orgId).eq("requested_by", user.id).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);
  const memberBanks = (banks || []) as Bank[];
  const memberRequests = (requests || []) as StatementRequest[];

  return (
    <div className="mx-auto max-w-6xl py-4 sm:py-8">
      <Link href="/dashboard/account" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-700">
        <ArrowLeft className="h-4 w-4" /> Back to Account
      </Link>
      <div className="mb-8 mt-6 flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-indigo-100 bg-indigo-50 text-indigo-700"><FileClock className="h-5 w-5" /></span>
        <div><h1 className="text-3xl font-extrabold text-slate-900">Statement Request</h1><p className="mt-1 text-slate-500">Request a bank statement and track your requests.</p></div>
      </div>

      <StatementRequestForm banks={memberBanks} />

      <section className="mt-7 overflow-x-auto border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Requested</th><th className="px-5 py-3">Bank</th><th className="px-5 py-3">Period</th><th className="px-5 py-3">Purpose</th><th className="px-5 py-3">Delivery</th><th className="px-5 py-3">Status</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {memberRequests.map((request) => {
              const bank = request.ledgers?.[0];
              return <tr key={request.id}><td className="px-5 py-4 text-slate-600">{new Date(request.created_at).toLocaleDateString("en-GB")}</td><td className="px-5 py-4"><p className="font-bold text-slate-900">{bank?.name || "Bank"}</p><p className="text-xs text-slate-500">{bank?.bank_name || ""} {bank?.account_number || ""}</p></td><td className="px-5 py-4 text-slate-600">{request.period_start} to {request.period_end}</td><td className="max-w-xs px-5 py-4 text-slate-600">{request.purpose || "-"}</td><td className="px-5 py-4 text-slate-600">{request.delivery_method}</td><td className="px-5 py-4"><span className="inline-flex border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">{request.status}</span></td></tr>;
            })}
            {!memberRequests.length && <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">You have not made any statement requests yet.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}
