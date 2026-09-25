import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, KeyRound } from "lucide-react"
import { createClient } from "@/lib/server"
import { LoginDetailsCards } from "@/components/admin/system/LoginDetailsCards"

export const dynamic = "force-dynamic"

export default async function LoginDetailsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle()
  if (!profile?.is_admin && user.email !== "sundayfavour997@gmail.com") redirect("/")

  const [{ data: members }, { data: loginDetails, error: detailsError }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, reservation_number, username, email, member_status")
      .order("full_name", { ascending: true }),
    supabase
      .from("login_details")
      .select("profile_id, username, password_text"),
  ])

  return (
    <div className="p-6 md:p-10">
      <div className="w-full space-y-8">
        <div>
          <Link
            href="/admin/system"
            className="mb-5 inline-flex h-10 items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 text-sm font-black text-indigo-700 shadow-sm hover:bg-indigo-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to System
          </Link>
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Login Details</h1>
              <p className="mt-1 font-medium text-slate-500">Manual username and password slots for registered members.</p>
            </div>
          </div>
        </div>

        {detailsError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-700">
            Run `scripts/036_create_login_details.sql` in Supabase to enable saving login details.
          </div>
        ) : null}

        <LoginDetailsCards members={members || []} loginDetails={loginDetails || []} />
      </div>
    </div>
  )
}
