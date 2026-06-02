import Link from "next/link"
import { createClient } from "@/lib/server"
import { isGuestProfile } from "@/lib/profile-kind"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function AdminGuestsPage() {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name", { ascending: true })

  const guests = (profiles || []).filter(profile => isGuestProfile(profile))

  return (
    <div className="p-6 md:p-10 relative">
      <main className="max-w-7xl mx-auto z-10 relative">
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Guest Directory</h1>
            <p className="text-slate-500 mt-2 font-medium">Separate guest list and count, kept out of member calculations.</p>
            <div className="mt-3">
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                {guests.length} {guests.length === 1 ? "Guest" : "Guests"}
              </Badge>
            </div>
          </div>
          <Link href="/admin" className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-medium hover:bg-slate-50 transition-colors">
            Back to Admin Dashboard
          </Link>
        </div>

        {guests.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-10 text-center text-slate-500 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)]">
            No guests registered yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {guests.map((guest: any) => (
              <Card key={guest.id} className="bg-white border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-11 w-11 border border-amber-100 shrink-0">
                      <AvatarImage src={guest.avatar_url || ""} />
                      <AvatarFallback className="bg-amber-100 text-amber-800 font-bold text-xs">
                        {(guest.full_name || "Guest").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold text-lg text-slate-800 leading-tight truncate">{guest.full_name || "Unnamed Guest"}</h2>
                      <p className="text-xs text-slate-500 mt-1">{guest.email || guest.username || "No contact email"}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50">
                          Guest
                        </Badge>
                        {guest.phone_number && (
                          <Badge variant="outline" className="text-xs">
                            {guest.phone_number}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
