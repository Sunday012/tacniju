"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Maximize, Minimize } from "lucide-react";

type PresentationState = {
  is_active: boolean;
  type: "text" | "bible" | "lyrics" | "media";
  content: any;
};

export default function PresentationDisplay() {
  const [state, setState] = useState<PresentationState>({
    is_active: false,
    type: "text",
    content: {},
  });
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchState = async () => {
      const { data, error } = await supabase
        .from("presentation_state")
        .select("*")
        .eq("id", 1)
        .single();
        
      if (data && !error) {
        setState({
          is_active: data.is_active,
          type: data.type as any,
          content: data.content,
        });
      }
    };
    
    // Initial fetch
    fetchState();

    // Setup polling fallback (in case realtime is not configured properly in Supabase)
    const intervalId = setInterval(() => {
      fetchState();
    }, 1500);

    // Subscribe to real-time changes
    const channel = supabase
      .channel("presentation_updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "presentation_state", filter: "id=eq.1" },
        (payload) => {
          setState({
            is_active: payload.new.is_active,
            type: payload.new.type,
            content: payload.new.content,
          });
        }
      )
      .subscribe();

    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Render logic based on state type
  const renderContent = () => {
    if (!state.is_active || !state.content) {
      return (
        <div className="flex items-center justify-center h-full w-full opacity-30">
          <img src="https://res.cloudinary.com/dzckvrvu9/image/upload/v1777993333/WhatsApp_Image_2026-05-01_at_08.37.56-removebg-preview_a8w3wt.png" alt="Church Logo" className="w-64 h-64 object-contain opacity-50 grayscale" />
        </div>
      );
    }

    switch (state.type) {
      case "text":
        return (
          <div className="flex flex-col items-center justify-center h-full w-full px-12 text-center animate-in fade-in duration-700">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-tight drop-shadow-2xl">
              {state.content.text}
            </h1>
          </div>
        );
      
      case "bible":
        return (
          <div className="flex flex-col h-full w-full justify-center px-16 lg:px-32 py-12 animate-in fade-in duration-700">
            <h2 className="text-4xl md:text-5xl font-black text-amber-400 mb-8 uppercase tracking-widest drop-shadow-lg">
              {state.content.reference}
            </h2>
            <p className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-snug drop-shadow-2xl">
              "{state.content.text}"
            </p>
            {state.content.version && (
              <p className="text-3xl text-slate-400 font-bold mt-8 text-right">
                {state.content.version}
              </p>
            )}
          </div>
        );
        
      case "lyrics":
        return (
          <div className="flex flex-col h-full w-full justify-center px-16 lg:px-32 py-12 animate-in fade-in duration-700">
            {state.content.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-indigo-300 mb-6 uppercase tracking-wider drop-shadow-lg">
                {state.content.title}
              </h2>
            )}
            <div className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight drop-shadow-2xl whitespace-pre-wrap">
              {state.content.text}
            </div>
            {state.content.label && (
              <p className="text-2xl text-slate-400 font-bold mt-8 uppercase tracking-widest">
                {state.content.label}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden font-sans">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-black to-black opacity-80" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
      
      {/* Main Content Area */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {renderContent()}
      </div>

      {/* Hover Controls (Hidden during presentation unless hovered) */}
      <div className="absolute top-4 right-4 z-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={toggleFullscreen}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white transition-all"
        >
          {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
