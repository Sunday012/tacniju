import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PrintButton } from "@/components/print-button"

export default async function IDCardPage({ params }: { params: { id: string } }) {
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
                    <p className="text-gray-500">The requested ID card could not be generated.</p>
                </div>
            </div>
        )
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 py-8 sm:p-8 print:block print:bg-white print:min-h-0 print:p-0">
            <div className="w-full max-w-sm mx-auto print:max-w-md">
                <Card className="w-full bg-white border-2 border-indigo-900 shadow-2xl overflow-hidden print:shadow-none print:border-2 mb-8 print:mb-0 print:break-inside-avoid">
                    {/* Header / Banner */}
                    <div className="bg-indigo-900 text-white p-6 text-center print:bg-indigo-900 print:text-white" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
                        <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-3">
                            <span className="text-3xl text-indigo-900">✝</span>
                        </div>
                        <h1 className="text-xl font-bold uppercase tracking-wider">The Apostolic Church</h1>
                        <p className="text-xs opacity-80 uppercase tracking-widest mt-1">Iju Station Area • Youth Movement</p>
                    </div>

                    <CardContent className="p-8 pb-10 text-center">
                        {/* Photo */}
                        <div className="flex justify-center mb-6">
                            <Avatar className="w-32 h-32 border-4 border-indigo-100 shadow-lg print:border-gray-300">
                                <AvatarImage src={member.avatar_url || undefined} className="object-cover" />
                                <AvatarFallback className="text-4xl font-bold bg-indigo-50 text-indigo-900 print:bg-gray-100 print:text-black">
                                    {getInitials(member.full_name)}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Details */}
                        <div className="mb-6 space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900 leading-tight print:text-black">{member.full_name}</h2>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 print:border print:border-gray-400 print:bg-transparent print:text-black">
                                    {member.rank || "Member"}
                                </Badge>
                                {member.department && (
                                    <Badge variant="outline" className="text-gray-500 print:border-gray-400 print:text-black">
                                        {member.department}
                                    </Badge>
                                )}
                            </div>
                            {member.assembly && <p className="text-sm font-medium text-gray-500 pt-1 print:text-gray-700">{member.assembly} Assembly</p>}
                        </div>

                        {/* QR Code */}
                        <div className="flex flex-col flex-wrap items-center justify-center mb-4">
                            <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-xl inline-block print:border-black">
                                <QRCodeSVG
                                    value={member.id} // The QR code contains ONLY the User ID
                                    size={140}
                                    level="H" // High error correction
                                    includeMargin={true}
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-3 print:text-black">Scan to mark attendance</p>
                        </div>

                        {/* Footer / ID */}
                        <div className="w-full pt-4 border-t border-gray-100 text-center print:border-gray-300 print:-mb-2">
                            <p className="text-xs text-gray-400 font-mono print:text-black">ID: {member.id.slice(0, 8)}</p>
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
