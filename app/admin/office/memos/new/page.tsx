import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { OfficeMemoComposer } from "@/components/admin/office-memo-composer"

const memoTypes = ["Memo", "Meeting Note", "Invitation Letter", "Received Letter", "Transport Report", "Announcement Memo", "Program Proposal"] as const
type MemoType = typeof memoTypes[number]

function validType(value?: string): MemoType {
  return memoTypes.includes(value as MemoType) ? value as MemoType : "Memo"
}

export default function NewOfficeMemoPage({ searchParams }: { searchParams: { type?: string; from?: string; recipient?: string; chooseRecipient?: string; back?: string } }) {
  const fileType = validType(searchParams.type)
  const submittedFrom = String(searchParams.from || "Secretaries")
  const defaultRecipient = fileType === "Program Proposal"
    ? "Head Office"
    : searchParams.recipient === "Finance Officer" ? "Finance Officer" : "Secretaries"
  const backHref = searchParams.back?.startsWith("/admin/") ? searchParams.back : "/admin/office/secretariat/secretaries/desk"

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full">
        <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700"><ArrowLeft className="h-4 w-4" />Back</Link>
        <div className="mt-6 border-b border-slate-200 pb-6">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">{submittedFrom}</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{fileType}</h1>
          <p className="mt-2 text-slate-500">Create and route this document through the office file workflow.</p>
        </div>
        <section className="mt-6 flex items-center justify-between gap-4 border border-slate-200 bg-white p-5 shadow-sm">
          <div><h2 className="font-extrabold text-slate-900">New {fileType}</h2><p className="mt-1 text-sm text-slate-500">The completed document will appear as a new file for review.</p></div>
          <OfficeMemoComposer fileType={fileType} submittedFrom={submittedFrom} defaultRecipient={defaultRecipient} allowRecipientChoice={searchParams.chooseRecipient === "1"} />
        </section>
      </div>
    </main>
  )
}
