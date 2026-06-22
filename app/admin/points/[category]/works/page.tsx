import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarCheck, ClipboardList } from "lucide-react"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/server"
import { AttendanceEventMembersSheet } from "@/components/admin/points/AttendanceEventMembersSheet"
import { CreatePointWorkSheet } from "@/components/admin/points/CreatePointWorkSheet"
import { DeletePointWorkButton } from "@/components/admin/points/DeletePointWorkButton"
import { EditPointWorkSheet } from "@/components/admin/points/EditPointWorkSheet"
import { PointWorkMembersSheet } from "@/components/admin/points/PointWorkMembersSheet"
import { getPointCategory } from "@/lib/point-categories"

export const dynamic = "force-dynamic"

export default async function PointWorksPage({ params }: { params: { category: string } }) {
  const category = getPointCategory(params.category)
  if (!category) notFound()

  const supabase = await createClient()
  if (category.slug === "attendance") {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const adminSupabase = serviceRoleKey
      ? createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
      : supabase

    const { data: events, error } = await adminSupabase
      .from("events")
      .select("id, name, description, event_date, created_at")
      .order("event_date", { ascending: false })

    const eventRows = (events || []) as any[]
    const eventIds = eventRows.map(event => event.id)
    const { data: attendanceRecords } = eventIds.length > 0
      ? await adminSupabase
        .from("member_attendance")
        .select("id, event_id, user_id, created_at")
        .in("event_id", eventIds)
      : { data: [] as any[] }

    const userIds = Array.from(new Set(((attendanceRecords || []) as any[]).map(record => record.user_id).filter(Boolean)))
    const { data: profiles } = userIds.length > 0
      ? await adminSupabase
        .from("profiles")
        .select("id, full_name, reservation_number, points")
        .in("id", userIds)
      : { data: [] as any[] }

    const profilesById = new Map(((profiles || []) as any[]).map(profile => [profile.id, profile]))
    const membersByEvent = new Map<string, any[]>()
    ;((attendanceRecords || []) as any[]).forEach(record => {
      const profile = profilesById.get(record.user_id)
      membersByEvent.set(record.event_id, [
        ...(membersByEvent.get(record.event_id) || []),
        {
          id: record.id,
          full_name: profile?.full_name || "Unknown User",
          reservation_number: profile?.reservation_number || null,
          points: profile?.points || 0,
          marked_at: record.created_at,
        },
      ])
    })

    return (
      <div className="p-6 md:p-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Link
                href={`/admin/points/${category.slug}`}
                className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-amber-200 bg-white px-4 text-sm font-black text-amber-700 shadow-sm hover:bg-amber-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to {category.name}
              </Link>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Attendance Events</h1>
            </div>
            <Link
              href="/admin/events"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              Manage Events
            </Link>
          </div>

          <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 p-6">
              <CalendarCheck className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-extrabold text-slate-800">List of Events</h2>
            </div>
            {error ? (
              <div className="p-6 text-sm font-bold text-rose-600">
                Could not load attendance events. Check the events and member_attendance tables in Supabase.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                      <th className="px-6 py-4">Event</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Attendance</th>
                      <th className="px-6 py-4 text-right">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {eventRows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center font-medium text-slate-500">
                          No events have been created yet.
                        </td>
                      </tr>
                    ) : eventRows.map(event => (
                      <tr key={event.id} className="font-medium text-slate-600">
                        <td className="px-4 py-3">
                          <AttendanceEventMembersSheet
                            name={event.name}
                            eventDate={event.event_date}
                            description={event.description}
                            members={membersByEvent.get(event.id) || []}
                          />
                        </td>
                        <td className="px-6 py-4">{new Date(event.event_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right font-black">{membersByEvent.get(event.id)?.length || 0}</td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/admin/events/${event.id}`} className="text-sm font-black text-indigo-600 hover:text-indigo-700">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    )
  }

  const [{ data: works, error }, { data: records }] = await Promise.all([
    supabase
      .from("point_works")
      .select("id, title, points, mode, note, created_at")
      .eq("category", category.slug)
      .order("created_at", { ascending: false }),
    supabase
      .from("point_work_records")
      .select("id, work_id, profile:profiles!profile_id(id, full_name, reservation_number, points)")
      .eq("category", category.slug),
  ])

  const rows = (works || []) as any[]
  const membersByWork = new Map<string, any[]>()
    ;((records || []) as any[]).forEach(record => {
      if (!record.work_id || !record.profile) return
    membersByWork.set(record.work_id, [
      ...(membersByWork.get(record.work_id) || []),
      {
        record_id: record.id,
        profile_id: record.profile.id,
        full_name: record.profile.full_name,
        reservation_number: record.profile.reservation_number,
        points: record.profile.points,
      },
    ])
  })

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href={`/admin/points/${category.slug}`}
              className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-amber-200 bg-white px-4 text-sm font-black text-amber-700 shadow-sm hover:bg-amber-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {category.name}
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{category.name} Works</h1>
          </div>
          <CreatePointWorkSheet
            category={category.slug}
            categoryName={category.name}
            defaultMode={category.defaultMode}
          />
        </div>

        <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 p-6">
            <ClipboardList className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-extrabold text-slate-800">List of Works</h2>
          </div>
          {error ? (
            <div className="p-6 text-sm font-bold text-rose-600">
              Could not load works. Run `scripts/034_create_point_work_records.sql` in Supabase.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                    <th className="px-6 py-4">Work</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4 text-right">Members</th>
                    <th className="px-6 py-4 text-right">Points</th>
                    <th className="px-6 py-4 text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center font-medium text-slate-500">
                        No works have been created yet.
                      </td>
                    </tr>
                  ) : rows.map(record => (
                    <tr key={record.id} className="font-medium text-slate-600">
                      <td className="px-4 py-3">
                        <PointWorkMembersSheet
                          title={record.title}
                          mode={record.mode}
                          points={Number(record.points || 0)}
                          note={record.note}
                          members={membersByWork.get(record.id) || []}
                        />
                      </td>
                      <td className="px-6 py-4 capitalize">{record.mode}</td>
                      <td className="px-6 py-4 text-right font-black">{membersByWork.get(record.id)?.length || 0}</td>
                      <td className={record.mode === "remove" ? "px-6 py-4 text-right font-black text-rose-600" : "px-6 py-4 text-right font-black text-indigo-600"}>
                        {record.mode === "remove" ? "-" : "+"}{record.points}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <EditPointWorkSheet
                            work={{
                              id: record.id,
                              title: record.title,
                              points: Number(record.points || 0),
                              mode: record.mode,
                              note: record.note,
                            }}
                          />
                          <DeletePointWorkButton workId={record.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
