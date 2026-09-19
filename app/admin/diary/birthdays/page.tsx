import { createClient } from "@/lib/server";
import { isGuestProfile } from "@/lib/profile-kind";

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default async function DiaryBirthdaysPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, date_of_birth, district, assembly, rank, email")
    .not("date_of_birth", "is", null)
    .limit(10000);

  const birthdays = (profiles || [])
    .filter((profile) => !isGuestProfile(profile) && profile.date_of_birth)
    .map((profile) => ({ ...profile, date: new Date(`${profile.date_of_birth}T00:00:00`) }))
    .sort((a, b) => a.date.getMonth() - b.date.getMonth() || a.date.getDate() - b.date.getDate());

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold text-slate-900">Birthdays</h1>
        <p className="mt-2 text-slate-500">Birthday diary generated automatically from member profiles.</p>
        <div className="mt-7 overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Member</th><th className="px-5 py-3">District</th><th className="px-5 py-3">Assembly</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {birthdays.map((birthday) => (
                  <tr key={birthday.id}>
                    <td className="px-5 py-4 font-semibold text-indigo-700">{monthNames[birthday.date.getMonth()]} {birthday.date.getDate()}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{birthday.full_name}</td>
                    <td className="px-5 py-4 text-slate-600">{birthday.district || "-"}</td>
                    <td className="px-5 py-4 text-slate-600">{birthday.assembly || "-"}</td>
                  </tr>
                ))}
                {!birthdays.length && <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400">No birthdays have been added to member profiles yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
