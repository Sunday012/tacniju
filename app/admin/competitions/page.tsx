import { getCompetitions } from "@/app/actions/competitions";
import { Plus, Trophy, Users, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AddCompetitionModal } from "@/components/admin/competitions/AddCompetitionModal";
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CompetitionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  const { competitions, error } = await getCompetitions();

  return (
    <div className="min-h-screen bg-[#F4F7FA] font-sans selection:bg-indigo-500/30 relative overflow-x-hidden p-6 md:p-10">
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-indigo-200/40 via-violet-100/20 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none -z-10 translate-x-1/3 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-100/40 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none -z-10 -translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-6xl mx-auto w-full space-y-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <button className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-sm">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Competitions & Programs</h1>
              <p className="text-slate-500 mt-1 font-medium">Manage special programs and scan people to enter them.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AddCompetitionModal />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 flex items-center gap-3 shadow-sm">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!error && competitions && competitions.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed border-slate-300 rounded-[2rem] bg-white/50 backdrop-blur-sm">
              <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No Competitions Found</h3>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">
                You haven't created any competitions yet. Click "Create Competition" to get started.
              </p>
            </div>
          )}

          {competitions?.map((comp: any) => (
            <Link key={comp.id} href={`/admin/competitions/${comp.id}`}>
              <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 flex flex-col hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.04)] transition-all cursor-pointer h-full">
                
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 shadow-sm shrink-0">
                    <Trophy className="h-6 w-6 text-amber-500" />
                  </div>
                  <div className="pt-1">
                    <h3 className="text-lg font-extrabold text-slate-800 line-clamp-1" title={comp.name}>
                      {comp.name}
                    </h3>
                    <span className="text-[11px] font-medium text-slate-400 inline-block mt-1">
                      {new Date(comp.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-6 flex-1">
                  {comp.description || "No description provided."}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-indigo-600 font-bold text-sm">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Manage Entries
                  </span>
                  <span className="bg-indigo-50 px-2 py-1 rounded-md text-xs">View &rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
