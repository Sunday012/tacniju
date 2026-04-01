"use client"
import { QRCodeSVG } from "qrcode.react"
import Link from "next/link"

interface IdCardQrProps {
  userId: string
}

export function IdCardQr({ userId }: IdCardQrProps) {
  return (
    <div className="bg-white/70 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg text-slate-800 font-extrabold tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-5 bg-teal-500 rounded-full inline-block shadow-[0_0_10px_rgba(20,184,166,0.5)]"></span>
          Digital Pass
        </h3>
      </div>
      
      <div className="flex flex-col items-center justify-center">
        <div className="p-4 bg-white border border-slate-100 shadow-sm rounded-2xl mb-5 flex items-center justify-center hover:scale-105 transition-transform duration-300">
          <QRCodeSVG
            value={userId}
            size={130}
            level="H"
            includeMargin={false}
            fgColor="#0f172a"
          />
        </div>
        
        <div className="text-center w-full space-y-4">
          <p className="text-[13px] text-slate-500 font-medium leading-relaxed px-2">
            Present this QR code to the ushering unit for attendance.
          </p>
          <Link href={`/id-card/${userId}`} className="block">
            <button className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold flex items-center justify-center gap-2 py-3 rounded-xl transition-all shadow-md text-[13px] tracking-wide">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              View Full ID Card
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
