import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ArrowLeft, CalendarDays, Megaphone, Pin } from "lucide-react";
import { getAnnouncement } from "@/app/actions/announcements";
import { AnnouncementBody } from "@/components/dashboard/announcement-body";

export default async function DashboardAnnouncementDetailPage({ params }: { params: { id: string } }) {
  const { announcement } = await getAnnouncement(params.id);

  if (!announcement) {
    notFound();
  }

  const isPinned = announcement.is_pinned;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/announcements" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-indigo-700">
        <ArrowLeft className="h-4 w-4" />
        Back to Announcements
      </Link>

      <article className="overflow-hidden rounded-[1.5rem] border border-slate-300 bg-slate-200 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)]">
        <div className={isPinned ? "bg-violet-700 px-6 py-5 text-white" : "bg-indigo-950 px-6 py-5 text-white"}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${isPinned ? "bg-white/15 text-violet-50" : "bg-white/10 text-indigo-100"}`}>
                  <Megaphone className="h-5 w-5" />
                </span>
                {isPinned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-black text-violet-50">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{announcement.title}</h1>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${isPinned ? "bg-white/15 text-violet-50" : "bg-white/10 text-indigo-100"}`}>
              <CalendarDays className="h-4 w-4" />
              {format(parseISO(announcement.created_at), "MMM d, yyyy 'at' h:mm a")}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="rounded-2xl border border-slate-300 bg-slate-100 p-5">
            <AnnouncementBody body={announcement.body} />
          </div>
        </div>
      </article>
    </div>
  );
}
