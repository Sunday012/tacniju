import { StatementReportPage } from "@/components/accounting/statement-report"

export default function BankStatementPage({ searchParams }: { searchParams?: { ledger?: string; start?: string; end?: string } }) {
  return <StatementReportPage title="Bank Statement" optionKind="bank" searchParams={searchParams} />
}
