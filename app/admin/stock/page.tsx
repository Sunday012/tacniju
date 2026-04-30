import { getAssets } from "@/app/actions/assets";
import { Plus, Gift, Box, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AddAssetModal } from "@/components/admin/stock/AddAssetModal";
import { DistributeGiftModal } from "@/components/admin/stock/DistributeGiftModal";
import { DeleteAssetButton } from "@/components/admin/stock/DeleteAssetButton";
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  const { assets, error } = await getAssets();

  return (
    <div className="min-h-screen bg-[#F4F7FA] font-sans selection:bg-indigo-500/30 relative overflow-x-hidden p-6 md:p-10">
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-indigo-200/40 via-violet-100/20 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none -z-10 translate-x-1/3 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-100/40 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none -z-10 -translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-6xl mx-auto w-full space-y-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <button className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-sm">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Program Stock & Assets</h1>
              <p className="text-slate-500 mt-1 font-medium">Manage internal supplies and distribute gifts to attendees.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DistributeGiftModal assets={assets || []} />
            <AddAssetModal />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 flex items-center gap-3 shadow-sm">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!error && assets && assets.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed border-slate-300 rounded-[2rem] bg-white/50 backdrop-blur-sm">
              <Box className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No Assets Found</h3>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">
                You haven't added any program stock yet. Add your first item to get started.
              </p>
            </div>
          )}

          {assets?.map((asset: any) => (
            <div 
              key={asset.id}
              className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 flex flex-col hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.04)] transition-all relative overflow-hidden"
            >
              {asset.is_gift && (
                <div className="absolute top-0 right-0 bg-indigo-50 text-indigo-600 text-[11px] font-bold px-3 py-1.5 rounded-bl-2xl border-l border-b border-indigo-100/50 uppercase tracking-wider">
                  Gift Item
                </div>
              )}
              {!asset.is_gift && (
                <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-[11px] font-bold px-3 py-1.5 rounded-bl-2xl border-l border-b border-slate-200/50 uppercase tracking-wider">
                  Internal Use
                </div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                  {asset.is_gift ? (
                    <Gift className="h-6 w-6 text-indigo-500" />
                  ) : (
                    <Box className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-extrabold text-slate-800 truncate max-w-[200px]" title={asset.name}>
                    {asset.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      {asset.category}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="absolute top-8 right-4 flex items-center gap-2">
                  <DeleteAssetButton assetId={asset.id} />
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-widest mb-1">Available</p>
                  <p className={`text-2xl font-black ${asset.available_quantity === 0 ? 'text-rose-500' : 'text-slate-800'}`}>
                    {asset.available_quantity}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-widest mb-1">Total</p>
                  <p className="text-xl font-bold text-slate-500">{asset.total_quantity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
