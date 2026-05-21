"use client";

import { useState } from "react";
import { setPresentationState } from "@/app/actions/presentation";
import { toast } from "sonner";
import { Loader2, Type, Send } from "lucide-react";

export function CustomTextController() {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await setPresentationState(true, "text", { text: text.trim() });
      if (res.error) toast.error(res.error);
      else toast.success("Sent to screen");
    } catch (e) {
      toast.error("Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="p-2.5 bg-indigo-50 rounded-xl">
          <Type className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Quick Text</h2>
      </div>

      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message to project instantly..."
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none h-32 font-medium"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-[0_4px_16px_rgba(79,70,229,0.3)] disabled:opacity-50"
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          Project Text
        </button>
      </div>
    </div>
  );
}
