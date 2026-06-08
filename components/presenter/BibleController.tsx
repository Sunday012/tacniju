"use client";

import { useState } from "react";
import { setPresentationState } from "@/app/actions/presentation";
import { toast } from "sonner";
import { Loader2, BookOpen, Search, Send, ChevronLeft, ChevronRight } from "lucide-react";

const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
  "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
  "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians",
  "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
  "1 John", "2 John", "3 John", "Jude", "Revelation"
];

const TRANSLATIONS = [
  { label: "KJV", value: "kjv" },
  { label: "WEB", value: "web" },
  { label: "ASV", value: "asv" },
  { label: "BBE", value: "bbe" },
  { label: "YLT", value: "ylt" },
  { label: "OEB", value: "oeb" },
];

export function BibleController() {
  const [reference, setReference] = useState("");
  const [book, setBook] = useState("John");
  const [chapter, setChapter] = useState("3");
  const [verseRange, setVerseRange] = useState("16");
  const [translation, setTranslation] = useState("kjv");
  const [loading, setLoading] = useState(false);
  const [verses, setVerses] = useState<any[]>([]);
  const [bookAndChapter, setBookAndChapter] = useState("");
  const [sending, setSending] = useState<string | null>(null);
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setReference(val);

    // Extract letters and numbers before the first colon (e.g., "1 John 3" or "Gen")
    // Let's just find if the text matches the start of any book.
    // We only show suggestions if there's no colon yet, and they are typing letters.
    if (!val || val.includes(":")) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Try to isolate the "book" part of their typing.
    // E.g., if they typed "1 Jo", book query is "1 Jo". 
    // If they typed "1 John 3", we shouldn't show book suggestions anymore.
    // Let's check if the last character is a space and there's a number after space.
    const hasChapterNumber = /\s\d+$/.test(val);
    if (hasChapterNumber) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const query = val.toLowerCase();
    const matches = BIBLE_BOOKS.filter(book => book.toLowerCase().startsWith(query) || book.toLowerCase().includes(query));
    
    // If they typed exactly a book name, we might still show it or hide it.
    if (matches.length > 0) {
      setSuggestions(matches.slice(0, 5)); // Show top 5
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectBook = (book: string) => {
    setBook(book);
    setReference(`${book} `);
    setSuggestions([]);
    setShowSuggestions(false);
    document.getElementById('bible-input')?.focus();
  };

  const applyStructuredReference = (nextBook = book, nextChapter = chapter, nextVerseRange = verseRange) => {
    const ref = [nextBook, nextChapter].filter(Boolean).join(" ");
    setReference(nextVerseRange ? `${ref}:${nextVerseRange}` : ref);
  };

  const searchBible = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) return;
    
    setLoading(true);
    setShowSuggestions(false);
    try {
      const res = await fetch(`https://bible-api.com/${encodeURIComponent(reference)}?translation=${translation}`);
      const data = await res.json();
      
      if (data.error || !data.verses) {
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
        version: translation.toUpperCase()
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

      <form onSubmit={searchBible} className="flex gap-3 mb-6 relative">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="bible-input"
            value={reference}
            onChange={handleInputChange}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="e.g., John 3:16 or Genesis 1:1-5"
            autoComplete="off"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
          
          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-50">
              {suggestions.map((book) => (
                <div
                  key={book}
                  onClick={() => handleSelectBook(book)}
                  className="px-4 py-3 hover:bg-amber-50 cursor-pointer border-b border-slate-50 last:border-0 flex items-center gap-3 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-amber-500/50" />
                  <span className="font-bold text-slate-700">{book}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !reference.trim()}
          className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 min-w-[100px] flex justify-center items-center"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
        </button>
      </form>

      <div className="mb-6 grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:grid-cols-[minmax(0,1fr)_90px_120px_110px_auto]">
        <select
          value={book}
          onChange={(e) => {
            setBook(e.target.value);
            applyStructuredReference(e.target.value, chapter, verseRange);
          }}
          className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-amber-400"
        >
          {BIBLE_BOOKS.map(bookName => <option key={bookName} value={bookName}>{bookName}</option>)}
        </select>
        <input
          type="number"
          min="1"
          value={chapter}
          onChange={(e) => {
            setChapter(e.target.value);
            applyStructuredReference(book, e.target.value, verseRange);
          }}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-amber-400"
          placeholder="Chapter"
        />
        <input
          value={verseRange}
          onChange={(e) => {
            setVerseRange(e.target.value);
            applyStructuredReference(book, chapter, e.target.value);
          }}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-amber-400"
          placeholder="1-5"
        />
        <select
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-amber-400"
        >
          {TRANSLATIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <button
          type="button"
          onClick={() => applyStructuredReference()}
          className="h-11 rounded-xl border border-amber-200 bg-white px-4 text-sm font-black text-amber-700 hover:bg-amber-50"
        >
          Use
        </button>
      </div>

      {verses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-amber-50 border border-amber-100 px-4 py-2 rounded-lg">
            <h3 className="font-bold text-amber-800">{bookAndChapter}</h3>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">{translation.toUpperCase()}</span>
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
