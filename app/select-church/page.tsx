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
        <div className="min-h-screen w-full flex bg-[#0d1b2e]" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* Left Sidebar — Branding */}
            <div className="hidden md:flex w-[340px] flex-shrink-0 bg-gradient-to-b from-[#0a1628] to-[#0d1b2e] border-r border-white/5 flex-col justify-between p-8">
                <div>
                    <div className="mb-10">
                        <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-4 py-1.5 mb-6">
                            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                            <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase">Cloud ERP</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-white leading-tight mb-2">TACN<br />Finance</h1>
                        <p className="text-blue-300/70 text-sm leading-relaxed">
                            Church accounting portal for The Apostolic Church Nigeria assemblies.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {[
                            { label: "Double-Entry Bookkeeping", desc: "Full voucher system" },
                            { label: "Financial Reports", desc: "Trial Balance, Day Book" },
                            { label: "Inventory & Attendance", desc: "Assets & headcount tracking" },
                        ].map((f) => (
                            <div key={f.label} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                                <div className="w-5 h-5 rounded-full bg-yellow-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                </div>
                                <div>
                                    <div className="text-white text-xs font-semibold">{f.label}</div>
                                    <div className="text-blue-400/60 text-[11px]">{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-blue-400/40 text-[11px]">
                    <div className="border-t border-white/5 pt-4">© 2026 The Apostolic Church Nigeria</div>
                </div>
            </div>

            {/* Right Panel — Church List */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Top Bar */}
                <div className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/5">
                    <div>
                        <h2 className="text-white font-bold text-xl">Select Assembly</h2>
                        <p className="text-blue-300/50 text-xs mt-0.5">{today}</p>
                    </div>
                    <button
                        onClick={() => { setShowModal(true); setModalError(""); setNewName(""); setNewPassword("") }}
                        className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-[#0a1628] font-bold text-sm px-4 py-2 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] active:scale-95"
                    >
                        <span className="text-lg leading-none">+</span>
                        Create Church
                    </button>
                </div>

                {/* Church Cards */}
                <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 rounded-full border-2 border-yellow-400/30 border-t-yellow-400 animate-spin"></div>
                        </div>
                    ) : organizations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-2xl">⛪</div>
                            <p className="text-white/60 font-medium">No assemblies registered yet</p>
                            <p className="text-blue-400/40 text-sm mt-1">Click <span className="text-yellow-400 font-bold">+ Create Church</span> to get started</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
                            {organizations.map((org) => (
                                <div
                                    key={org.id}
                                    className="group bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-yellow-400/30 rounded-xl p-5 transition-all duration-200 hover:shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
                                >
                                    {/* Avatar */}
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg flex-shrink-0">
                                            <span className="text-[#0a1628] font-extrabold text-lg">{org.name.charAt(0)}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-white font-semibold text-sm truncate">{org.name}</div>
                                            {org.address
                                                ? <div className="text-blue-400/50 text-[11px] truncate">{org.address}</div>
                                                : <div className="text-blue-400/30 text-[11px]">No address set</div>
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
                                        className="w-full mb-3 bg-black/30 border border-white/10 focus:border-yellow-400/50 text-white placeholder:text-white/20 rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                                    />

                                    {/* Join Button */}
                                    <button
                                        onClick={() => handleJoin(org.id)}
                                        disabled={joiningId === org.id || !passwords[org.id]}
                                        className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-25 disabled:cursor-not-allowed text-[#0a1628] font-bold py-2 rounded-lg transition-all text-sm active:scale-95"
                                    >
                                        {joiningId === org.id
                                            ? <span className="flex items-center justify-center gap-2"><span className="w-3.5 h-3.5 rounded-full border-2 border-[#0a1628]/30 border-t-[#0a1628] animate-spin"></span> Connecting...</span>
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div
                        className="bg-[#0f1f35] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        style={{ boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)" }}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-bold text-base">Register New Assembly</h3>
                                <p className="text-blue-400/50 text-xs mt-0.5">You'll be set as admin automatically</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            {modalError && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-lg px-4 py-3">
                                    {modalError}
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Assembly Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    required
                                    autoFocus
                                    className="w-full bg-black/30 border border-white/10 focus:border-yellow-400/50 text-white placeholder:text-white/20 rounded-lg px-4 py-3 text-sm outline-none transition-colors"
                                    placeholder="e.g. Grace Assembly, Iju"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Access Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="w-full bg-black/30 border border-white/10 focus:border-yellow-400/50 text-white placeholder:text-white/20 rounded-lg px-4 py-3 text-sm outline-none transition-colors"
                                    placeholder="Members will use this to join"
                                />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 font-medium py-2.5 rounded-lg transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating || !newName || !newPassword}
                                    className="flex-1 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-30 disabled:cursor-not-allowed text-[#0a1628] font-bold py-2.5 rounded-lg transition-all text-sm active:scale-95"
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
