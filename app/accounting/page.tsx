import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { AccountingClient } from "@/components/accounting/accounting-client"
import { getAccountGroups, getLedgers, getCustomFields } from "@/app/management/actions"
import { getRecentVouchers } from "@/app/vouchers/actions"
import { getItems } from "@/app/inventory/actions"
import { getAttendanceList } from "../dashboard/attendance/actions"

export default async function AccountingDashboard({ searchParams }: { searchParams: { date?: string, start?: string, end?: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect("/auth/admin-login")

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin, org_members(organizations(name))")
        .eq("id", user.id)
        .maybeSingle()

    const cookieStore = require('next/headers').cookies()
    const activeOrgId = cookieStore.get("active_org_id")?.value

    let orgName = "Unknown Company"

    if (activeOrgId) {
        const { data: org } = await supabase
            .from("organizations")
            .select("name")
            .eq("id", activeOrgId)
            .maybeSingle()

        if (org) {
            orgName = org.name
        }
    } else if (profile?.org_members && profile.org_members.length > 0) {
        // Fallback to first joined if no cookie
        // @ts-ignore
        orgName = profile.org_members[0]?.organizations?.name || "Unknown Company"
    }

    const todayStr = searchParams.date || new Date().toISOString().slice(0, 10)
    // Fetch all required data for the SPA including default reports
    const [
        groups, ledgers, customFields,
        vouchers,
        items,
        attendance,
        dayBook,
        trialBalance
    ] = await Promise.all([
        getAccountGroups(),
        getLedgers(),
        getCustomFields(),
        getRecentVouchers(),
        getItems(),
        getAttendanceList(),
        import("@/app/reports/actions").then(m => m.getDayBook(todayStr)),
        import("@/app/reports/actions").then(m => m.getTrialBalance(searchParams.start, searchParams.end))
    ])

    return (
        <AccountingClient
            profile={profile}
            orgName={orgName}
            groups={groups}
            ledgers={ledgers}
            customFields={customFields}
            vouchers={vouchers}
            items={items}
            attendance={attendance}
            dayBook={dayBook}
            trialBalance={trialBalance}
        />
    )
}
