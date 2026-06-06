import Link from "next/link";
import { format, parseISO } from "date-fns";
import { CalendarDays, Megaphone, Pin } from "lucide-react";
import { getAnnouncements } from "@/app/actions/announcements";
import { getAnnouncementPreview } from "@/components/dashboard/announcement-body";

export default async function DashboardAnnouncementsPage() {
  const { announcements } = await getAnnouncements();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Announcements</h1>
        <p className="text-slate-500 mt-2 font-medium">Latest updates and notes from the admin team.</p>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-slate-200 border border-slate-300 rounded-lg p-12 text-center shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]">
          <Megaphone className="h-12 w-12 mx-auto text-slate-400" />
          <h2 className="mt-4 text-lg font-extrabold text-slate-800">No announcements right now</h2>
          <p className="text-sm text-slate-500 mt-1">New updates will appear here when they are posted.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {announcements.map((announcement) => {
            const isPinned = announcement.is_pinned;
            return (
              <Link
                key={announcement.id}
                href={`/dashboard/announcements/${announcement.id}`}
                className={`group block rounded-2xl border p-5 shadow-[0_8px_30px_-16px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-18px_rgba(0,0,0,0.32)] ${
                  isPinned
                    ? "border-violet-500 bg-violet-700 text-white"
                    : "border-indigo-900 bg-indigo-950 text-white"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {isPinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-black text-violet-50">
                          <Pin className="h-3 w-3" />
                          Pinned
                        </span>
                      )}
                    </div>
                    <h2 className="line-clamp-2 text-lg font-black leading-6 text-white">
                      {announcement.title}
                    </h2>
                  </div>
                  <Megaphone className={`h-5 w-5 shrink-0 ${isPinned ? "text-violet-100" : "text-indigo-200"}`} />
                </div>

                <p className={`mt-4 line-clamp-3 text-sm font-medium leading-6 ${isPinned ? "text-violet-50" : "text-indigo-100"}`}>
                  {getAnnouncementPreview(announcement.body)}
                </p>

                <div className={`mt-5 flex items-center justify-between gap-3 border-t pt-4 text-xs font-bold ${
                  isPinned ? "border-violet-400/50 text-violet-50" : "border-indigo-800 text-indigo-200"
                }`}>
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {format(parseISO(announcement.created_at), "MMM d, yyyy")}
                  </span>
                  <span className="font-black group-hover:underline">View details</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
