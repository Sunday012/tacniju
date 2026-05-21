"use client";

import { Check, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { updateStallOrderStatus } from "@/app/actions/assets";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function StallOrdersTable({ orders }: { orders: any[] }) {
  const [processing, setProcessing] = useState<string | null>(null);

  async function handleStatusUpdate(orderId: string, status: string, assetId: string, paymentMethod: string, profileId: string, pointPrice: number) {
    setProcessing(orderId);
    try {
      const res = await updateStallOrderStatus(orderId, status, assetId, paymentMethod, profileId, pointPrice);
      if (res.error) toast.error(res.error);
      else toast.success(`Order ${status} successfully`);
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setProcessing(null);
    }
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
        <p className="text-slate-500 font-medium">No stall orders found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase">Date</th>
              <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase">Item</th>
              <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase">Member</th>
              <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase">Payment</th>
              <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase">Status</th>
              <th className="px-6 py-4 font-bold text-slate-700 text-sm tracking-wider uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-500">
                  {new Date(order.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-800">{order.asset?.name}</p>
                  <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md mt-1 inline-block">
                    {order.asset?.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-indigo-600">{order.profile?.full_name}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{order.profile?.reservation_number || "No Res. #"}</p>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className={order.payment_method === 'points' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}>
                    {order.payment_method === 'points' ? `${order.asset?.point_price} pts` : `₦${order.asset?.money_price}`}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge className={
                    order.status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' :
                    order.status === 'approved' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' :
                    'bg-rose-100 text-rose-800 hover:bg-rose-100'
                  }>
                    {order.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  {order.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'approved', order.asset_id, order.payment_method, order.profile_id, order.asset?.point_price || 0)}
                        disabled={processing === order.id}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors border border-emerald-200/50"
                        title="Approve Order"
                      >
                        {processing === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'rejected', order.asset_id, order.payment_method, order.profile_id, order.asset?.point_price || 0)}
                        disabled={processing === order.id}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-rose-200/50"
                        title="Reject Order"
                      >
                        {processing === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
