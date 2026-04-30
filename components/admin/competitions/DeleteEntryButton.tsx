"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { removeCompetitionEntry } from "@/app/actions/competitions";
import { toast } from "sonner";

export function DeleteEntryButton({ entryId, competitionId }: { entryId: string, competitionId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to remove this person from the competition?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await removeCompetitionEntry(entryId, competitionId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Entry removed successfully.");
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
      title="Remove Participant"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
