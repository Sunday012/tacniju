import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 print:bg-white print:p-0">
            <Card className="w-full max-w-sm bg-white border-2 border-indigo-900 shadow-2xl overflow-hidden print:shadow-none print:border-2">
                {/* Header / Banner */}
                <div className="bg-indigo-900 text-white p-6 text-center print:bg-indigo-900 print:text-white print-color-adjust-exact">
                    <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-3">
                        <span className="text-3xl">✝</span>
                    </div>
                    <h1 className="text-xl font-bold uppercase tracking-wider">The Apostolic Church</h1>
                    <p className="text-xs opacity-80 uppercase tracking-widest mt-1">Iju Station Area • Youth Movement</p>
                </div>

                <CardContent className="flex flex-col items-center p-8 space-y-6">
                    {/* Photo */}
                    <Avatar className="w-32 h-32 border-4 border-indigo-100 shadow-lg">
                        <AvatarImage src={member.profile_picture_url || undefined} className="object-cover" />
                        <AvatarFallback className="text-4xl font-bold bg-indigo-50 text-indigo-900">
                            {getInitials(member.full_name)}
                        </AvatarFallback>
                    </Avatar>

                    {/* Details */}
                    <div className="text-center space-y-1">
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight">{member.full_name}</h2>
                        <div className="flex items-center justify-center gap-2">
                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200">
                                {member.rank || "Member"}
                            </Badge>
                            {member.department && (
                                <Badge variant="outline" className="text-gray-500">
                                    {member.department}
                                </Badge>
                            )}
                        </div>
                        {member.assembly && <p className="text-sm text-gray-500 pt-1">{member.assembly} Assembly</p>}
                    </div>

                    {/* QR Code */}
                    <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-xl">
                        <QRCodeSVG
                            value={member.id} // The QR code contains ONLY the User ID
                            size={160}
                            level="H" // High error correction
                            includeMargin={true}
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Scan to mark attendance</p>

                    {/* Footer / ID */}
                    <div className="w-full pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400 font-mono">ID: {member.id.slice(0, 8)}</p>
                    </div>

                </CardContent>
            </Card>

            <div className="fixed bottom-8 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-full shadow-lg hover:bg-indigo-700 transition font-medium flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Print ID Card
                </button>
            </div>
        </div>
    )
}
