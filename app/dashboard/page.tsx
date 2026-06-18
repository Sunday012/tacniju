import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import Link from "next/link"
import { WelcomeBanner } from "@/components/dashboard/welcome-banner"
import { QuickStats } from "@/components/dashboard/quick-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { IdCardQr } from "@/components/dashboard/id-card-qr"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"
import { MealTicketCard } from "@/components/dashboard/meal-ticket-card"
import { getUserMealTicket } from "@/app/actions/meal-tickets"
import { getUserAssetAssignments } from "@/app/actions/assets"
import { getActiveBattles } from "@/app/actions/battles"
import { ReceivedGifts } from "@/components/dashboard/received-gifts"
import { TopNewsBattles } from "@/components/dashboard/top-news-battles"
import { Utensils } from "lucide-react"
import { getProfilePartyBalance } from "@/app/accounting/actions"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  // Use service role to bypass RLS when reading the member's own attendance records
  const adminSupabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Family info: only fetch when the member is assigned to a family.
  let familyInfo: { id: string; name: string; headName: string | null; isHead: boolean } | null = null
  if (profile?.family_id) {
    const { data: family } = await adminSupabase
      .from("families")
      .select("id, name, head_id")
      .eq("id", profile.family_id)
      .maybeSingle()
    if (family) {
      let headName: string | null = null
      if (family.head_id) {
        const { data: head } = await adminSupabase
          .from("profiles")
          .select("full_name")
          .eq("id", family.head_id)
          .maybeSingle()
        headName = head?.full_name || null
      }
      familyInfo = {
        id: family.id,
        name: family.name,
        headName,
        isHead: family.head_id === user.id,
      }
    }
  }

  // Get recent attendance from member_attendance table
  const { data: attendance } = await adminSupabase
    .from("member_attendance")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const initials = getInitials(profile?.full_name || "User")
  
  // Fetch meal ticket if it exists
  const { ticket } = await getUserMealTicket();
  
  // Fetch received gifts
  const { assignments: gifts } = await getUserAssetAssignments();

  // Fetch active battles
  const { battles: activeBattles } = await getActiveBattles();
  const partyBalance = await getProfilePartyBalance(profile?.id || user.id);

  return (
    <>
      <WelcomeBanner
        fullName={profile?.full_name || "Member"}
        rank={profile?.rank}
        department={profile?.department}
        avatarUrl={profile?.avatar_url || undefined}
        initials={initials}
        points={profile?.points || 0}
        moneyBalance={partyBalance}
      />

      <div className="mt-8">
        <TopNewsBattles battles={activeBattles || []} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
        {/* Row 1 Left: Digital Pass */}
        <IdCardQr userId={profile?.id || user.id} />

        {/* Row 1 Right: Profile Settings */}
        <Link href="/dashboard/settings">
          <div className="bg-white/80 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] transition-all hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.14)] hover:border-indigo-100/80 cursor-pointer group h-full">
            <div className="flex items-start gap-5">
              <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-[18px] shadow-sm border border-indigo-100/50 group-hover:from-indigo-100 group-hover:to-violet-100 transition-all shrink-0">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-[20px] text-slate-800 font-extrabold tracking-tight group-hover:text-indigo-700 transition-colors">Profile Settings</h3>
                <p className="text-slate-500 text-[15px] mt-1.5 font-medium leading-relaxed">Update your personal information, upload a profile photo, and manage your account details.</p>
                <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-indigo-600 group-hover:gap-3 transition-all">
                  Edit Profile
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Row 2 Left: Meal Ticket */}
        <MealTicketCard initialTicketCode={ticket?.ticket_code} />

        {/* Row 2 Right: Dining Hall */}
        <Link href="/dashboard/dining-hall">
          <div className="bg-white/80 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] transition-all hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.14)] hover:border-indigo-100/80 cursor-pointer group h-full">
            <div className="flex items-start gap-5">
              <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-[18px] shadow-sm border border-indigo-100/50 group-hover:from-indigo-100 group-hover:to-violet-100 transition-all shrink-0">
                <Utensils className="w-7 h-7 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-[20px] text-slate-800 font-extrabold tracking-tight group-hover:text-indigo-700 transition-colors">Dining Hall</h3>
                <p className="text-slate-500 text-[15px] mt-1.5 font-medium leading-relaxed">View the camp meal timetable and points for each meal.</p>
                <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-indigo-600 group-hover:gap-3 transition-all">
                  Open Timetable
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Row 3 Left: Upcoming Events */}
        <UpcomingEvents />

        {/* Row 3 Right: Quick Stats */}
        <QuickStats
          rank={profile?.rank || "C-Multitude"}
          department={profile?.department || ""}
          assembly={profile?.assembly || ""}
          eventsCount={attendance?.length || 0}
          family={familyInfo}
        />

        {/* Row 3: Recent Activity & Gifts */}
        <div className="xl:col-span-2 space-y-8">
          {gifts && gifts.length > 0 && <ReceivedGifts gifts={gifts} />}
          <RecentActivity attendance={attendance || []} />
        </div>
      </div>
    </>
  )
}
