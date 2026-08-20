import { StatementReportPage } from "@/components/accounting/statement-report"

export default function LedgerStatementPage({ searchParams }: { searchParams?: { ledger?: string; start?: string; end?: string } }) {
  return <StatementReportPage title="Ledger Statement" optionKind="ledger" searchParams={searchParams} />
}
