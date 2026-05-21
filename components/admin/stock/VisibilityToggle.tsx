"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toggleAssetVisibility } from "@/app/actions/assets";
import { toast } from "sonner";

export function VisibilityToggle({ assetId, isVisible }: { assetId: string, isVisible: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      const res = await toggleAssetVisibility(assetId, isVisible);
      if (res.error) toast.error(res.error);
      else toast.success(isVisible ? "Hidden from members" : "Visible to members");
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-lg transition-colors shadow-sm border ${
        isVisible 
          ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100" 
          : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
      }`}
      title={isVisible ? "Visible to members (Click to hide)" : "Hidden from members (Click to show)"}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isVisible ? (
        <Eye className="h-4 w-4" />
      ) : (
        <EyeOff className="h-4 w-4" />
      )}
    </button>
  );
}
