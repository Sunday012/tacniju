import { getAssets, getAllAssetAssignments } from "@/app/actions/assets";
import { Plus, Gift, Box, AlertCircle } from "lucide-react";
import Link from "next/link";
import { AddAssetModal } from "@/components/admin/stock/AddAssetModal";
import { DistributeGiftModal } from "@/components/admin/stock/DistributeGiftModal";
import { EditAssetModal } from "@/components/admin/stock/EditAssetModal";
import { DeleteAssetButton } from "@/components/admin/stock/DeleteAssetButton";
import { RevokeGiftButton } from "@/components/admin/stock/RevokeGiftButton";
import { VisibilityToggle } from "@/components/admin/stock/VisibilityToggle";
import { StallOrdersTable } from "@/components/admin/stock/StallOrdersTable";
import { getAdminStallOrders } from "@/app/actions/assets";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const { assets, error } = await getAssets();
  const { assignments: allAssignments } = await getAllAssetAssignments();
  const { orders: stallOrders } = await getAdminStallOrders();

  
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
              {asset.is_gift && !asset.is_stall_item && (
                <div className="absolute top-0 right-0 bg-indigo-50 text-indigo-600 text-[11px] font-bold px-3 py-1.5 rounded-bl-2xl border-l border-b border-indigo-100/50 uppercase tracking-wider">
                  Gift Item
                </div>
              )}
              {asset.is_stall_item && (
                <div className="absolute top-0 right-0 bg-amber-50 text-amber-600 text-[11px] font-bold px-3 py-1.5 rounded-bl-2xl border-l border-b border-amber-100/50 uppercase tracking-wider flex items-center gap-1">
                  Stall Item
                </div>
              )}
              {!asset.is_gift && !asset.is_stall_item && (
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
                  <VisibilityToggle assetId={asset.id} isVisible={asset.is_visible} />
                  <EditAssetModal asset={asset} />
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

        {/* Gift Distributed Records Section */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-50 rounded-xl">
              <Gift className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Gift Distributed Records</h2>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase">Date</th>
                    <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase">Gift</th>
                    <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase">Recipient</th>
                    <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase">Distributed By</th>
                    <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!allAssignments || allAssignments.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                        No gifts have been distributed yet.
                      </td>
                    </tr>
                  ) : (
                    allAssignments.map((assignment: any) => (
                      <tr key={assignment.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-500">
                          {new Date(assignment.assigned_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-800">{assignment.asset?.name}</p>
                          <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md mt-1 inline-block">
                            {assignment.asset?.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-indigo-600">{assignment.profile?.full_name}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{assignment.profile?.reservation_number || "No Res. #"}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                          {assignment.assigned_by_profile?.full_name || "Unknown Admin"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <RevokeGiftButton assignmentId={assignment.id} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Stall Orders Section */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-amber-50 rounded-xl">
              <Box className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Stall Orders</h2>
          </div>
          <StallOrdersTable orders={stallOrders || []} />
        </div>

      </div>
    </div>
  );
}
