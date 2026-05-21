"use client";

import { useState } from "react";
import { Loader2, ShoppingCart, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createStallOrder } from "@/app/actions/assets";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function RequestItemModal({ asset, profilePoints }: { asset: any, profilePoints: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"points" | "money">("points");

  async function handleSubmit() {
    if (paymentMethod === "points" && profilePoints < asset.point_price) {
      toast.error("You do not have enough points for this item.");
      return;
    }

    setLoading(true);
    try {
      const res = await createStallOrder(asset.id, paymentMethod);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Request placed successfully!");
        setOpen(false);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button 
          className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-[0_4px_16px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_20px_rgba(79,70,229,0.4)]"
          disabled={asset.available_quantity <= 0}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>{asset.available_quantity > 0 ? 'Request Item' : 'Out of Stock'}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[425px] bg-white border-slate-200 text-slate-800 p-0 shadow-2xl rounded-2xl mx-auto">
        <div className="p-4 sm:p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-extrabold text-slate-800">Request {asset.name}</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-1">
              Choose how you would like to pay for this item.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
              <span className="font-bold text-slate-700">Your Balance:</span>
              <Badge className="bg-indigo-100 text-indigo-800 font-bold hover:bg-indigo-100 text-sm py-1 px-3">
                {profilePoints} pts
              </Badge>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("points")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === "points" 
                      ? "border-indigo-600 bg-indigo-50 shadow-sm" 
                      : "border-slate-200 hover:border-indigo-200 bg-white"
                  }`}
                >
                  <span className={`font-bold ${paymentMethod === "points" ? "text-indigo-700" : "text-slate-600"}`}>Points</span>
                  <span className={`text-lg font-black ${paymentMethod === "points" ? "text-indigo-600" : "text-slate-500"}`}>
                    {asset.point_price}
                  </span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod("money")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === "money" 
                      ? "border-emerald-600 bg-emerald-50 shadow-sm" 
                      : "border-slate-200 hover:border-emerald-200 bg-white"
                  }`}
                >
                  <span className={`font-bold ${paymentMethod === "money" ? "text-emerald-700" : "text-slate-600"}`}>Money</span>
                  <span className={`text-lg font-black ${paymentMethod === "money" ? "text-emerald-600" : "text-slate-500"}`}>
                    ₦{asset.money_price}
                  </span>
                </button>
              </div>
            </div>

            {paymentMethod === "points" && profilePoints < asset.point_price && (
              <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p>You do not have enough points to purchase this item. Please select Money or earn more points.</p>
              </div>
            )}

            {paymentMethod === "money" && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-medium">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p>By proceeding, an order will be placed. Please see an admin to make your payment and receive your item.</p>
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || (paymentMethod === "points" && profilePoints < asset.point_price)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition-colors shadow-[0_4px_12px_rgba(79,70,229,0.2)] disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Request"}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
