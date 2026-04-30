"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteCompetition } from "@/app/actions/competitions";
import { toast } from "sonner";

export function DeleteCompetitionButton({ competitionId }: { competitionId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault(); // prevent triggering the Link
    if (!window.confirm("Are you sure you want to delete this competition? All entries will be lost.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await deleteCompetition(competitionId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Competition deleted successfully.");
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
      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
      title="Delete Competition"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
