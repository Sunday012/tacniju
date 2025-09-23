import { Badge } from "@/components/ui/badge"

interface AttendanceRecord {
  id: string
  event_name: string
  event_date: string
  attended: boolean
  notes?: string
}

interface AttendanceHistoryProps {
  attendance: AttendanceRecord[]
}

export function AttendanceHistory({ attendance }: AttendanceHistoryProps) {
  if (!attendance || attendance.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-sm">No attendance records yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {attendance.map((record) => (
        <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <p className="font-medium text-sm text-gray-900">{record.event_name}</p>
            <p className="text-xs text-gray-500">{new Date(record.event_date).toLocaleDateString()}</p>
            {record.notes && <p className="text-xs text-gray-600 mt-1">{record.notes}</p>}
          </div>
          <Badge
            variant={record.attended ? "default" : "secondary"}
            className={`text-xs ${record.attended ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
          >
            {record.attended ? "Present" : "Absent"}
          </Badge>
        </div>
      ))}
    </div>
  )
}
