"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createAsset } from "@/app/actions/assets";
import { toast } from "sonner";

export function AddAssetModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const res = await createAsset(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Asset added successfully!");
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
        <button className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl font-bold transition-colors shadow-sm border border-indigo-200/50">
          <Plus className="h-5 w-5" />
          <span>Add Asset</span>
        </button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto bg-white border-slate-200 text-slate-800 p-0 shadow-2xl rounded-2xl mx-auto">
        <div className="p-4 sm:p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-extrabold text-slate-800">Add New Asset</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-1">
              Add a new item to the program stock.
            </DialogDescription>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-bold text-slate-700">
                Asset Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                placeholder="e.g., Event Tote Bag"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-bold text-slate-700">
                Category
              </label>
              <input
                id="category"
                name="category"
                type="text"
                required
                className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                placeholder="e.g., Office Supplies, Books, Apparel"
              />
            </div>

            <div className="flex items-center space-x-3 py-2 bg-slate-50 px-4 rounded-xl border border-slate-100">
              <input
                type="checkbox"
                id="is_gift"
                name="is_gift"
                className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/50 focus:ring-offset-white"
              />
              <label htmlFor="is_gift" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                This is a gift <span className="font-medium text-slate-500">(can be distributed)</span>
              </label>
            </div>

            <div className="flex flex-col gap-4 py-3 bg-amber-50/50 px-4 rounded-xl border border-amber-100/50">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_stall_item"
                  name="is_stall_item"
                  className="h-5 w-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500/50 focus:ring-offset-white"
                />
                <label htmlFor="is_stall_item" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                  Stall Item <span className="font-medium text-slate-500">(available for member purchase)</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="money_price" className="text-xs font-bold text-slate-700">
                    Money Price (₦)
                  </label>
                  <input
                    id="money_price"
                    name="money_price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue="0"
                    className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="point_price" className="text-xs font-bold text-slate-700">
                    Point Price
                  </label>
                  <input
                    id="point_price"
                    name="point_price"
                    type="number"
                    min="0"
                    defaultValue="0"
                    className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-bold text-slate-700">
                Initial Quantity
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                required
                className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                placeholder="0"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition-colors shadow-[0_4px_12px_rgba(79,70,229,0.2)] disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Asset"}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
