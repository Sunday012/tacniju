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
import { createCompetition } from "@/app/actions/competitions";
import { toast } from "sonner";

export function AddCompetitionModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const res = await createCompetition(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Competition created successfully!");
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
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-[0_4px_16px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_20px_rgba(79,70,229,0.4)]">
          <Plus className="h-5 w-5" />
          <span>Create Competition</span>
        </button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto bg-white border-slate-200 text-slate-800 p-0 shadow-2xl rounded-2xl mx-auto">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-extrabold text-slate-800">Create New Competition</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-1">
              Add a new competition or program to track entries.
            </DialogDescription>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-bold text-slate-700">
                Competition Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                placeholder="e.g., Youth Bible Quiz"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-bold text-slate-700">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 resize-none"
                placeholder="Details about this competition..."
              ></textarea>
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
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save"}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
