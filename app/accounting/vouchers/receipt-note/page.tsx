import { AccountingShell } from "@/components/accounting/accounting-shell";
import { createClient } from "@/lib/server";
import { getAccountingOrgId } from "@/lib/accounting-org";
import { getReceiptNotes } from "./actions";
import { ReceiptNoteManager } from "./receipt-note-manager";

export default async function ReceiptNotePage() {
  const supabase = await createClient();
  const orgId = await getAccountingOrgId();
  const [{ data: items }, { data: categories }, { data: assets }, notesResult] = await Promise.all([
    supabase.from("items").select("id, name, category, tracking_number").eq("org_id", orgId).eq("source_context", "accounting").order("name"),
    supabase.from("production_categories").select("name, tracking_number").eq("org_id", orgId),
    supabase.from("assets").select("id, name, category, gift_number").eq("is_gift", true).order("name"),
    getReceiptNotes(),
  ]);
  const groupNumbers = new Map((categories || []).map((category) => [category.name.toLowerCase(), category.tracking_number]));
  const sources = [
    ...(items || []).map((item) => ({ key: `stock:${item.id}`, id: item.id, sourceType: "stock" as const, name: item.name, stockNumber: item.tracking_number, groupNumber: item.category ? groupNumbers.get(item.category.toLowerCase()) || null : null, giftNumber: null })),
    ...(assets || []).map((asset) => ({ key: `gift:${asset.id}`, id: asset.id, sourceType: "gift" as const, name: asset.name, stockNumber: null, groupNumber: null, giftNumber: asset.gift_number })),
  ];

  return <AccountingShell title="Receipt Notes" backHref="/accounting/vouchers" backLabel="Accounting Vouchers"><ReceiptNoteManager sources={sources} notes={notesResult.rows || []} /></AccountingShell>;
}
