"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileClock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createStatementRequest, updateStatementRequestStatus } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Bank = { id: string; name: string; bank_name: string | null; account_number: string | null };

export function StatementRequestsManager({ banks, requests }: { banks: Bank[]; requests: any[] }) {
  const router = useRouter();
  const year = new Date().getFullYear();
  const [bankId, setBankId] = useState("");
  const [start, setStart] = useState(`${year}-01-01`);
  const [end, setEnd] = useState(`${year}-12-31`);
  const [purpose, setPurpose] = useState("");
  const [delivery, setDelivery] = useState("Digital");
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    const formData = new FormData();
    formData.set("bank_ledger_id", bankId);
    formData.set("period_start", start);
    formData.set("period_end", end);
    formData.set("purpose", purpose);
    formData.set("delivery_method", delivery);
    startTransition(async () => {
      const result = await createStatementRequest(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Statement request added.");
      setPurpose("");
      router.refresh();
    });
  };

  const changeStatus = (id: string, status: string) => startTransition(async () => {
    const result = await updateStatementRequestStatus(id, status);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Request status updated.");
    router.refresh();
  });

  return <div className="space-y-7">
    <section className="border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center gap-3 border-b border-slate-200 px-5 py-4"><FileClock className="h-5 w-5 text-indigo-600" /><div><h2 className="font-extrabold text-slate-900">New Statement Request</h2><p className="text-xs text-slate-500">Track the statements requested from each bank.</p></div></header>
      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-1.5"><Label>Bank Account</Label><Select value={bankId} onValueChange={setBankId}><SelectTrigger><SelectValue placeholder="Select bank" /></SelectTrigger><SelectContent>{banks.map((bank) => <SelectItem key={bank.id} value={bank.id}>{bank.name} {bank.account_number ? `(${bank.account_number})` : ""}</SelectItem>)}</SelectContent></Select></label>
        <label className="grid gap-1.5"><Label>Start Date</Label><Input type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label>
        <label className="grid gap-1.5"><Label>End Date</Label><Input type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
        <label className="grid gap-1.5"><Label>Delivery</Label><Select value={delivery} onValueChange={setDelivery}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Digital", "Printed", "Both"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></label>
        <label className="grid gap-1.5 md:col-span-2 xl:col-span-3"><Label>Purpose / Note</Label><Textarea value={purpose} onChange={(event) => setPurpose(event.target.value)} rows={2} /></label>
        <Button className="self-end" disabled={isPending} onClick={submit}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Request</Button>
      </div>
    </section>
    <section className="overflow-hidden border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Created</th><th className="px-4 py-3">Bank</th><th className="px-4 py-3">Period</th><th className="px-4 py-3">Purpose</th><th className="px-4 py-3">Delivery</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{requests.map((request) => <tr key={request.id}><td className="px-4 py-4">{new Date(request.created_at).toLocaleDateString("en-GB")}</td><td className="px-4 py-4"><p className="font-bold text-slate-900">{request.ledgers?.name || "Bank"}</p><p className="text-xs text-slate-500">{request.ledgers?.bank_name || ""} {request.ledgers?.account_number || ""}</p></td><td className="px-4 py-4">{request.period_start} to {request.period_end}</td><td className="max-w-sm px-4 py-4 text-slate-600">{request.purpose || "-"}</td><td className="px-4 py-4">{request.delivery_method}</td><td className="px-4 py-4"><Select value={request.status} onValueChange={(value) => changeStatus(request.id, value)} disabled={isPending}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent>{["Pending", "Requested", "Received", "Cancelled"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></td></tr>)}{!requests.length && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No statement requests yet.</td></tr>}</tbody></table></div></section>
  </div>;
}
