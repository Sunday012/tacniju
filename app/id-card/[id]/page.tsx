import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import Image from "next/image"
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
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-12 sm:p-8 print:block print:bg-white print:p-0">
            <div className="w-full max-w-sm mx-auto space-y-8 print:space-y-0 print:max-w-none print:w-full">
                
                {/* Front Side */}
                <Card className="w-full bg-white border-2 border-indigo-900 shadow-2xl overflow-hidden print:shadow-none print:border-2 print:rounded-none print:mb-0 print:break-after-page relative aspect-[1/1.58] sm:aspect-auto">
                    <div className="bg-indigo-900 text-white p-6 text-center print:bg-indigo-900 print:text-white" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
                        <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center mb-3 p-2">
                            <Image 
                                src="https://res.cloudinary.com/dzckvrvu9/image/upload/v1777993333/WhatsApp_Image_2026-05-01_at_08.37.56-removebg-preview_a8w3wt.png" 
                                alt="TACN Logo" 
                                width={120} 
                                height={45} 
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <h1 className="text-xl font-bold uppercase tracking-wider">The Apostolic Church</h1>
                        <p className="text-[10px] opacity-80 uppercase tracking-widest mt-1">Iju Station Area • Youth Movement</p>
                    </div>

                    <CardContent className="p-8 text-center flex flex-col items-center justify-between min-h-[300px]">
                        <div className="flex justify-center mb-6">
                            <Avatar className="w-32 h-32 border-4 border-indigo-100 shadow-lg print:border-indigo-100">
                                <AvatarImage src={member.avatar_url || undefined} className="object-cover" />
                                <AvatarFallback className="text-4xl font-bold bg-indigo-50 text-indigo-900 print:bg-indigo-50 print:text-indigo-900">
                                    {getInitials(member.full_name)}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900 leading-tight print:text-black">{member.full_name}</h2>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200 print:bg-indigo-50 print:text-indigo-700">
                                    {member.rank || "Member"}
                                </Badge>
                                {member.department && (
                                    <Badge variant="outline" className="text-gray-500 print:text-gray-700">
                                        {member.department}
                                    </Badge>
                                )}
                            </div>
                            {member.assembly && <p className="text-sm font-medium text-gray-500 pt-1 print:text-gray-700">{member.assembly} Assembly</p>}
                        </div>

                        <div className="w-full pt-8 mt-4 border-t border-gray-100 text-center print:border-gray-200">
                            <p className="text-xs text-gray-400 font-mono print:text-gray-600">
                                RES NO: {member.reservation_number || member.id.slice(0, 8)}
                            </p>
                            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-2 print:text-indigo-700">MEMBER IDENTITY CARD</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Back Side */}
                <Card className="w-full bg-white border-2 border-indigo-900 shadow-2xl overflow-hidden print:shadow-none print:border-2 print:rounded-none print:break-before-page relative aspect-[1/1.58] sm:aspect-auto">
                    <CardContent className="p-8 h-full flex flex-col items-center justify-center text-center space-y-8 min-h-[500px]">
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-indigo-900 uppercase tracking-wider">Attendance & Access</h3>
                            <div className="w-12 h-1 bg-indigo-600 mx-auto rounded-full"></div>
                        </div>

                        <div className="p-6 bg-white border-2 border-dashed border-indigo-200 rounded-2xl shadow-inner print:border-indigo-400">
                            <QRCodeSVG
                                value={member.id}
                                size={180}
                                level="H"
                                includeMargin={true}
                            />
                        </div>

                        <div className="space-y-4 max-w-[280px]">
                            <p className="text-xs text-gray-500 leading-relaxed print:text-gray-700">
                                This card remains the property of <span className="font-bold">The Apostolic Church Iju Station Area Youth Movement</span>. 
                                Scan this code to record your attendance at all services and events.
                            </p>
                            
                            <div className="pt-4 space-y-1">
                                <p className="text-[10px] text-gray-400 font-mono print:text-gray-500">ID: {member.id}</p>
                                <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest print:text-indigo-700">Valid for 2024/2025 Session</p>
                            </div>
                        </div>

                        <div className="w-full pt-6 border-t border-gray-100 print:border-gray-200 mt-auto">
                            <p className="text-[10px] text-gray-400 italic">"Be thou an example of the believers..." - 1 Tim 4:12</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-center w-full print:hidden pb-12">
                    <PrintButton />
                </div>
            </div>
        </div>
    )
}

