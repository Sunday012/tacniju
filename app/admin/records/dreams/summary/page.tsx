import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getAdminDreams, getDreamCategories } from "@/app/actions/dreams"
import { DreamSummaryClient } from "./dream-summary-client"

export const dynamic = "force-dynamic"

export default async function DreamSummaryPage({ searchParams }: { searchParams: { sort?: string } }) {
  const sort = searchParams.sort === "month" ? "month" : "topic"
  const [{ dreams, error: dreamsError }, { categories, error: categoriesError }] = await Promise.all([
    getAdminDreams(),
    getDreamCategories(true),
  ])
  const error = dreamsError || categoriesError

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-[1600px] mx-auto w-full">
      <Link href="/admin/records/dreams" className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
        <ArrowLeft className="h-4 w-4" />
        Back to Dreams
      </Link>
      <DreamSummaryClient sort={sort} dreams={dreams} categories={categories} error={error} />
    </main>
  )
}
