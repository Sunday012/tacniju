"use client";

import { useState, useEffect } from "react";
import { getSongs, createSong } from "@/app/actions/songs";
import { setPresentationState } from "@/app/actions/presentation";
import { toast } from "sonner";
import { Loader2, Music, Send, Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function SongsController() {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [sending, setSending] = useState<number | null>(null);
  
  const [openAdd, setOpenAdd] = useState(false);
  const [adding, setAdding] = useState(false);

  const fetchSongs = async () => {
    setLoading(true);
    const res = await getSongs();
    if (res.songs) setSongs(res.songs);
    setLoading(false);
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleAddSong = async (formData: FormData) => {
    setAdding(true);
    try {
      const res = await createSong(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Song added successfully");
        setOpenAdd(false);
        fetchSongs();
      }
    } catch (e) {
      toast.error("Failed to add song");
    } finally {
      setAdding(false);
    }
  };

  const projectStanza = async (stanza: any, index: number) => {
    setSending(index);
    try {
      const res = await setPresentationState(true, "lyrics", {
        title: selectedSong.title,
        text: stanza.content,
        label: stanza.label
      });
      if (res.error) toast.error(res.error);
      else toast.success("Lyrics projected");
    } catch (e) {
      toast.error("Failed to project lyrics");
    } finally {
      setSending(null);
    }
  };

  const filteredSongs = songs.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-xl">
            <Music className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Hymns & Lyrics</h2>
        </div>
        
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors border border-slate-200">
              <Plus className="w-4 h-4" /> Add Song
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Song</DialogTitle>
            </DialogHeader>
            <form action={handleAddSong} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Song Title</label>
                <input name="title" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Type</label>
                <select name="type" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                  <option value="hymn">Hymn</option>
                  <option value="contemporary">Contemporary / Worship</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Lyrics (Separate stanzas with empty line)</label>
                <textarea name="lyrics" required rows={8} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
              </div>
              <button disabled={adding} type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded-xl">
                {adding ? "Saving..." : "Save Song"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Song List */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-[400px]">
          <div className="p-3 border-b border-slate-200 bg-slate-50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                placeholder="Search songs..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
            {loading ? (
              <div className="p-8 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
            ) : filteredSongs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No songs found</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredSongs.map(song => (
                  <li 
                    key={song.id}
                    onClick={() => setSelectedSong(song)}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedSong?.id === song.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-slate-100 border-l-4 border-transparent'
                    }`}
                  >
                    <p className="font-bold text-slate-800 text-sm">{song.title}</p>
                    <p className="text-xs text-slate-500 capitalize">{song.type}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Selected Song Lyrics */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-[400px]">
          {selectedSong ? (
            <>
              <div className="p-4 border-b border-slate-200 bg-indigo-50">
                <h3 className="font-bold text-indigo-900">{selectedSong.title}</h3>
                <p className="text-xs text-indigo-600 mt-0.5">Click any stanza to project it</p>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                {selectedSong.lyrics.map((stanza: any, idx: number) => (
                  <div 
                    key={idx}
                    className="group border border-slate-200 rounded-xl p-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all relative cursor-pointer"
                    onClick={() => projectStanza(stanza, idx)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stanza.label}</span>
                      <button 
                        disabled={sending === idx}
                        className="opacity-0 group-hover:opacity-100 bg-indigo-600 text-white p-1.5 rounded-lg transition-all disabled:opacity-50"
                      >
                        {sending === idx ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      </button>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{stanza.content}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50 p-6 text-center">
              <Music className="w-12 h-12 mb-3 text-slate-300" />
              <p>Select a song from the list to view and project its lyrics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
