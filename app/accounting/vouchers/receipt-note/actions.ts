"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";
import { getAccountingOrgId } from "@/lib/accounting-org";

export type ReceiptNoteLineInput = {
  source_type: "stock" | "gift";
  source_id: string;
  item_name: string;
  stock_tracking_number?: string | null;
  stock_group_tracking_number?: string | null;
  gift_number?: string | null;
  quantity: number;
};

export type ReceiptNoteInput = {
  received_date: string;
  supplier?: string;
  bill_reference?: string;
  narration?: string;
  items: ReceiptNoteLineInput[];
};

function nextReceiptNumber(value?: string | null) {
  const number = Number(value?.match(/RN-(\d+)/i)?.[1] || 0) + 1;
  return `RN-${String(number).padStart(5, "0")}`;
}

export async function createReceiptNote(payload: ReceiptNoteInput) {
  const supabase = await createClient();
  const orgId = await getAccountingOrgId();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  if (!payload.received_date) return { error: "Received date is required." };
  if (!payload.items.length) return { error: "Add at least one received item." };
  if (payload.items.some((item) => !item.source_id || item.quantity <= 0)) return { error: "Every item needs a valid quantity." };

  const { data: lastNote } = await supabase
    .from("receipt_notes")
    .select("receipt_no")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: note, error: noteError } = await supabase
    .from("receipt_notes")
    .insert({
      org_id: orgId,
      receipt_no: nextReceiptNumber(lastNote?.receipt_no),
      received_date: payload.received_date,
      supplier: payload.supplier?.trim() || null,
      bill_reference: payload.bill_reference?.trim() || null,
      narration: payload.narration?.trim() || null,
      created_by: user.id,
    })
    .select("id, receipt_no")
    .single();

  if (noteError || !note) return { error: noteError?.message || "Could not create receipt note." };

  const { error: itemsError } = await supabase.from("receipt_note_items").insert(
    payload.items.map((item) => ({
      receipt_note_id: note.id,
      source_type: item.source_type,
      item_id: item.source_type === "stock" ? item.source_id : null,
      asset_id: item.source_type === "gift" ? item.source_id : null,
      item_name: item.item_name,
      stock_tracking_number: item.stock_tracking_number || null,
      stock_group_tracking_number: item.stock_group_tracking_number || null,
      gift_number: item.gift_number || null,
      quantity: item.quantity,
    })),
  );

  if (itemsError) {
    await supabase.from("receipt_notes").delete().eq("id", note.id);
    return { error: itemsError.message };
  }

  revalidatePath("/accounting/vouchers/receipt-note");
  return { success: true, receiptNo: note.receipt_no };
}

export async function getReceiptNotes() {
  const supabase = await createClient();
  const orgId = await getAccountingOrgId();
  const { data, error } = await supabase
    .from("receipt_notes")
    .select("id, receipt_no, received_date, supplier, bill_reference, narration, created_at, receipt_note_items(id, item_name, source_type, stock_tracking_number, stock_group_tracking_number, gift_number, quantity)")
    .eq("org_id", orgId)
    .order("received_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return { rows: [], error: error.message };
  return { rows: data || [], error: null };
}
