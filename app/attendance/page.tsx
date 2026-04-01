import { getAttendanceList } from "@/app/attendance/actions"
import { AttendanceManager } from "@/components/attendance/attendance-manager"

export default async function AttendancePage() {
    const data = await getAttendanceList()

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Attendance</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track service participation and headcount data.</p>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr]">
                    <AttendanceManager data={data} />
                </div>
            </div>
        </div>
    )
}
