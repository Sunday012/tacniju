"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Html5QrcodeScanner } from "html5-qrcode"
import { markAttendance } from "@/app/actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle2, ArrowLeft, AlertCircle, RefreshCw, CalendarDays } from "lucide-react"

export default function ScannerPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading scanner...</div>}>
            <ScannerContent />
        </Suspense>
    )
}

function ScannerContent() {
    const searchParams = useSearchParams()
    const eventId = searchParams.get("eventId") || ""
    const eventName = searchParams.get("eventName") || "Attendance Scan"

    const [lastScanned, setLastScanned] = useState<string | null>(null)
    const [status, setStatus] = useState<"idle" | "success" | "error" | "processing">("idle")
    const [statusMessage, setStatusMessage] = useState("Ready to scan")
    const [scannerReady, setScannerReady] = useState(false)
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            if (scannerRef.current) return

            const scanner = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    showTorchButtonIfSupported: true
                },
        /* verbose= */ false
            )
            scannerRef.current = scanner

            scanner.render(onScanSuccess, onScanFailure)
            setScannerReady(true)
        }, 1000)

        return () => {
            clearTimeout(timer)
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error(err))
                scannerRef.current = null
            }
        }
    }, [])

    async function onScanSuccess(decodedText: string) {
        if (decodedText === lastScanned || status === "processing" || status === "success") return

        setLastScanned(decodedText)
        setStatus("processing")
        setStatusMessage("Verifying member...")

        try {
            const result = await markAttendance(decodedText, eventId, eventName)

            if (result.success) {
                setStatus("success")
                setStatusMessage(result.message)
                toast.success(result.message)
            } else {
                setStatus("error")
                setStatusMessage(result.message)
                toast.error(result.message)
            }
        } catch (error) {
            setStatus("error")
            setStatusMessage("Network error. Try again.")
        }

        setTimeout(() => {
            setLastScanned(null)
            setStatus("idle")
            setStatusMessage("Ready to scan next")
        }, 3000)
    }

    function onScanFailure(error: any) {}

    function manualReset() {
        setLastScanned(null)
        setStatus("idle")
        setStatusMessage("Ready to scan")
    }

    return (
        <div className="p-4 flex flex-col items-center">
            <div className="w-full max-w-md space-y-6">
                <header className="flex items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-black">Attendance Scanner</h1>
                        {eventId && (
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <CalendarDays className="w-3 h-3" />
                                {eventName}
                            </p>
                        )}
                    </div>
                </header>

                {!eventId && (
                    <Card className="bg-slate-900 border-indigo-500/30">
                        <CardContent className="p-4 text-sm text-indigo-300">
                            <span className="text-lg">⚠️</span> No event selected. <Link href="/admin/events" className="underline font-semibold text-white">Go back and pick an event</Link> before scanning.
                        </CardContent>
                    </Card>
                )}

                <Card className="bg-slate-900 border-slate-800 shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-center text-slate-200">{eventName}</CardTitle>
                        <CardDescription className="text-center text-slate-500">
                            {scannerReady ? "Point camera at ID Card QR Code" : "Initializing camera..."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            {!scannerReady && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 rounded-xl">
                                    <RefreshCw className="w-8 h-8 animate-spin text-slate-500" />
                                </div>
                            )}
                            <style dangerouslySetInnerHTML={{__html: `
                                #reader a { color: #60a5fa !important; text-decoration: underline; }
                                #reader select { background-color: #1e293b !important; color: white !important; border: 1px solid #334155 !important; border-radius: 4px; padding: 4px; margin-bottom: 8px; }
                                #reader button { background-color: #3b82f6 !important; color: white !important; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
                                #reader span { color: #cbd5e1 !important; }
                            `}} />
                            <div id="reader" className="overflow-hidden rounded-xl border-2 border-slate-700 bg-black min-h-[300px]"></div>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Indicator */}
                <Card className={`border-l-4 transition-all duration-300 transform ${status === 'success' ? 'bg-emerald-950/40 border-emerald-500 scale-105' :
                        status === 'error' ? 'bg-red-950/40 border-red-500' :
                            status === 'processing' ? 'bg-blue-950/40 border-blue-500' :
                                'bg-slate-900 border-slate-700'
                    }`}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${status === 'success' ? 'bg-emerald-500/20 text-emerald-500' :
                                status === 'error' ? 'bg-red-500/20 text-red-500' :
                                    status === 'processing' ? 'bg-blue-500/20 text-blue-500' :
                                        'bg-slate-800 text-slate-400'
                            }`}>
                            {status === 'success' ? <CheckCircle2 className="w-6 h-6" /> :
                                status === 'error' ? <AlertCircle className="w-6 h-6" /> :
                                    status === 'processing' ? <RefreshCw className="w-6 h-6 animate-spin" /> :
                                        <span className="w-3 h-3 bg-slate-400 rounded-full animate-pulse"></span>}
                        </div>
                        <div className="flex-1">
                            <h3 className={`font-bold text-lg ${status === 'success' ? 'text-emerald-400' :
                                    status === 'error' ? 'text-red-400' :
                                        status === 'processing' ? 'text-blue-400' :
                                            'text-slate-200'
                                }`}>
                                {status === 'success' ? 'Marked Present' :
                                    status === 'error' ? 'Scan Failed' :
                                        status === 'processing' ? 'Processing...' :
                                            'Scanner Ready'}
                            </h3>
                            <p className="text-sm text-slate-400">{statusMessage}</p>
                        </div>
                        {status === 'error' && (
                            <Button variant="ghost" size="icon" onClick={manualReset}>
                                <RefreshCw className="w-4 h-4 text-slate-400" />
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <div className="text-center">
                    <p className="text-xs text-slate-600">
                        Ensure good lighting and hold the card steady.
                    </p>
                </div>
            </div>
        </div>
    )
}
