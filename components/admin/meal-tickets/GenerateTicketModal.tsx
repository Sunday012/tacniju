"use client";

import { useState } from "react";
import { Loader2, Ticket, Search, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { adminGenerateMealTicket } from "@/app/actions/meal-tickets";
import { toast } from "sonner";
import { createClient } from "@/lib/client";

export function GenerateTicketModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  
  // Extra fields
  const [amount, setAmount] = useState<string>("7000");
  const [transactionType, setTransactionType] = useState<string>("INTER-BANK");
  const [remark, setRemark] = useState<string>("");
  const [beneficiaryName, setBeneficiaryName] = useState<string>("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, reservation_number, phone_number")
      .or(`full_name.ilike.%${searchQuery}%,reservation_number.ilike.%${searchQuery}%`)
      .limit(5);

    if (error) {
      toast.error("Failed to search members");
    } else {
      setSearchResults(data || []);
    }
    setSearching(false);
  };

  const handleGenerate = async () => {
    if (!selectedMember) return;
    
    setLoading(true);
    try {
      const res = await adminGenerateMealTicket(
        selectedMember.id, 
        parseFloat(amount), 
        transactionType, 
        remark, 
        beneficiaryName || selectedMember.full_name
      );
      
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Meal ticket generated successfully!");
        setOpen(false);
        // Reset state
        setSelectedMember(null);
        setSearchQuery("");
        setSearchResults([]);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        setSelectedMember(null);
        setSearchQuery("");
        setSearchResults([]);
      }
    }}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-[0_4px_16px_rgba(79,70,229,0.3)]">
          <Ticket className="h-5 w-5" />
          <span>Generate Ticket</span>
        </button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[450px] bg-white border-slate-200 text-slate-800 p-0 shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl flex items-center gap-2 font-extrabold text-slate-800">
              <UserPlus className="h-5 w-5 text-indigo-500" />
              {selectedMember ? "Ticket Details" : "Generate Meal Ticket"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-1">
              {selectedMember 
                ? `Provide details for ${selectedMember.full_name}'s ticket.`
                : "Search for a member by name or reservation number."}
            </DialogDescription>
          </DialogHeader>

          {!selectedMember ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Name or Res. Number..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                >
                  {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </button>
              </div>

              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{member.full_name}</p>
                        <p className="text-xs text-slate-500 font-mono">{member.reservation_number || "No Res. No."}</p>
                      </div>
                      <button
                        onClick={() => setSelectedMember(member)}
                        className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        Select
                      </button>
                    </div>
                  ))
                ) : searchQuery && !searching ? (
                  <p className="text-center text-sm text-slate-500 py-4">No members found.</p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Transaction Amount (N)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Transaction Type</label>
                <input
                  type="text"
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Beneficiary Name (Optional)</label>
                <input
                  type="text"
                  placeholder={selectedMember.full_name}
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Remark</label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                  placeholder="e.g. For Sunday Service Meal"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedMember(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-[0_4px_16px_rgba(79,70,229,0.3)] flex items-center justify-center"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm & Generate"}
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
