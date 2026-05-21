"use client";

import { useState } from "react";
import { setPresentationState } from "@/app/actions/presentation";
import { toast } from "sonner";
import { Loader2, BookOpen, Search, Send, ChevronLeft, ChevronRight } from "lucide-react";

export function BibleController() {
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [verses, setVerses] = useState<any[]>([]);
  const [bookAndChapter, setBookAndChapter] = useState("");
  const [sending, setSending] = useState<string | null>(null);

  const searchBible = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`https://bible-api.com/${encodeURIComponent(reference)}?translation=kjv`);
      const data = await res.json();
      
      if (data.error) {
        toast.error("Verse not found");
        setVerses([]);
      } else {
        setVerses(data.verses);
        setBookAndChapter(`${data.verses[0].book_name} ${data.verses[0].chapter}`);
      }
    } catch (err) {
      toast.error("Failed to fetch Bible verses");
      setVerses([]);
    } finally {
      setLoading(false);
    }
  };

  const projectVerse = async (verse: any) => {
    setSending(verse.verse);
    try {
      const res = await setPresentationState(true, "bible", {
        reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
        text: verse.text.trim(),
        version: "KJV"
      });
      if (res.error) toast.error(res.error);
      else toast.success("Verse projected");
    } catch (e) {
      toast.error("Failed to project verse");
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="p-2.5 bg-amber-50 rounded-xl">
          <BookOpen className="w-5 h-5 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Bible Projection</h2>
      </div>

      <form onSubmit={searchBible} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g., John 3:16 or Genesis 1:1-5"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !reference.trim()}
          className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 min-w-[100px] flex justify-center items-center"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
        </button>
      </form>

      {verses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-amber-50 border border-amber-100 px-4 py-2 rounded-lg">
            <h3 className="font-bold text-amber-800">{bookAndChapter}</h3>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">KJV</span>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {verses.map((verse) => (
              <div 
                key={verse.verse} 
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition-colors"
              >
                <div className="flex gap-3 flex-1">
                  <span className="font-black text-amber-500 text-lg w-8 shrink-0">{verse.verse}</span>
                  <p className="text-slate-700 font-medium leading-relaxed">{verse.text}</p>
                </div>
                <button
                  onClick={() => projectVerse(verse)}
                  disabled={sending === verse.verse}
                  className="shrink-0 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-700 hover:text-amber-700 px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50 shadow-sm"
                >
                  {sending === verse.verse ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Project
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
