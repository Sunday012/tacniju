import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type ProductionReportViewProps = {
  title: string
  columns: string[]
  emptyMessage: string
}

export function ProductionReportView({ title, columns, emptyMessage }: ProductionReportViewProps) {
  return (
    <div className="space-y-7">
      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50 [&_th]:px-5 [&_th]:py-3.5 [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-600">
                <TableRow className="border-slate-200">
                  {columns.map(column => (
                    <TableHead key={column} className="text-slate-500">
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="[&_td]:px-5 [&_td]:py-3.5">
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-6 text-center text-slate-500">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
