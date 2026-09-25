import { getAllAssetAssignments } from "@/app/actions/assets";
import { Gift } from "lucide-react";
import { RevokeGiftButton } from "@/components/admin/stock/RevokeGiftButton";
import { PrintButton } from "@/components/ui/print-button";

export const dynamic = "force-dynamic";

export default async function GiftRecordsPage() {
  const { assignments: allAssignments } = await getAllAssetAssignments();
  
  return (
    <div className="p-6 md:p-10 relative">
      <div className="relative z-10 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gift Distributed Records</h1>
              <p className="text-slate-500 mt-1 font-medium">View and print all distributed gifts to attendees.</p>
            </div>
          </div>
          <PrintButton />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 font-bold text-slate-700 text-xs tracking-wider uppercase">Date</th>
                  <th className="px-4 py-3 font-bold text-slate-700 text-xs tracking-wider uppercase">Gift</th>
                  <th className="px-4 py-3 font-bold text-slate-700 text-xs tracking-wider uppercase">Gift No.</th>
                  <th className="px-4 py-3 font-bold text-slate-700 text-xs tracking-wider uppercase">Recipient</th>
                  <th className="px-4 py-3 font-bold text-slate-700 text-xs tracking-wider uppercase">Distributed By</th>
                  <th className="px-4 py-3 font-bold text-slate-700 text-xs tracking-wider uppercase text-right print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(!allAssignments || allAssignments.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-medium text-sm">
                      No gifts have been distributed yet.
                    </td>
                  </tr>
                ) : (
                  allAssignments.map((assignment: any) => (
                    <tr key={assignment.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs font-medium text-slate-500">
                        {new Date(assignment.assigned_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-slate-800">{assignment.asset?.name}</p>
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          {assignment.asset?.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-indigo-600">{assignment.asset?.gift_number || "-"}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-indigo-600">{assignment.profile?.full_name}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{assignment.profile?.reservation_number || "No Res. #"}</p>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-600">
                        {assignment.assigned_by_profile?.full_name || "Unknown Admin"}
                      </td>
                      <td className="px-4 py-3 text-right print:hidden">
                        <RevokeGiftButton assignmentId={assignment.id} />
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
