import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getAdminDream, getDreamCategories, getDreamOwners, saveDreamScenes } from "@/app/actions/dreams"
import DreamRecordEditor from "@/components/admin/dreams/DreamRecordEditor"

export const dynamic = "force-dynamic"

export default async function EditDreamPage({ params }: { params: { id: string } }) {
  const [{ dream }, { owners }, { categories }] = await Promise.all([
    getAdminDream(params.id),
    getDreamOwners(),
    getDreamCategories(true),
  ])

  if (!dream) notFound()

  async function saveAction(formData: FormData) {
    "use server"
    await saveDreamScenes(params.id, formData)
  }

  return (
    <main className="flex w-full flex-1 flex-col p-5 sm:p-8 lg:p-10">
      <Link href={`/admin/records/dreams/summary/${dream.id}`} className="mb-5 inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
        <ArrowLeft className="h-4 w-4" />
        Back to Dream
      </Link>

      <DreamRecordEditor dream={dream} owners={owners} categories={categories} action={saveAction} />
    </main>
  )
}
