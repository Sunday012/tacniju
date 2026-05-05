import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, ArrowLeft, Ticket, Calendar, User } from "lucide-react";
import Link from "next/link";
import { PrintButton } from "@/components/print-button";

export default async function CompetitionReceiptPage({
    params
}: {
    params: Promise<{ id: string, entryId: string }>
}) {
    const { id, entryId } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    // Fetch entry details with profile and competition
    const { data: entry, error } = await supabase
        .from("competition_entries")
        .select(`
            id,
            entered_at,
            competition:competitions(*),
            profile:profiles(*)
        `)
        .eq("id", entryId)
        .single();

    if (error || !entry) {
        redirect(`/admin/competitions/${id}`);
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-12 sm:p-8 print:block print:bg-white print:p-0">
            <div className="w-full max-w-md mx-auto space-y-6 print:space-y-0">

                {/* Back Link - Hidden when printing */}
                <div className="flex items-center justify-between print:hidden">
                    <Link href={`/admin/competitions/${id}`}>
                        <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Competition
                        </button>
                    </Link>
                    <PrintButton />
                </div>

                <div className="relative">
                    {/* Premium aesthetic background */}
                    <div className="absolute inset-0 bg-indigo-500 blur-[100px] opacity-10 rounded-full -z-10"></div>

                    <Card className="w-full bg-white border-0 shadow-2xl overflow-hidden rounded-[2.5rem] print:shadow-none print:border-2 print:border-slate-200 print:rounded-none">
                        {/* Header */}
                        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-8 text-center relative overflow-hidden print:from-black print:to-black" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
                            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>

                            <div className="w-16 h-16 mx-auto bg-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-400/20 rotate-3">
                                <Trophy className="w-8 h-8 text-white -rotate-3" />
                            </div>
                            <h1 className="text-xl font-black uppercase tracking-tight">Entry Confirmation</h1>
                            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-1">TAC IJU YOUTH MOVEMENT</p>
                        </div>

                        <CardContent className="p-8 pb-10">
                            <div className="space-y-8">
                                {/* Competition Info */}
                                <div className="text-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <h2 className="text-2xl font-black text-slate-800 leading-tight">{entry.competition.name}</h2>
                                    <p className="text-xs text-slate-500 mt-2 font-medium max-w-[200px] mx-auto line-clamp-2">
                                        {entry.competition.description || "Official Competition Program"}
                                    </p>
                                </div>

                                {/* Participant Details */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Participant</p>
                                            <p className="text-lg font-black text-slate-800">{entry.profile.full_name}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Res. Number</p>
                                            <p className="text-sm font-black text-slate-800 font-mono">{entry.profile.reservation_number || "N/A"}</p>
                                        </div>
                                        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Reg. Cost</p>
                                            <p className="text-sm font-black text-indigo-600">{entry.competition.registration_points || 0} Points</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Entry Ticket Section */}
                                <div className="flex flex-col items-center justify-center pt-4">
                                    <div className="w-full h-px bg-dashed border-t-2 border-dashed border-slate-200 mb-8 relative">
                                        <div className="absolute left-0 top-0 -ml-4 -mt-2 w-4 h-4 bg-slate-50 rounded-full"></div>
                                        <div className="absolute right-0 top-0 -mr-4 -mt-2 w-4 h-4 bg-slate-50 rounded-full"></div>
                                    </div>

                                    <div className="flex items-center gap-3 text-slate-400 mb-4">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">
                                            Entered on {new Date(entry.entered_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="text-center space-y-1">
                                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Transaction ID</p>
                                        <p className="text-[11px] font-mono font-bold text-slate-800">{entry.id}</p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="pt-8 text-center">
                                    <p className="text-[9px] text-slate-400 max-w-[250px] mx-auto italic">
                                        Please present this receipt at the venue for verification.
                                        Points once deducted for competition registration are non-refundable.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <p className="text-center text-[10px] text-slate-400 print:hidden pt-4 uppercase tracking-[0.2em] font-bold">
                    Official Participant Copy
                </p>
            </div>
        </div>
    );
}
