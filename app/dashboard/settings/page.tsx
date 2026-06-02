import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { ProfileForm } from "@/components/profile-form"

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
  let assignedFamilyName: string | null = null

  if (profile?.family_id) {
    const { data: family } = await supabase
      .from("families")
      .select("name")
      .eq("id", profile.family_id)
      .maybeSingle()

    assignedFamilyName = family?.name || null
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Profile Settings</h1>
        <p className="text-slate-500 text-[15px] mt-1.5 font-medium">Manage your personal information and preferences</p>
      </div>

      {/* Form Card */}
      <div className="bg-white/80 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]">
        <ProfileForm profile={profile} assignedFamilyName={assignedFamilyName} />
      </div>
    </div>
  )
}
