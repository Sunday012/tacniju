import { getAssets } from "@/app/actions/assets";
import { Plus, Gift, Box, AlertCircle } from "lucide-react";
import Link from "next/link";
import { AddAssetModal } from "@/components/admin/stock/AddAssetModal";
import { DistributeGiftModal } from "@/components/admin/stock/DistributeGiftModal";
import { EditAssetModal } from "@/components/admin/stock/EditAssetModal";
import { DeleteAssetButton } from "@/components/admin/stock/DeleteAssetButton";
import { VisibilityToggle } from "@/components/admin/stock/VisibilityToggle";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const { assets, error } = await getAssets();
  
  return (
    <div className="p-6 md:p-10 relative">
      <div className="max-w-6xl mx-auto w-full space-y-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Box className="w-6 h-6 text-indigo-600" />
            </div>
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

        {/* Compact Grid View for Assets */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col hover:shadow-md transition-all relative overflow-hidden"
            >
              {asset.is_gift && !asset.is_stall_item && (
                <div className="absolute top-0 right-0 bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-bl-lg border-l border-b border-indigo-100/50 uppercase tracking-wider">
                  Gift
                </div>
              )}
              {asset.is_stall_item && (
                <div className="absolute top-0 right-0 bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-1 rounded-bl-lg border-l border-b border-amber-100/50 uppercase tracking-wider">
                  Stall
                </div>
              )}

              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 shrink-0">
                  {asset.is_gift ? (
                    <Gift className="h-5 w-5 text-indigo-500" />
                  ) : (
                    <Box className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <div className="pt-0.5 overflow-hidden">
                  <h3 className="text-sm font-bold text-slate-800 truncate" title={asset.name}>
                    {asset.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {asset.category}
                    </span>
                  </div>
                  {asset.gift_number && <p className="mt-1 truncate font-mono text-[10px] font-bold text-indigo-600">{asset.gift_number}</p>}
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
                <div className="flex gap-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Avail</p>
                    <p className={`text-lg font-black leading-none ${asset.available_quantity === 0 ? 'text-rose-500' : 'text-slate-800'}`}>
                      {asset.available_quantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Total</p>
                    <p className="text-sm font-bold text-slate-500 leading-none mt-1">{asset.total_quantity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <VisibilityToggle assetId={asset.id} isVisible={asset.is_visible} />
                  <EditAssetModal asset={asset} />
                  <DeleteAssetButton assetId={asset.id} />
                </div>
              </div>
            </div>
          ))}
        </div>



      </div>
    </div>
  );
}
