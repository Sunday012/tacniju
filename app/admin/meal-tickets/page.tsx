import { getAdminMealTickets } from "@/app/actions/meal-tickets";
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Ticket, AlertCircle, Printer, CheckCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { PrintButton } from "@/components/admin/competitions/PrintButton";
import { DeleteTicketButton } from "@/components/admin/meal-tickets/DeleteTicketButton";
import { GenerateTicketModal } from "@/components/admin/meal-tickets/GenerateTicketModal";


export const dynamic = "force-dynamic";

export default async function MealTicketsAdminPage() {
  const { tickets, error } = await getAdminMealTickets();

  return (
    <div className="p-6 md:p-10 relative">
      <div className="max-w-6xl mx-auto w-full space-y-8 relative z-10">

        {/* Header - Hidden when printing */}
        <div className="print:hidden flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Meal Tickets</h1>
              <p className="text-slate-500 mt-1 font-medium">View all generated meal tickets for attendees.</p>
              <div className="mt-3 flex items-center gap-4 text-sm font-bold text-slate-500">
                <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                  Total Issued: <span className="text-indigo-600">{tickets?.length || 0}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <PrintButton />
            <GenerateTicketModal />
          </div>

        </div>

        {/* Print-only Header */}
        <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
          <h1 className="text-3xl font-bold text-black flex items-center gap-2">
            <Ticket className="w-8 h-8" /> Meal Tickets Roster
          </h1>
          <div className="mt-4 text-sm font-medium flex justify-between">
            <span>Total Issued: {tickets?.length || 0}</span>
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
                  <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase whitespace-nowrap">Ticket Code</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase whitespace-nowrap">Full Name</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase whitespace-nowrap">Amount (N)</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase whitespace-nowrap">Type</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase whitespace-nowrap">Res. Number</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase whitespace-nowrap">Phone Number</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase whitespace-nowrap">Generated On</th>
                  <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase whitespace-nowrap print:hidden text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(!tickets || tickets.length === 0) ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500 font-medium print:text-black">
                      No meal tickets have been generated yet.
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket: any, index: number) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors print:hover:bg-transparent">
                      <td className="px-6 py-4 text-sm font-medium text-slate-500 whitespace-nowrap print:text-black">{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-bold font-mono text-indigo-600 whitespace-nowrap print:text-black">
                        {ticket.ticket_code}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800 whitespace-nowrap print:text-black">
                        {ticket.profile?.full_name || "Unknown User"}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-[#002d72] whitespace-nowrap print:text-black">
                        {ticket.amount?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 text-xs font-black whitespace-nowrap print:text-black">
                        <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-600 uppercase">{ticket.transaction_type || 'MEAL'}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-600 whitespace-nowrap print:text-black">
                        {ticket.profile?.reservation_number || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap print:text-black">
                        {ticket.profile?.phone_number || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium whitespace-nowrap print:text-black">
                        {new Date(ticket.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap print:hidden">
                        <DeleteTicketButton ticketId={ticket.id} />
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
