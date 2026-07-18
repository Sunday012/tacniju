import { VoucherDesigner } from "@/components/accounting/voucher-designer"
import { getCreationTemplates } from "@/app/accounting/voucher-designer/actions"

export const dynamic = "force-dynamic"

export default async function AdminNewCreationPage() {
  const { templates, error } = await getCreationTemplates("admin")

  return (
    <main className="mx-auto w-full max-w-[1600px] flex-1 p-5 sm:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">New Creation</h1>
        <p className="mt-2 font-medium text-slate-500">Create reusable page and voucher templates for admin and accounting work.</p>
      </div>
      {error && <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">Run `scripts/046_create_custom_creation_templates.sql` in Supabase.</div>}
      <VoucherDesigner templates={templates} defaultScope="admin" />
    </main>
  )
}
