"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createReceiptNote } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SourceOption = {
  key: string;
  id: string;
  sourceType: "stock" | "gift";
  name: string;
  stockNumber: string | null;
  groupNumber: string | null;
  giftNumber: string | null;
};

type Line = { sourceKey: string; quantity: number };

export function ReceiptNoteManager({ sources, notes }: { sources: SourceOption[]; notes: any[] }) {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [supplier, setSupplier] = useState("");
  const [billReference, setBillReference] = useState("");
  const [narration, setNarration] = useState("");
  const [lines, setLines] = useState<Line[]>([{ sourceKey: "", quantity: 1 }]);
  const [isPending, startTransition] = useTransition();

  const save = () => {
    const validLines = lines.filter((line) => line.sourceKey && line.quantity > 0);
    const items = validLines.map((line) => {
      const source = sources.find((option) => option.key === line.sourceKey)!;
      return {
        source_type: source.sourceType,
        source_id: source.id,
        item_name: source.name,
        stock_tracking_number: source.stockNumber,
        stock_group_tracking_number: source.groupNumber,
        gift_number: source.giftNumber,
        quantity: line.quantity,
      };
    });

    startTransition(async () => {
      const result = await createReceiptNote({ received_date: date, supplier, bill_reference: billReference, narration, items });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`${result.receiptNo} created.`);
      setSupplier("");
      setBillReference("");
      setNarration("");
      setLines([{ sourceKey: "", quantity: 1 }]);
      router.refresh();
    });
  };

  return (
    <div className="space-y-7">
      <section className="border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
          <ClipboardCheck className="h-5 w-5 text-indigo-600" />
          <div><h2 className="font-extrabold text-slate-900">New Receipt Note</h2><p className="text-xs text-slate-500">Document goods received and their tracking numbers.</p></div>
        </div>
        <div className="space-y-5 p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-1.5"><Label>Received Date</Label><Input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
            <label className="grid gap-1.5"><Label>Supplier / From</Label><Input value={supplier} onChange={(event) => setSupplier(event.target.value)} /></label>
            <label className="grid gap-1.5"><Label>Bill Reference</Label><Input value={billReference} onChange={(event) => setBillReference(event.target.value)} placeholder="Invoice or delivery note" /></label>
          </div>

          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-3">Item / Gift</th><th className="px-3 py-3">Stock No.</th><th className="px-3 py-3">Group No.</th><th className="px-3 py-3">Gift No.</th><th className="px-3 py-3">Qty</th><th className="w-12" /></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {lines.map((line, index) => {
                  const source = sources.find((option) => option.key === line.sourceKey);
                  return <tr key={index}>
                    <td className="px-3 py-2"><Select value={line.sourceKey} onValueChange={(value) => setLines((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, sourceKey: value } : item))}><SelectTrigger className="w-[280px]"><SelectValue placeholder="Select received item" /></SelectTrigger><SelectContent>{sources.map((option) => <SelectItem key={option.key} value={option.key}>{option.name} ({option.sourceType})</SelectItem>)}</SelectContent></Select></td>
                    <td className="px-3 py-2 font-mono text-xs text-indigo-700">{source?.stockNumber || "-"}</td>
                    <td className="px-3 py-2 font-mono text-xs text-indigo-700">{source?.groupNumber || "-"}</td>
                    <td className="px-3 py-2 font-mono text-xs text-indigo-700">{source?.giftNumber || "-"}</td>
                    <td className="px-3 py-2"><Input className="w-28" type="number" min="0.01" step="0.01" value={line.quantity} onChange={(event) => setLines((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: Number(event.target.value) } : item))} /></td>
                    <td className="px-2"><button type="button" title="Remove item" className="rounded p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => setLines((current) => current.length === 1 ? [{ sourceKey: "", quantity: 1 }] : current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" /></button></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full max-w-xl"><Label>Remarks</Label><Textarea className="mt-1.5" value={narration} onChange={(event) => setNarration(event.target.value)} /></div>
            <div className="flex gap-2"><Button variant="outline" onClick={() => setLines((current) => [...current, { sourceKey: "", quantity: 1 }])}><Plus className="mr-2 h-4 w-4" />Add Item</Button><Button disabled={isPending} onClick={save}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Receipt Note</Button></div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 px-5 py-4"><h2 className="font-extrabold text-slate-900">Receipt Note Register</h2></header>
        <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Receipt No.</th><th className="px-4 py-3">Supplier</th><th className="px-4 py-3">Bill Ref.</th><th className="px-4 py-3">Items</th><th className="px-4 py-3">Tracking Numbers</th></tr></thead><tbody className="divide-y divide-slate-100">{notes.map((note) => <tr key={note.id}><td className="px-4 py-4">{new Date(`${note.received_date}T00:00:00`).toLocaleDateString("en-GB")}</td><td className="px-4 py-4 font-mono font-bold text-indigo-700">{note.receipt_no}</td><td className="px-4 py-4">{note.supplier || "-"}</td><td className="px-4 py-4">{note.bill_reference || "-"}</td><td className="px-4 py-4">{note.receipt_note_items?.map((item: any) => `${item.item_name} x ${item.quantity}`).join(", ") || "-"}</td><td className="px-4 py-4 font-mono text-xs text-slate-600">{note.receipt_note_items?.flatMap((item: any) => [item.stock_tracking_number, item.stock_group_tracking_number, item.gift_number]).filter(Boolean).join(", ") || "-"}</td></tr>)}{!notes.length && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No receipt notes yet.</td></tr>}</tbody></table></div>
      </section>
    </div>
  );
}
