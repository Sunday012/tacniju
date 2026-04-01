import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { ProfileForm } from "@/components/profile-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  return (
    <div className="min-h-screen bg-[#F4F7FA] relative overflow-x-hidden">
      {/* Background blurs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-indigo-200/40 via-violet-100/20 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none -z-10 translate-x-1/3 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-100/40 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none -z-10 -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back */}
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-800 gap-2 -ml-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Profile Settings</h1>
          <p className="text-slate-500 text-[15px] mt-1.5 font-medium">Manage your personal information and preferences</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]">
          <ProfileForm profile={profile} />
        </div>
      </div>
    </div>
  )
}
