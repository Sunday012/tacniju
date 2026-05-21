import { Gift, CalendarDays } from "lucide-react"

export function ReceivedGifts({ gifts }: { gifts: any[] }) {
  if (!gifts || gifts.length === 0) {
    return null; // Don't show the section if they have no gifts
  }

  return (
    <div className="bg-white/80 backdrop-blur-3xl border border-white/60 rounded-[2rem] p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-rose-50 to-pink-50 rounded-[14px] shadow-sm border border-rose-100/50">
          <Gift className="w-5 h-5 text-rose-600" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Received Gifts</h3>
      </div>
      
      <div className="space-y-4">
        {gifts.map((gift) => {
          const date = new Date(gift.assigned_at)
          // Handle Supabase returning array vs object based on foreign key relationship
          const assetData = Array.isArray(gift.asset) ? gift.asset[0] : gift.asset;
          
          return (
            <div
              key={gift.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-100 hover:border-rose-100 hover:shadow-md transition-all duration-300 gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-rose-700 transition-colors">
                    {assetData?.name || "Special Gift"}
                  </h4>
                  <p className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md inline-block mt-1 uppercase tracking-wider">
                    {assetData?.category || "Gift"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap">
                <CalendarDays className="w-4 h-4" />
                {date.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
