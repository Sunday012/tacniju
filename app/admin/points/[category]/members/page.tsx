import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, Users } from "lucide-react"
import { createClient } from "@/lib/server"
import { getPointCategory } from "@/lib/point-categories"
import { AddPointWorkMembersForm } from "@/components/admin/points/AddPointWorkMembersForm"
import { isGuestProfile } from "@/lib/profile-kind"

export const dynamic = "force-dynamic"

export default async function PointWorkMembersPage({ params }: { params: { category: string } }) {
  const category = getPointCategory(params.category)
  if (!category) notFound()
  if (category.slug === "attendance") redirect("/admin/events")

  const supabase = await createClient()
  const [{ data: works, error: worksError }, { data: profiles }] = await Promise.all([
    supabase
      .from("point_works")
      .select("id, title, points, mode")
      .eq("category", category.slug)
      .eq("active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name, reservation_number, points, member_status, email, username")
      .order("full_name", { ascending: true })
      .limit(1000),
  ])

  const members = (profiles || []).filter(profile => !isGuestProfile(profile) && profile.member_status !== "Transferred")

  return (
    <div className="p-6 md:p-10">
      <div className="w-full space-y-8">
        <div>
          <Link
            href={`/admin/points/${category.slug}`}
            className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-amber-200 bg-white px-4 text-sm font-black text-amber-700 shadow-sm hover:bg-amber-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {category.name}
          </Link>
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-amber-600" />
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Add Members</h1>
          </div>
          <p className="mt-2 font-medium text-slate-500">Select one work and add many members to it at once.</p>
        </div>

        {worksError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-700">
            Run `scripts/037_point_works_and_bulk_members.sql` in Supabase to enable point works.
          </div>
        ) : null}

        <AddPointWorkMembersForm works={(works || []) as any[]} members={members as any[]} />
      </div>
    </div>
  )
}
