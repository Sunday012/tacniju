import { createClient } from "@/lib/server";
import { ShoppingBag, Star, Info, Box } from "lucide-react";
import { RequestItemModal } from "@/components/stall/RequestItemModal";

export const dynamic = "force-dynamic";

export default async function StallPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch visible assets
  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  // Fetch user's profile points
  let profilePoints = 0;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", user.id)
      .single();
    if (profile) profilePoints = profile.points || 0;
  }

  const stallItems = assets?.filter(a => a.is_stall_item) || [];
  const programStock = assets?.filter(a => !a.is_stall_item) || [];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-10 h-10 text-indigo-600" />
            Mini Store
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Browse available items, purchase with points, or request program stock.</p>
        </div>

        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 min-w-[200px]">
          <div className="p-2.5 bg-amber-50 rounded-xl">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Your Points</p>
            <p className="text-2xl font-black text-slate-800 leading-none">{profilePoints}</p>
          </div>
        </div>
      </div>

      <div className="space-y-16">
        {/* Stall Items */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-amber-100 pb-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-sm border border-amber-100">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">The Stall</h2>
          </div>

          {stallItems.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-12 text-center">
              <p className="text-slate-500 font-medium text-lg">No store items are available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {stallItems.map(item => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-bl-xl border-l border-b border-indigo-100 uppercase">
                    {item.category}
                  </div>
                  
                  <div className="mt-6 flex-1">
                    <h3 className="text-xl font-black text-slate-800 leading-tight mb-2">{item.name}</h3>
                    
                    <div className="flex items-center gap-4 mt-6">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Points</p>
                        <p className="text-xl font-black text-indigo-600 flex items-center gap-1">
                          {item.point_price}
                        </p>
                      </div>
                      <div className="w-px h-8 bg-slate-200"></div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Money</p>
                        <p className="text-xl font-black text-emerald-600 flex items-center gap-1">
                          <span className="text-sm">₦</span>{item.money_price}
                        </p>
                      </div>
                    </div>
                  </div>

                  <RequestItemModal asset={item} profilePoints={profilePoints} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Program Stock */}
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-indigo-100 pb-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm border border-indigo-100">
              <Box className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">Program Stock Overview</h2>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3 mb-6 text-indigo-800">
            <Info className="w-5 h-5 shrink-0 mt-0.5 text-indigo-600" />
            <p className="text-sm font-medium">These items are available internally. Please contact an admin if you need any of these resources.</p>
          </div>

          {programStock.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-12 text-center">
              <p className="text-slate-500 font-medium text-lg">No program stock is currently visible.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {programStock.map(item => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                  <div>
                    <h3 className="font-bold text-slate-800">{item.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                      item.available_quantity > 0 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {item.available_quantity > 0 ? 'Available' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
