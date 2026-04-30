import { getCompetitionEntries } from "@/app/actions/competitions";
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Trophy, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ScanEntryModal } from "@/components/admin/competitions/ScanEntryModal";
import { DeleteEntryButton } from "@/components/admin/competitions/DeleteEntryButton";
import { PrintButton } from "@/components/admin/competitions/PrintButton";

export const dynamic = "force-dynamic";

export default async function CompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  // Get competition details
  const { data: competition, error: compError } = await supabase
    .from("competitions")
    .select("*")
    .eq("id", id)
    .single();

  if (compError || !competition) {
    redirect("/admin/competitions");
  }

  const { entries, error } = await getCompetitionEntries(id);

  return (
    <div className="min-h-screen bg-[#F4F7FA] font-sans selection:bg-indigo-500/30 relative overflow-x-hidden p-6 md:p-10">
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-indigo-200/40 via-violet-100/20 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none -z-10 translate-x-1/3 -translate-y-1/4"></div>
      
      <div className="max-w-6xl mx-auto w-full space-y-8 relative z-10">
        
        {/* Header - Hidden when printing */}
        <div className="print:hidden flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)]">
          <div className="flex items-start gap-4">
            <Link href="/admin/competitions">
              <button className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-sm">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{competition.name}</h1>
              </div>
              <p className="text-slate-500 mt-1 font-medium">{competition.description}</p>
              <div className="mt-3 flex items-center gap-4 text-sm font-bold text-slate-500">
                <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                  Total Entries: <span className="text-indigo-600">{entries?.length || 0}</span>
                </span>
                <span>Created: {new Date(competition.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <PrintButton />
            <ScanEntryModal competitionId={id} />
          </div>
        </div>

        {/* Print-only Header */}
        <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
          <h1 className="text-3xl font-bold text-black">{competition.name}</h1>
          <p className="text-gray-600 mt-1">{competition.description}</p>
          <div className="mt-4 text-sm font-medium flex justify-between">
            <span>Total Participants: {entries?.length || 0}</span>
            <span>Printed: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {error && (
          <div className="print:hidden p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 flex items-center gap-3 shadow-sm">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden print:border-none print:shadow-none print:rounded-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 print:bg-gray-100">
                  <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase whitespace-nowrap">S/N</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase whitespace-nowrap">Full Name</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase whitespace-nowrap">Res. Number</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase whitespace-nowrap">Date Entered</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase whitespace-nowrap print:hidden text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(!entries || entries.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium print:text-black">
                      No participants have been entered yet.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry: any, index: number) => (
                    <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors print:hover:bg-transparent">
                      <td className="px-6 py-4 text-sm font-medium text-slate-500 whitespace-nowrap print:text-black">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800 whitespace-nowrap print:text-black">
                        {entry.profile?.full_name || "Unknown User"}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-600 whitespace-nowrap print:text-black">
                        {entry.profile?.reservation_number || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium whitespace-nowrap print:text-black">
                        {new Date(entry.entered_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap print:hidden">
                        <DeleteEntryButton entryId={entry.id} competitionId={id} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
