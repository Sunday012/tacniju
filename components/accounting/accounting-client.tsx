"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GroupsManager } from "@/components/management/groups-manager"
import { LedgersManager } from "@/components/management/ledgers-manager"
import { VoucherEntry } from "@/components/vouchers/voucher-entry"
import { ItemManager } from "@/components/inventory/item-manager"
import { AttendanceManager } from "@/components/attendance/attendance-manager"
import { DayBookView } from "@/components/reports/day-book-view"
import { TrialBalanceView } from "@/components/reports/trial-balance-view"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

type AccountingClientProps = {
    profile: any
    orgName: string
    groups: any[]
    ledgers: any[]
    customFields: any[]
    vouchers: any[]
    items: any[]
    attendance: any[]
    dayBook: any[]
    trialBalance: any[]
}

export function AccountingClient({ profile, orgName, groups, ledgers, customFields, vouchers, items, attendance, dayBook, trialBalance }: AccountingClientProps) {
    const [activeTab, setActiveTab] = useState<"gateway" | "management" | "banking" | "vouchers" | "inventory" | "attendance" | "reports" | "day-book" | "trial-balance">("gateway")
    const router = useRouter()
    const isoToday = new Date().toISOString().slice(0, 10)
    const currentYear = new Date().getFullYear()

    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    const currentPeriod = `1-Jan-${currentYear} to 31-Dec-${currentYear}`

    const goToSelectChurch = () => {
        router.push("/select-church")
    }

    // Global keyboard shortcuts for Gateway
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F1") {
                e.preventDefault()
                goToSelectChurch()
                return
            }

            // Don't trigger shortcuts if user is typing in an input field using those raw keys
            const target = e.target as HTMLElement
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

            if (activeTab === "gateway" && !isInput) {
                const key = e.key.toLowerCase()
                if (key === 'a') setActiveTab('management')
                if (key === 'k') setActiveTab('banking') // K for banKing (B conflicts with Balance Sheet)
                if (key === 'v') setActiveTab('vouchers')
                if (key === 'i') setActiveTab('inventory')
                if (key === 't') setActiveTab('attendance') // T for Attendance
                if (key === 'm') setActiveTab('reports')
                if (key === 'q') window.location.href = '/dashboard'
            }

            // Escape always goes back to gateway
            if (e.key === 'Escape' && activeTab !== "gateway") {
                if (activeTab === "day-book" || activeTab === "trial-balance") {
                    setActiveTab("reports")
                } else {
                    setActiveTab("gateway")
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [activeTab])

    const renderContent = () => {
        switch (activeTab) {
            case "day-book":
                return (
                    <DayBookView
                        data={dayBook}
                        selectedDate={isoToday}
                        startDate={`${currentYear}-01-01`}
                        endDate={`${currentYear}-12-31`}
                        onBack={() => setActiveTab("reports")}
                    />
                )
            case "trial-balance":
                return <TrialBalanceView data={trialBalance} onBack={() => setActiveTab("reports")} />
            case "management":
                return (
                    <div className="p-4 md:p-8 overflow-y-auto h-full space-y-8 bg-white relative z-20">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Accounts Info</h1>
                                <p className="text-slate-500">Configure your Groups and Party Ledgers. Bank accounts live in the separate Banking tab.</p>
                            </div>
                            <button onClick={() => setActiveTab("gateway")} className="text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-3 py-1.5 rounded transition font-medium">Esc: Back to Gateway</button>
                        </div>
                        <div className="grid gap-8 md:grid-cols-2">
                            <div><GroupsManager groups={groups} ledgers={ledgers} /></div>
                            <div><LedgersManager ledgers={ledgers} groups={groups} mode="accounts" /></div>
                        </div>
                    </div>
                )
            case "banking":
                return (
                    <div className="p-4 md:p-8 overflow-y-auto h-full space-y-8 bg-white relative z-20">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Banking</h1>
                                <p className="text-slate-500">Manage your bank accounts. These are the only ledgers that can be picked as the Cash/Bank field on Payment, Receipt, Contra, Expense, Income, and Program vouchers.</p>
                            </div>
                            <button onClick={() => setActiveTab("gateway")} className="text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-3 py-1.5 rounded transition font-medium">Esc: Back to Gateway</button>
                        </div>
                        <LedgersManager ledgers={ledgers} groups={groups} mode="banks" />
                    </div>
                )
            case "vouchers":
                return (
                    <div className="p-4 md:p-8 overflow-y-auto h-full space-y-6 bg-white relative z-20">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Accounting Vouchers</h1>
                                <p className="text-slate-500">Record payments, receipts, contra transfers, and journal entries.</p>
                            </div>
                            <button onClick={() => setActiveTab("gateway")} className="text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-3 py-1.5 rounded transition font-medium">Esc: Back to Gateway</button>
                        </div>
                        <VoucherEntry ledgers={ledgers} recentVouchers={vouchers} items={items} />
                    </div>
                )
            case "inventory":
                return (
                    <div className="p-4 md:p-8 overflow-y-auto h-full space-y-6 bg-white relative z-20">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inventory Management</h1>
                                <p className="text-slate-500">Track and manage church assets, books, merchandise, and event tickets.</p>
                            </div>
                            <button onClick={() => setActiveTab("gateway")} className="text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-3 py-1.5 rounded transition font-medium">Esc: Back to Gateway</button>
                        </div>
                        <ItemManager items={items} />
                    </div>
                )
            case "attendance":
                return (
                    <div className="p-4 md:p-8 overflow-y-auto h-full space-y-6 bg-white relative z-20">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Service Attendance</h1>
                                <p className="text-slate-500">Track service participation and headcount data.</p>
                            </div>
                            <button onClick={() => setActiveTab("gateway")} className="text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-3 py-1.5 rounded transition font-medium">Esc: Back to Gateway</button>
                        </div>
                        <AttendanceManager data={attendance} />
                    </div>
                )
            case "reports":
                return (
                    <div className="p-4 md:p-8 overflow-y-auto h-full space-y-6 bg-white relative z-20">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Financial Reports</h1>
                                <p className="text-slate-500">Generate and view essential accounting statements.</p>
                            </div>
                            <button onClick={() => setActiveTab("gateway")} className="text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-3 py-1.5 rounded transition font-medium">Esc: Back to Gateway</button>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <div onClick={() => setActiveTab("day-book")}><Card className="bg-white cursor-pointer hover:border-indigo-500 transition-colors h-full"><CardHeader><CardTitle className="text-xl text-indigo-700">Day Book</CardTitle></CardHeader><CardContent><CardDescription className="text-slate-500">View chronological daily transactions.</CardDescription></CardContent></Card></div>
                            <div onClick={() => setActiveTab("trial-balance")}><Card className="bg-white cursor-pointer hover:border-indigo-500 transition-colors h-full"><CardHeader><CardTitle className="text-xl text-indigo-700">Trial Balance</CardTitle></CardHeader><CardContent><CardDescription className="text-slate-500">Summary of all ledger balances.</CardDescription></CardContent></Card></div>
                            <div className="opacity-50 pointer-events-none"><Card className="bg-white cursor-pointer h-full"><CardHeader><CardTitle className="text-xl text-slate-400">Ledger Statement</CardTitle></CardHeader><CardContent><CardDescription className="text-slate-400">Coming soon.</CardDescription></CardContent></Card></div>
                            <div className="opacity-50 pointer-events-none"><Card className="bg-white cursor-pointer h-full"><CardHeader><CardTitle className="text-xl text-slate-400">Income & Exp (P&L)</CardTitle></CardHeader><CardContent><CardDescription className="text-slate-400">Coming soon.</CardDescription></CardContent></Card></div>
                            <div className="opacity-50 pointer-events-none"><Card className="bg-white cursor-pointer h-full"><CardHeader><CardTitle className="text-xl text-slate-400">Balance Sheet</CardTitle></CardHeader><CardContent><CardDescription className="text-slate-400">Coming soon.</CardDescription></CardContent></Card></div>
                        </div>
                    </div>
                )
            case "gateway":
            default:
                return (
                    <div className="flex-1 flex flex-col md:flex-row text-sm overflow-hidden z-20">
                        {/* Left Half (Company Info) */}
                        <div className="w-full md:w-1/2 md:border-r border-slate-200 p-4 md:p-6 flex flex-col text-sm bg-white">
                            <div className="flex justify-between font-semibold border-b-2 border-indigo-100 pb-4 mb-6 text-indigo-900 rounded-t shadow-[0_1px_2px_-1px_rgba(0,0,0,0.05)] bg-white p-4 items-center">
                                <div className="text-center w-1/2 border-r border-indigo-50">
                                    <span className="uppercase tracking-widest text-[10px] text-indigo-500 font-bold">Current Period</span><br />
                                    <span className="font-medium text-slate-700 mt-1 block">{currentPeriod}</span>
                                </div>
                                <div className="text-center w-1/2">
                                    <span className="uppercase tracking-widest text-[10px] text-indigo-500 font-bold">Current Date</span><br />
                                    <span className="font-medium text-slate-700 mt-1 block">{today}</span>
                                </div>
                            </div>

                            <div className="text-center font-bold text-indigo-900 uppercase tracking-widest text-xs mb-8 border-b border-indigo-100 pb-2 mx-2 md:mx-8 relative">
                                <span className="bg-white px-2 md:px-4 relative top-2.5">List of Selected Churches</span>
                            </div>

                            <div className="flex justify-between font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-2 px-3">
                                <span>Name of Assembly</span>
                                <span className="hidden sm:inline">Date of Last Entry</span>
                            </div>

                            <div className="flex justify-between font-bold px-4 py-3 cursor-pointer bg-white text-indigo-900 rounded-md border border-indigo-200 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all group">
                                <span className="group-hover:text-indigo-700 truncate mr-2">{orgName}</span>
                                <span className="text-slate-500 font-medium whitespace-nowrap">{today}</span>
                            </div>
                        </div>

                        {/* Right Half (Menu Loop) */}
                        <div className="w-full md:w-1/2 p-4 md:p-6 flex items-center justify-center relative bg-indigo-50/40">
                            {/* Menu Box */}
                            <div className="bg-white border rounded-lg shadow-xl flex flex-col w-full max-w-[360px] overflow-hidden border-indigo-100 ring-1 ring-indigo-900/5">
                                <div className="bg-indigo-950 text-white text-center font-bold py-3 border-b-[3px] border-amber-400 tracking-wide shadow-sm z-10">
                                    Accounting Gateway
                                </div>

                                <div className="p-4 md:p-6 flex flex-col space-y-6 bg-white">
                                    {/* Masters Section */}
                                    <div>
                                        <div className="font-bold flex items-center text-slate-400 text-[10px] uppercase tracking-widest mb-3">
                                            <div className="flex-1 h-px bg-slate-200 mr-3"></div>
                                            Masters
                                            <div className="flex-1 h-px bg-slate-200 ml-3"></div>
                                        </div>
                                        <button onClick={() => setActiveTab("management")} className="w-full block mb-2 text-center bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 py-2 cursor-pointer font-medium rounded transition-all text-slate-700 shadow-sm">
                                            <span className="text-indigo-700 font-extrabold mr-[1px]">A</span>ccounts Info (Party Ledgers)
                                        </button>
                                        <button onClick={() => setActiveTab("banking")} className="w-full block text-center bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 py-2 cursor-pointer font-medium rounded transition-all text-slate-700 shadow-sm">
                                            Ban<span className="text-indigo-700 font-extrabold mr-[1px]">k</span>ing (Cash & Bank)
                                        </button>
                                    </div>

                                    {/* Transactions Section */}
                                    <div>
                                        <div className="font-bold flex items-center text-slate-400 text-[10px] uppercase tracking-widest mb-3">
                                            <div className="flex-1 h-px bg-slate-200 mr-3"></div>
                                            Transactions
                                            <div className="flex-1 h-px bg-slate-200 ml-3"></div>
                                        </div>
                                        <button onClick={() => setActiveTab("vouchers")} className="w-full block mb-2 text-center bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 py-2 cursor-pointer font-medium rounded transition-all text-slate-700 shadow-sm">
                                            Accounting <span className="text-indigo-700 font-extrabold mr-[1px]">V</span>ouchers
                                        </button>
                                        <button onClick={() => setActiveTab("inventory")} className="w-full block text-center bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 py-2 cursor-pointer font-medium rounded transition-all text-slate-700 shadow-sm">
                                            <span className="text-indigo-700 font-extrabold mr-[1px]">I</span>nventory
                                        </button>
                                    </div>

                                    {/* Utilities Section */}
                                    <div>
                                        <div className="font-bold flex items-center text-slate-400 text-[10px] uppercase tracking-widest mb-3">
                                            <div className="flex-1 h-px bg-slate-200 mr-3"></div>
                                            Utilities
                                            <div className="flex-1 h-px bg-slate-200 ml-3"></div>
                                        </div>
                                        <button onClick={() => setActiveTab("attendance")} className="w-full block text-center bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 py-2 cursor-pointer font-medium rounded transition-all text-slate-700 shadow-sm">
                                            Service A<span className="text-indigo-700 font-extrabold mr-[1px]">t</span>tendance
                                        </button>
                                    </div>

                                    {/* Reports Section */}
                                    <div>
                                        <div className="font-bold flex items-center text-slate-400 text-[10px] uppercase tracking-widest mb-3">
                                            <div className="flex-1 h-px bg-slate-200 mr-3"></div>
                                            Reports
                                            <div className="flex-1 h-px bg-slate-200 ml-3"></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <Link href="/reports/balance-sheet" className="block text-center bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 py-2 cursor-pointer font-medium rounded transition-all text-slate-700 shadow-sm text-xs">
                                                <span className="text-indigo-700 font-extrabold mr-[1px]">B</span>alance Sheet
                                            </Link>
                                            <Link href="/reports/profit-loss" className="block text-center bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 py-2 cursor-pointer font-medium rounded transition-all text-slate-700 shadow-sm text-xs">
                                                <span className="text-indigo-700 font-extrabold mr-[1px]">P</span>rofit & Loss
                                            </Link>
                                        </div>
                                        <button onClick={() => setActiveTab("reports")} className="w-full block text-center bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 py-2 cursor-pointer font-medium rounded transition-all text-slate-700 shadow-sm">
                                            Display <span className="text-indigo-700 font-extrabold mr-[1px]">M</span>ore Reports
                                        </button>
                                    </div>

                                    {/* Quit */}
                                    <div className="pt-2">
                                        <Link href="/dashboard" className="block text-center bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 cursor-pointer font-bold rounded-md transition-colors shadow-sm border border-slate-200">
                                            <span className="text-red-600 font-extrabold mr-[1px]">Q</span>uit to Dashboard
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
        }
    }

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col overflow-hidden select-none">

            {/* Top Hotkey Bar - Hidden on mobile */}
            <div className="hidden md:flex bg-indigo-950 border-b-[3px] border-amber-400 text-indigo-100 text-xs px-4 py-1.5 justify-between font-semibold shadow-sm z-10">
                <div className="flex space-x-6 overflow-x-auto">
                    <span className="flex items-center hover:text-white cursor-pointer transition-colors whitespace-nowrap"><span className="text-amber-400 font-bold mr-1 border-b border-amber-400 leading-none">P</span>: Print</span>
                    <span className="flex items-center hover:text-white cursor-pointer transition-colors whitespace-nowrap"><span className="text-amber-400 font-bold mr-1 border-b border-amber-400 leading-none">E</span>: Export</span>
                    <span className="flex items-center hover:text-white cursor-pointer transition-colors whitespace-nowrap"><span className="text-amber-400 font-bold mr-1 border-b border-amber-400 leading-none">M</span>: E-Mail</span>
                    <span className="flex items-center hover:text-white cursor-pointer transition-colors whitespace-nowrap"><span className="text-amber-400 font-bold mr-1 border-b border-amber-400 leading-none">O</span>: Upload</span>
                    <span className="flex items-center hover:text-white cursor-pointer transition-colors whitespace-nowrap"><span className="text-amber-400 font-bold mr-1 border-b border-amber-400 leading-none">S</span>: Services</span>
                    <span className="flex items-center hover:text-white cursor-pointer transition-colors whitespace-nowrap"><span className="text-amber-400 font-bold mr-1 border-b border-amber-400 leading-none">G</span>: Language</span>
                    <span className="flex items-center hover:text-white cursor-pointer transition-colors whitespace-nowrap"><span className="text-amber-400 font-bold mr-1 border-b border-amber-400 leading-none">K</span>: Keyboard</span>
                    <span className="flex items-center hover:text-white cursor-pointer transition-colors whitespace-nowrap"><span className="text-amber-400 font-bold mr-1 border-b border-amber-400 leading-none">H</span>: Help</span>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative flex-col-reverse md:flex-row">
                {/* Main Background Texture */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #4338ca 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col md:border-r border-slate-200 relative z-10 bg-white overflow-hidden">

                    {/* Application Header */}
                    <div className="bg-indigo-950 text-white px-4 py-2 flex justify-between font-bold text-sm shadow-md">
                        <span className="tracking-wide">CHURCH ACCOUNTING PORTAL</span>
                        <span className="flex gap-4">
                            <span className="text-indigo-200 hover:text-white cursor-pointer transition-colors text-xs font-medium">Ctrl + M ☒</span>
                        </span>
                    </div>

                    {renderContent()}
                </div>

                {/* Vertical Right Strip Menu - Horizontal on Mobile */}
                <div className="w-full md:w-[12%] bg-indigo-950 text-white flex flex-row md:flex-col md:border-l border-black/40 text-xs shadow-[inset_0_2px_10px_rgba(0,0,0,0.25)] md:shadow-[inset_2px_0_10px_rgba(0,0,0,0.25)] z-20 overflow-x-auto md:overflow-y-auto">
                    <div className="flex flex-row md:flex-col py-1 md:py-3 px-2 gap-1 md:border-b border-black/40">
                        <button
                            type="button"
                            onClick={goToSelectChurch}
                            className="px-2 md:px-3 py-2 bg-black/30 hover:bg-indigo-800 cursor-pointer flex rounded border border-indigo-800/60 transition-colors shadow-sm whitespace-nowrap text-left"
                        >
                            <span className="mr-1 md:w-8 font-bold text-amber-400">F1:</span> Select Ch.
                        </button>
                    </div>
                    <div className="flex flex-row md:flex-col py-1 md:py-3 px-2 gap-1 md:border-b border-black/40">
                        <div className="px-2 md:px-3 py-2 bg-black/30 hover:bg-indigo-800 cursor-pointer flex rounded border border-indigo-800/60 transition-colors shadow-sm whitespace-nowrap"><span className="mr-1 md:w-8 font-bold text-amber-400">F2:</span> Date</div>
                        <div className="px-2 md:px-3 py-2 bg-black/30 hover:bg-indigo-800 cursor-pointer flex rounded border border-indigo-800/60 transition-colors shadow-sm whitespace-nowrap"><span className="mr-1 md:w-8 font-bold text-amber-400 border-b-2 border-amber-400 leading-none pb-0.5">F2:</span> Period</div>
                    </div>
                </div>
            </div>

            {/* Bottom Info Bar Section - Hidden on small screens to save space */}
            <div className="hidden md:flex flex-col z-20 relative bg-white border-t border-slate-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                <div className="flex text-xs font-semibold overflow-hidden h-20">
                    <div className="w-[15%] p-3 border-r border-slate-200 bg-indigo-50 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-100 rounded-bl-full opacity-50 -mr-4 -mt-4"></div>
                        <div className="font-extrabold italic text-sm text-indigo-900 tracking-wide uppercase relative z-10">TACN Finance</div>
                        <div className="text-[9px] text-amber-700 font-bold mt-1 tracking-widest bg-amber-100 px-2 py-0.5 rounded-sm relative z-10">CLOUD ERP</div>
                    </div>
                    <div className="flex-1 border-r border-slate-200 p-3 pt-2">
                        <div className="flex justify-between border-b-2 border-slate-100 pb-1.5 text-slate-400 text-[10px] uppercase tracking-wider mb-2">
                            <span>Version & Updates</span>
                        </div>
                        <div className="font-bold text-xs text-indigo-900">
                            Release 1.0.0<br />
                            <span className="font-medium text-slate-500 text-[10px]">(Latest Cloud Edition)</span>
                        </div>
                    </div>
                    <div className="flex-1 border-r border-slate-200 p-3 pt-2">
                        <div className="flex justify-between border-b-2 border-slate-100 pb-1.5 text-slate-400 text-[10px] uppercase tracking-wider mb-2">
                            <span>License & Auth</span>
                        </div>
                        <div className="font-bold text-xs">
                            <div className="text-emerald-600 flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></div> Active Account</div>
                            <div className="text-slate-500 font-medium text-[10px] mt-0.5">System User</div>
                        </div>
                    </div>
                    <div className="flex-1 border-r border-slate-200 p-3 pt-2">
                        <div className="flex justify-between border-b-2 border-slate-100 pb-1.5 text-slate-400 text-[10px] uppercase tracking-wider mb-2">
                            <span>Configuration</span>
                        </div>
                        <div className="font-bold text-xs text-slate-700">
                            Gateway Mode<br />
                            <span className="text-indigo-700 font-medium text-[10px]">Cloud Connected</span>
                        </div>
                    </div>
                    <div className="flex-[1.5] bg-indigo-50/40 relative">
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-amber-400 shadow-[0_2px_4px_rgba(250,204,21,0.3)]"></div>
                        <div className="p-3 pt-2">
                            <div className="flex justify-between border-b-2 border-slate-200 pb-1.5 text-indigo-900 font-bold text-[10px] uppercase tracking-wider mb-2">
                                <span>Calculator</span>
                                <span className="text-slate-400 hover:text-slate-800 cursor-pointer bg-slate-200 px-1.5 py-0.5 rounded text-[9px] transition-colors">Ctrl + N ☒</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Footer Strip */}
                <div className="bg-indigo-950 text-[10px] text-indigo-200 px-5 py-2 flex justify-between font-medium tracking-wide">
                    <span>TACN MAIN <span className="text-amber-400 mx-1">▶</span> Gateway of Accounting</span>
                    <div className="flex gap-8">
                        <span className="opacity-80">© 2026 The Apostolic Church</span>
                        <span className="text-amber-400 font-bold">{today}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
