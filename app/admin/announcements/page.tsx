import { getAdminAnnouncements } from "@/app/actions/announcements";
import { AnnouncementsNotepad } from "@/components/admin/announcements-notepad";

export default async function AdminAnnouncementsPage() {
  const { announcements } = await getAdminAnnouncements();

  return (
    <main className="w-full flex-1 p-5 sm:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Announcements</h1>
        <p className="text-slate-500 mt-2 font-medium">Write quick member updates from a notepad-style board.</p>
      </div>

      <AnnouncementsNotepad initialAnnouncements={announcements || []} />
    </main>
  );
}
