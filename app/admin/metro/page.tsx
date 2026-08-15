import { MetroSecretaryWorkspace } from "@/components/admin/metro-secretary-workspace"
import { getMetroWorkspaceData } from "./actions"

export default async function MetroSecretaryPage() {
  const data = await getMetroWorkspaceData()

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Metro Youth Choir</h1>
          <p className="mt-2 text-slate-600">Secretary workspace for memos, members, events, attendance, dues, and account summaries.</p>
        </div>
        <MetroSecretaryWorkspace data={data} />
      </div>
    </div>
  )
}
