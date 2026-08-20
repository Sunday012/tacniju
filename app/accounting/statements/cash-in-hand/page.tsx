import { StatementReportPage } from "@/components/accounting/statement-report"

export default function CashInHandStatementPage({ searchParams }: { searchParams?: { ledger?: string; start?: string; end?: string } }) {
  return <StatementReportPage title="Cash in Hand Statement" optionKind="cash" searchParams={searchParams} />
}
