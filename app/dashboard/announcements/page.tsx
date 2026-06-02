import { format, parseISO } from "date-fns";
import { Megaphone, Pin } from "lucide-react";
import { getAnnouncements } from "@/app/actions/announcements";

export default async function DashboardAnnouncementsPage() {
  const { announcements } = await getAnnouncements();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Announcements</h1>
        <p className="text-slate-500 mt-2 font-medium">Latest updates and notes from the admin team.</p>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-3xl border border-white/60 rounded-lg p-12 text-center shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]">
          <Megaphone className="h-12 w-12 mx-auto text-slate-300" />
          <h2 className="mt-4 text-lg font-extrabold text-slate-800">No announcements right now</h2>
          <p className="text-sm text-slate-500 mt-1">New updates will appear here when they are posted.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              className="bg-white/85 backdrop-blur-3xl border border-white/70 rounded-lg p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-900">{announcement.title}</h2>
                    {announcement.is_pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                        <Pin className="h-3 w-3" />
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    {format(parseISO(announcement.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
              <p className="mt-5 whitespace-pre-wrap text-[15px] leading-7 text-slate-600">{announcement.body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
