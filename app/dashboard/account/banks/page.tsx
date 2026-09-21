import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { createClient } from "@/lib/server";
import { getAccountingOrgId } from "@/lib/accounting-org";

type Bank = {
  id: string;
  name: string;
  bank_name: string | null;
  account_number: string | null;
  contact_person: string | null;
};

export default async function MemberBankDetailsPage() {
  const supabase = await createClient();
  const orgId = await getAccountingOrgId();
  const { data } = await supabase
    .from("ledgers")
    .select("id, name, bank_name, account_number, contact_person")
    .eq("org_id", orgId)
    .eq("ledger_kind", "bank")
    .order("name");
  const banks = (data || []) as Bank[];

  return (
    <div className="mx-auto max-w-6xl py-4 sm:py-8">
      <Link href="/dashboard/account" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-700">
        <ArrowLeft className="h-4 w-4" /> Back to Account
      </Link>
      <div className="mb-8 mt-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center border border-indigo-100 bg-indigo-50 text-indigo-700"><Building2 className="h-5 w-5" /></span>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Bank Details</h1>
            <p className="mt-1 text-slate-500">Details of the church bank accounts available to members.</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Account Name</th>
              <th className="px-5 py-3">Bank Name</th>
              <th className="px-5 py-3">Account Number</th>
              <th className="px-5 py-3">Account Holder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {banks.map((bank) => (
              <tr key={bank.id}>
                <td className="px-5 py-4 font-bold text-slate-900">{bank.name}</td>
                <td className="px-5 py-4 text-slate-600">{bank.bank_name || "-"}</td>
                <td className="px-5 py-4 font-mono text-slate-700">{bank.account_number || "-"}</td>
                <td className="px-5 py-4 text-slate-600">{bank.contact_person || "-"}</td>
              </tr>
            ))}
            {!banks.length && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400">No bank accounts are available yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
