import { Building2, FileClock } from "lucide-react";
import { AccountingShell } from "@/components/accounting/accounting-shell";
import { AccountingMenuList } from "@/components/accounting/accounting-menu-list";

const items = [
  { href: "/accounting/info/account/banks", label: "Bank Details", icon: Building2 },
  { href: "/accounting/info/account/statement-requests", label: "Statement Requests", icon: FileClock },
];

export default function AccountAreaPage() {
  return <AccountingShell title="Account" backHref="/accounting/info" backLabel="Accounts Info"><AccountingMenuList items={items} /></AccountingShell>;
}
