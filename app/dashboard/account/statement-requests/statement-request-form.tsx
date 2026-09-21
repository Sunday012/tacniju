"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createMemberStatementRequest } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Bank = { id: string; name: string; bank_name: string | null; account_number: string | null };

export function StatementRequestForm({ banks }: { banks: Bank[] }) {
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
      const result = await createMemberStatementRequest(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Statement request sent.");
      setPurpose("");
      router.refresh();
    });
  };

  return (
    <section className="border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-1.5"><Label>Bank Account</Label><Select value={bankId} onValueChange={setBankId}><SelectTrigger><SelectValue placeholder="Select bank" /></SelectTrigger><SelectContent>{banks.map((bank) => <SelectItem key={bank.id} value={bank.id}>{bank.name}{bank.account_number ? ` (${bank.account_number})` : ""}</SelectItem>)}</SelectContent></Select></label>
        <label className="grid gap-1.5"><Label>Start Date</Label><Input type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label>
        <label className="grid gap-1.5"><Label>End Date</Label><Input type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
        <label className="grid gap-1.5"><Label>Delivery</Label><Select value={delivery} onValueChange={setDelivery}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Digital", "Printed", "Both"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></label>
        <label className="grid gap-1.5 md:col-span-2 xl:col-span-3"><Label>Purpose or Note</Label><Textarea rows={2} value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="Optional note for this request" /></label>
        <Button className="self-end" disabled={isPending || !banks.length} onClick={submit}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send Request</Button>
      </div>
    </section>
  );
}
