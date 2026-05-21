import { getAdminMealTickets } from "@/app/actions/meal-tickets";
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { PrintButton } from "@/components/print-button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminPrintMealTicketPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { tickets } = await getAdminMealTickets();
    const ticket = tickets?.find((t: any) => t.id === params.id);

    if (!ticket) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800">Ticket Not Found</h2>
                    <Link href="/admin/meal-tickets">
                        <button className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">
                            Return to Tickets
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    const formattedDate = new Date(ticket.created_at).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).replace(',', '');

    const transactionDate = new Date(ticket.created_at).toISOString().slice(0, 19).replace('T', ' ');
    const member = ticket.profile;

    return (
        <div className="min-h-screen bg-slate-100/50 flex flex-col items-center p-4 py-12 sm:p-8 print:bg-white print:p-0 print:block">
            {/* Top Controls - Hidden when printing */}
            <div className="w-full max-w-[800px] flex items-center justify-between mb-6 print:hidden">
                <Link href="/admin/meal-tickets">
                    <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Meal Tickets
                    </button>
                </Link>
                <PrintButton />
            </div>

            {/* MAIN RECEIPT FRONT */}
            <div className="w-full max-w-[800px] bg-white shadow-2xl rounded-sm overflow-hidden print:shadow-none print:w-full">
                <div className="p-8 sm:p-12">
                    {/* Header: Logo and "Transaction Receipt" */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                        <div className="flex items-center gap-4">
                            <Image 
                                src="https://res.cloudinary.com/dzckvrvu9/image/upload/v1777993333/WhatsApp_Image_2026-05-01_at_08.37.56-removebg-preview_a8w3wt.png" 
                                alt="TACN Logo" 
                                width={160} 
                                height={60} 
                                className="h-12 w-auto object-contain"
                            />
                        </div>
                        <div className="relative text-right sm:text-right w-full sm:w-auto">
                            <div className="absolute top-0 right-0 w-24 h-1 bg-[#002d72] -translate-y-8 translate-x-4 rotate-[45deg] print:hidden"></div>
                            <h1 className="text-3xl font-bold text-[#002d72] tracking-tight">Transaction Receipt</h1>
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <p className="text-slate-400 text-xs font-medium">Generated from TACNIJU on {formattedDate}</p>
                    </div>

                    {/* Data Table */}
                    <div className="divide-y divide-slate-100">
                        <div className="grid grid-cols-3 py-5 gap-4">
                            <div className="text-[#002d72] font-bold text-sm uppercase tracking-wide">Transaction Amount</div>
                            <div className="col-span-2 text-[#002d72] font-black text-lg">N{ticket.amount?.toLocaleString() || '7,000'}</div>
                        </div>

                        <div className="grid grid-cols-3 py-5 gap-4">
                            <div className="text-[#002d72] font-bold text-sm uppercase tracking-wide">Transaction Type</div>
                            <div className="col-span-2 text-[#002d72] font-bold text-sm uppercase">{ticket.transaction_type || 'INTER-BANK'}</div>
                        </div>

                        <div className="grid grid-cols-3 py-5 gap-4">
                            <div className="text-[#002d72] font-bold text-sm uppercase tracking-wide">Transaction Date</div>
                            <div className="col-span-2 text-[#002d72] font-bold text-sm">{transactionDate}</div>
                        </div>

                        <div className="grid grid-cols-3 py-5 gap-4">
                            <div className="text-[#002d72] font-bold text-sm uppercase tracking-wide">Sender</div>
                            <div className="col-span-2 text-[#002d72] font-bold text-sm uppercase">THE APOSTOLIC CHURCH NIGERIA</div>
                        </div>

                        <div className="grid grid-cols-3 py-5 gap-4">
                            <div className="text-[#002d72] font-bold text-sm uppercase tracking-wide">Beneficiary</div>
                            <div className="col-span-2 space-y-2">
                                <div className="text-[#002d72] font-bold text-sm uppercase">{ticket.beneficiary_name || member?.full_name}</div>
                                <div className="text-[#002d72] font-bold text-sm">{member?.reservation_number || member?.phone_number}</div>
                                <div className="text-[#002d72] font-bold text-sm uppercase tracking-wider">IJU AREA YOUTH MOVEMENT</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 py-5 gap-4">
                            <div className="text-[#002d72] font-bold text-sm uppercase tracking-wide">Remark</div>
                            <div className="col-span-2 text-slate-600 font-medium text-sm">{ticket.remark || 'N/A'}</div>
                        </div>

                        <div className="grid grid-cols-3 py-5 gap-4">
                            <div className="text-[#002d72] font-bold text-sm uppercase tracking-wide">Transaction Reference</div>
                            <div className="col-span-2 text-slate-800 font-bold text-sm font-mono tracking-wider">{ticket.ticket_code}</div>
                        </div>

                        <div className="grid grid-cols-3 py-5 gap-4">
                            <div className="text-[#002d72] font-bold text-sm uppercase tracking-wide">Session Id</div>
                            <div className="col-span-2 text-slate-800 font-bold text-sm font-mono break-all">{ticket.ticket_code.repeat(3)}</div>
                        </div>

                        <div className="grid grid-cols-3 py-5 gap-4">
                            <div className="text-[#002d72] font-bold text-sm uppercase tracking-wide">Transaction Status</div>
                            <div className="col-span-2 text-emerald-600 font-black text-sm uppercase tracking-wider flex items-center gap-2">
                                Transfer Request Successful
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Warning */}
                    <div className="mt-12 pt-8 border-t border-slate-100">
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                            If you have any questions or would like more information, please call our 24-hour Contact Centre on 0700CallTACN, 0700 3000000, +234 201-2712005-7, +234 201-2802500 or send an email to contactcenter@tacnijustation.com.ng <br/>
                            Thank you for choosing The Apostolic Church.
                        </p>
                    </div>

                    <div className="mt-10 flex flex-wrap justify-between gap-4 pt-4 border-t border-slate-50 text-slate-400 font-medium text-[11px]">
                        <div>TACN: Branch | ATM | Online | Mobile | Contact centre</div>
                        <div className="text-right">Page 1 of 1</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
