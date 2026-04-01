import { getAccountGroups, getLedgers, getCustomFields } from "./actions"
import { GroupsManager } from "@/components/management/groups-manager"
// import { LedgersManager } from "@/components/management/ledgers-manager"

export default async function ManagementPage() {
    const [groups, ledgers, customFields] = await Promise.all([
        getAccountGroups(),
        getLedgers(),
        getCustomFields()
    ])

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Management</h1>
                    <p className="text-slate-500">Configure your Chart of Accounts: Groups and Ledgers.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    <div>
                        <GroupsManager groups={groups} />
                    </div>
                    <div>
                        {/* <LedgersManager ledgers={ledgers} groups={groups} customFields={customFields} /> */}
                    </div>
                </div>
            </div>
        </div>
    )
}
