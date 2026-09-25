import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { DiaryLocationsManager } from "@/components/admin/diary-locations-manager";
import { isGuestProfile } from "@/lib/profile-kind";

export default async function DiaryLocationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/admin-login");

  const [{ data: locations }, { data: assemblies }, { data: profiles }] = await Promise.all([
    supabase.from("diary_locations").select("id, name").order("name"),
    supabase.from("diary_assemblies").select("id, location_id, name").order("name"),
    supabase.from("profiles").select("id, full_name, district, assembly, rank, email").order("full_name").limit(10000),
  ]);

  const members = (profiles || []).filter((profile) => !isGuestProfile(profile));

  return (
    <main className="flex-1 p-5 sm:p-8 lg:p-10">
      <div className="w-full space-y-7">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Diary Locations</h1>
          <p className="mt-2 text-slate-500">Create districts and their assemblies. Members are placed automatically from their profile selection.</p>
        </div>
        <DiaryLocationsManager locations={locations || []} assemblies={assemblies || []} members={members} />
      </div>
    </main>
  );
}
