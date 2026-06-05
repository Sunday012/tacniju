import Link from "next/link"
import { ArrowLeft, Building2, FileText, MessageSquareText, Phone, WalletCards } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

type Metric = {
  label: string
  value: string
}

type Field = {
  label: string
  value: string
}

type DetailSection = {
  title: string
  fields: Field[]
}

export function InfoRecordProfile({
  title,
  subtitle,
  backHref,
  backLabel,
  metrics,
  details,
  transactionItems = [],
  comment,
}: {
  title: string
  subtitle?: string
  backHref: string
  backLabel: string
  metrics: Metric[]
  details: DetailSection[]
  transactionItems?: string[]
  comment?: string
}) {
  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-900">
      <div className="bg-[#ececff]">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <Link href={backHref} className="inline-flex items-center gap-2 text-base font-medium text-slate-700 transition hover:text-slate-950">
            <ArrowLeft className="h-5 w-5" />
            Back to {backLabel}
          </Link>

          <div className="mt-5">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-2 text-base text-slate-600">{subtitle}</p> : null}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {metrics.map(metric => (
              <div key={metric.label} className="border-l border-slate-500/50 pl-5">
                <p className="text-xl font-medium text-slate-700">{metric.label}</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="h-auto w-full justify-start gap-8 rounded-none border-b border-slate-200 bg-transparent p-0 text-left">
            <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent px-0 py-4 text-lg font-medium text-slate-500 shadow-none data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none">
              Details
            </TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-none border-b-2 border-transparent px-0 py-4 text-lg font-medium text-slate-500 shadow-none data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="comments" className="rounded-none border-b-2 border-transparent px-0 py-4 text-lg font-medium text-slate-500 shadow-none data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none">
              Comments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-5">
            {details.map(section => (
              <Card key={section.title} className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900">{section.title}</h2>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {section.fields.map(field => (
                      <div key={field.label}>
                        <p className="text-sm font-medium uppercase tracking-wide text-slate-400">{field.label}</p>
                        <p className="mt-2 text-xl font-medium text-slate-800">{field.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <WalletCards className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-900">Transactions</h2>
                </div>
                {transactionItems.length === 0 ? (
                  <p className="text-base text-slate-500">No transaction items linked yet.</p>
                ) : (
                  <div className="space-y-3">
                    {transactionItems.map(item => (
                      <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-700">
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments">
            <Card className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <MessageSquareText className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-900">Comments</h2>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-base text-slate-600">
                  {comment || "No comments added yet."}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
