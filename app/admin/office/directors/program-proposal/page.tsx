import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"
import { ProgramProposalManager } from "./program-proposal-manager"

const directors = new Set(["Music", "Welfare", "Ushering"])

export default function DirectorProgramProposalPage({ searchParams }: { searchParams: { director?: string } }) {
  const director = directors.has(searchParams.director || "") ? searchParams.director! : "Music"
  return <main className="flex-1 p-5 sm:p-8 lg:p-10"><div className="mx-auto max-w-4xl"><Link href={`/admin/office/directors/${director.toLowerCase()}/desk`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-700"><ArrowLeft className="h-4 w-4" />Back to {director} Desk</Link><div className="mb-7 mt-6 flex items-center gap-3 border-b border-slate-200 pb-6"><span className="flex h-11 w-11 items-center justify-center border border-indigo-100 bg-indigo-50 text-indigo-700"><FileText className="h-5 w-5" /></span><div><p className="text-xs font-black uppercase tracking-widest text-indigo-600">{director} Director</p><h1 className="mt-1 text-3xl font-extrabold text-slate-900">Program Proposal</h1><p className="mt-1 text-slate-500">Create a memo for the Secretariat to review.</p></div></div><ProgramProposalManager director={director} /></div></main>
}
