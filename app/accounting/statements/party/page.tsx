import { StatementReportPage } from "@/components/accounting/statement-report"

export default function PartyStatementPage({ searchParams }: { searchParams?: { ledger?: string; start?: string; end?: string } }) {
  return <StatementReportPage title="Party Statement" optionKind="party" searchParams={searchParams} />
}
