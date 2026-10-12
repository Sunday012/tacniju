import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, FileText } from "lucide-react"

import { getAccountingOrgId } from "@/lib/accounting-org"
import { createClient } from "@/lib/server"

export const dynamic = "force-dynamic"

const statusSlugs: Record<string, string> = {
  New: "new",
  Approved: "approved",
  Rejected: "rejected",
  "Sent Back": "new",
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default async function AdminOfficeFileViewPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const orgId = await getAccountingOrgId()
  const { data: file, error } = await supabase
    .from("admin_office_files")
    .select("id, title, description, status, file_type, submitted_from, office_unit, created_at")
    .eq("id", params.id)
    .eq("org_id", orgId)
    .maybeSingle()

  if (error || !file) notFound()

  const statusSlug = statusSlugs[file.status] || "new"
  const backHref = `/admin/office/admin-office/files/${statusSlug}?unit=${encodeURIComponent(file.office_unit || "Head Office")}`

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full space-y-8">
        <div>
          <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700">
            <ArrowLeft className="h-4 w-4" />
            Back to {file.status} Files
          </Link>
          <div className="mt-6 flex items-start gap-4 border-b border-slate-200 pb-7">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center border border-slate-200 bg-white text-indigo-600">
              <FileText className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600">{file.office_unit || "Head Office"}</p>
              <h1 className="mt-2 break-words text-3xl font-extrabold text-slate-900 sm:text-4xl">{file.title}</h1>
              <p className="mt-2 text-slate-500">
                {file.file_type || "File"}{file.submitted_from ? ` from ${file.submitted_from}` : ""} · {formatDate(file.created_at)}
              </p>
            </div>
          </div>
        </div>

        <section className="border border-slate-200 bg-white">
          <div className="grid border-b border-slate-200 text-sm sm:grid-cols-3">
            <div className="border-b border-slate-200 px-5 py-4 sm:border-b-0 sm:border-r">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Status</p>
              <p className="mt-1 font-extrabold text-slate-900">{file.status}</p>
            </div>
            <div className="border-b border-slate-200 px-5 py-4 sm:border-b-0 sm:border-r">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Type</p>
              <p className="mt-1 font-extrabold text-slate-900">{file.file_type || "General"}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Submitted From</p>
              <p className="mt-1 font-extrabold text-slate-900">{file.submitted_from || "-"}</p>
            </div>
          </div>
          <article className="min-h-[320px] whitespace-pre-wrap px-5 py-6 text-base leading-8 text-slate-700">
            {file.description || "No file content recorded."}
          </article>
        </section>
      </div>
    </main>
  )
}
