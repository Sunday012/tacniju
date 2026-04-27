import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { PrintButton } from "@/components/print-button"

export default async function ReservationPrintPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    // Fetch member details
    const { data: member, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", params.id)
        .maybeSingle()

    if (error || !member) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500">Member Not Found</h1>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 py-8 print:bg-white print:min-h-0 print:p-0">
            <div className="w-full max-w-md mx-auto">
                <Card className="w-full bg-white border-4 border-[#1c1c1a] shadow-[12px_12px_0_rgba(0,0,0,1)] overflow-hidden print:shadow-none print:border-2 mb-8 print:mb-0 print:break-inside-avoid rounded-none">
                    <div className="bg-[#004e89] text-white p-6 text-center border-b-4 border-[#1c1c1a] print:bg-white print:text-black print:border-black" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
                        <h1 className="text-3xl font-anton uppercase tracking-wider">RESERVATION SLIP</h1>
                        <p className="font-serif font-bold text-sm uppercase tracking-widest mt-2">The Apostolic Church Nigeria</p>
                        <p className="font-serif text-xs uppercase mt-1">Iju Station Area • Youth Movement</p>
                    </div>

                    <CardContent className="p-10 text-center font-serif">
                        <div className="mb-8 space-y-4">
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest print:text-black">Member Name</p>
                                <h2 className="text-3xl font-bold text-gray-900 mt-1 print:text-black">{member.full_name}</h2>
                            </div>
                            
                            <div className="pt-6 border-t-2 border-dashed border-gray-300 print:border-black">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest print:text-black">Reservation Number</p>
                                <p className="text-5xl font-anton text-[#cc2936] mt-2 tracking-widest print:text-black">
                                    {member.reservation_number || "NOT ASSIGNED"}
                                </p>
                            </div>
                        </div>

                        <div className="w-full pt-6 border-t-4 border-[#1c1c1a] text-center print:border-black">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest print:text-black">Please present this slip when required</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-center w-full print:hidden pb-4">
                    <PrintButton />
                </div>
            </div>
        </div>
    )
}
