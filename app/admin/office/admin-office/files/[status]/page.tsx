import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/server"
import { getAccountingOrgId } from "@/lib/accounting-org"
import { AdminOfficeFilesManager, type AdminOfficeFile } from "@/components/admin/admin-office-files-manager"

export const dynamic = "force-dynamic"

const fileStatuses = {
  new: "New",
  approved: "Approved",
  rejected: "Rejected",
} as const

const fileQueueContexts = {
  "Head Office": { backHref: "/admin/office/admin-office/desk" },
  Secretaries: { backHref: "/admin/office/secretariat/secretaries/desk" },
  "Finance Officer": { backHref: "/admin/office/secretariat/financial-secretary/finance-officer" },
} as const

function getFileQueue(unit?: string) {
  return unit && unit in fileQueueContexts ? unit as keyof typeof fileQueueContexts : "Head Office"
}

export default async function AdminOfficeFileStatusPage({ params, searchParams }: { params: { status: string }; searchParams: { unit?: string } }) {
  const status = fileStatuses[params.status as keyof typeof fileStatuses]
  if (!status) notFound()
  const unit = getFileQueue(searchParams.unit)

  const supabase = await createClient()
  const orgId = await getAccountingOrgId()
  const { data, error } = await supabase
    .from("admin_office_files")
    .select("id, title, description, status, created_at")
    .eq("org_id", orgId)
    .eq("office_unit", unit)
    .eq("status", status)
    .order("created_at", { ascending: false })

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full space-y-6">
        <div>
          <Link href={`/admin/office/admin-office/files?unit=${encodeURIComponent(unit)}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700">
            <ArrowLeft className="h-4 w-4" />
            Back to Files
          </Link>
          <h1 className="mt-5 text-3xl font-extrabold text-slate-900">{status} Files</h1>
          <p className="mt-2 text-slate-500">{status === "New" ? `Review incoming ${unit.toLowerCase()} files and approve, reject, or send them back.` : `${unit} files that have been ${status.toLowerCase()}.`}</p>
        </div>
        {error ? (
          <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">File storage is not ready. Apply migrations 055 and 056 in Supabase.</div>
        ) : (
          <AdminOfficeFilesManager files={(data || []) as AdminOfficeFile[]} allowReview={status === "New"} />
        )}
      </div>
    </main>
  )
}
