"use client"

import { useEffect, useState } from "react"
import { getOrganizations, joinOrganization, createChurch } from "./actions"
import { toast } from "sonner"

type Organization = {
    id: string
    name: string
    logo_url: string | null
    address: string | null
}

export default function SelectChurchPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [joiningId, setJoiningId] = useState<string | null>(null)
    const [passwords, setPasswords] = useState<Record<string, string>>({})
    const [showModal, setShowModal] = useState(false)
    const [creating, setCreating] = useState(false)
    const [newName, setNewName] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [modalError, setModalError] = useState("")

    useEffect(() => {
        async function loadOrgs() {
            try {
                const data = await getOrganizations()
                setOrganizations(data)
            } catch (error) {
                console.error("Failed to load organizations:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadOrgs()
    }, [])

    async function handleJoin(orgId: string) {
        setJoiningId(orgId)
        try {
            const result = await joinOrganization(orgId, passwords[orgId] || "")
            if (result?.error) {
                toast.error(result.error)
                setJoiningId(null)
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to join church")
            setJoiningId(null)
        }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        setCreating(true)
        setModalError("")
        try {
            const result = await createChurch(newName, newPassword)
            if (result?.error) {
                setModalError(result.error)
                setCreating(false)
            } else if (result?.success) {
                window.location.href = "/accounting"
            }
        } catch (err: any) {
            setModalError(err.message || "Failed to create church.")
            setCreating(false)
        }
    }

    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

    return (
        <div className="min-h-screen w-full flex bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* Left Sidebar — Branding */}
            <div className="hidden md:flex w-[340px] flex-shrink-0 bg-gradient-to-br from-indigo-600 to-violet-700 flex-col justify-between p-8 text-white relative overflow-hidden">
                {/* subtle pattern */}
                <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                <div className="relative">
                    <div className="mb-10">
                        <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
                            <div className="w-2 h-2 rounded-full bg-amber-300 animate-pulse"></div>
                            <span className="text-white text-xs font-bold tracking-widest uppercase">Cloud ERP</span>
                        </div>
                        <h1 className="text-3xl font-extrabold leading-tight mb-2">TACN<br />Finance</h1>
                        <p className="text-indigo-100/90 text-sm leading-relaxed">
                            Church accounting portal for The Apostolic Church Nigeria assemblies.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {[
                            { label: "Double-Entry Bookkeeping", desc: "Full voucher system" },
                            { label: "Financial Reports", desc: "Trial Balance, Day Book" },
                            { label: "Inventory & Attendance", desc: "Assets & headcount tracking" },
                        ].map((f) => (
                            <div key={f.label} className="flex items-start gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15">
                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <div className="w-2 h-2 rounded-full bg-amber-300"></div>
                                </div>
                                <div>
                                    <div className="text-white text-xs font-semibold">{f.label}</div>
                                    <div className="text-indigo-100/70 text-[11px]">{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-indigo-100/60 text-[11px] relative">
                    <div className="border-t border-white/15 pt-4">© 2026 The Apostolic Church Nigeria</div>
                </div>
            </div>

            {/* Right Panel — Church List */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden bg-slate-50/50">
                {/* Top Bar */}
                <div className="flex items-center justify-between px-6 md:px-10 py-5 bg-white border-b border-slate-200">
                    <div>
                        <h2 className="text-slate-900 font-bold text-xl">Select Assembly</h2>
                        <p className="text-slate-500 text-xs mt-0.5">{today}</p>
                    </div>
                    <button
                        onClick={() => { setShowModal(true); setModalError(""); setNewName(""); setNewPassword("") }}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-4 py-2 rounded-lg transition-all shadow-[0_4px_16px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_20px_rgba(79,70,229,0.4)] active:scale-95"
                    >
                        <span className="text-lg leading-none">+</span>
                        Create Church
                    </button>
                </div>

                {/* Church Cards */}
                <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin"></div>
                        </div>
                    ) : organizations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 text-2xl">⛪</div>
                            <p className="text-slate-700 font-medium">No assemblies registered yet</p>
                            <p className="text-slate-500 text-sm mt-1">Click <span className="text-indigo-700 font-bold">+ Create Church</span> to get started</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
                            {organizations.map((org) => (
                                <div
                                    key={org.id}
                                    className="group bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-5 transition-all duration-200 shadow-sm hover:shadow-[0_8px_30px_-12px_rgba(79,70,229,0.25)]"
                                >
                                    {/* Avatar */}
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0">
                                            <span className="text-white font-extrabold text-lg">{org.name.charAt(0)}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-slate-900 font-semibold text-sm truncate">{org.name}</div>
                                            {org.address
                                                ? <div className="text-slate-500 text-[11px] truncate">{org.address}</div>
                                                : <div className="text-slate-400 text-[11px]">No address set</div>
                                            }
                                        </div>
                                    </div>

                                    {/* Password Input */}
                                    <input
                                        type="password"
                                        placeholder="Enter access password"
                                        value={passwords[org.id] || ""}
                                        onChange={(e) => setPasswords({ ...passwords, [org.id]: e.target.value })}
                                        onKeyDown={(e) => { if (e.key === "Enter" && passwords[org.id]) handleJoin(org.id) }}
                                        className="w-full mb-3 bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-slate-800 placeholder:text-slate-400 rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                                    />

                                    {/* Join Button */}
                                    <button
                                        onClick={() => handleJoin(org.id)}
                                        disabled={joiningId === org.id || !passwords[org.id]}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg transition-all text-sm shadow-[0_4px_12px_rgba(79,70,229,0.2)] active:scale-95"
                                    >
                                        {joiningId === org.id
                                            ? <span className="flex items-center justify-center gap-2"><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Connecting...</span>
                                            : "Enter Portal"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Church Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-br from-indigo-50 to-violet-50">
                            <div>
                                <h3 className="text-slate-900 font-bold text-base">Register New Assembly</h3>
                                <p className="text-slate-500 text-xs mt-0.5">You'll be set as admin automatically</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all text-lg leading-none border border-slate-200"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            {modalError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                                    {modalError}
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <label className="text-slate-600 text-xs font-medium uppercase tracking-wider">Assembly Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    required
                                    autoFocus
                                    className="w-full bg-white border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-slate-800 placeholder:text-slate-400 rounded-lg px-4 py-3 text-sm outline-none transition-colors"
                                    placeholder="e.g. Grace Assembly, Iju"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-slate-600 text-xs font-medium uppercase tracking-wider">Access Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="w-full bg-white border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-slate-800 placeholder:text-slate-400 rounded-lg px-4 py-3 text-sm outline-none transition-colors"
                                    placeholder="Members will use this to join"
                                />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-lg transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating || !newName || !newPassword}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg transition-all text-sm shadow-[0_4px_12px_rgba(79,70,229,0.2)] active:scale-95"
                                >
                                    {creating ? "Creating..." : "Register & Enter"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
