import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function AdminBudgetFrame({
  title,
  description,
  backHref = "/admin/office/admin-office/desk",
  backLabel = "Back to Desk",
  children,
}: {
  title: string
  description: string
  backHref?: string
  backLabel?: string
  children: React.ReactNode
}) {
  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-[1500px]">
        <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <header className="mt-6 border-b border-slate-200 pb-7">
          <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">Head Office</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-950 sm:text-4xl">{title}</h1>
          <p className="mt-2 text-base text-slate-500 sm:text-lg">{description}</p>
        </header>
        <div className="mt-7">{children}</div>
      </div>
    </main>
  )
}
