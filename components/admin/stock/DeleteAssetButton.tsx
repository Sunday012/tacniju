"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteAsset } from "@/app/actions/assets";
import { toast } from "sonner";

export function DeleteAssetButton({ assetId }: { assetId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this asset? All assignments and records will be lost.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await deleteAsset(assetId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Asset deleted successfully.");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="p-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors border border-slate-100 hover:border-rose-200 shadow-sm disabled:opacity-50"
      title="Delete Asset"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
