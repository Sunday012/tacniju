"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteMealTicket } from "@/app/actions/meal-tickets";
import { toast } from "sonner";

export function DeleteTicketButton({ ticketId }: { ticketId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this meal ticket? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await deleteMealTicket(ticketId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Meal ticket deleted successfully.");
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
      title="Delete Ticket"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
