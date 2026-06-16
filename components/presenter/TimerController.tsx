"use client";

import { useState } from "react";
import { Clock, Loader2, Play, Square, Timer } from "lucide-react";
import { toast } from "sonner";
import { clearPresentationTimerState, setPresentationTimerState } from "@/app/actions/presentation";

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export function TimerController() {
  const [minutes, setMinutes] = useState(5);
  const [corner, setCorner] = useState<Corner>("top-right");
  const [loading, setLoading] = useState<string | null>(null);

  async function runAction(label: string, action: () => Promise<any>) {
    setLoading(label);
    try {
      const result = await action();
      if (result?.error) {
        toast.error(result.error.includes("timer_state") ? "Run the presentation timer migration first." : result.error);
      } else {
        toast.success("Projection clock updated.");
      }
    } catch {
      toast.error("Projection clock could not be updated.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Timer className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Timer & Stopwatch</h2>
          <p className="text-sm font-medium text-slate-500">Timer overlays the active screen. Stopwatch displays full screen.</p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
          <label className="grid gap-1.5 text-sm font-bold text-slate-600">
            Timer minutes
            <input
              type="number"
              min="1"
              max="999"
              value={minutes}
              onChange={event => setMinutes(Number(event.target.value || 1))}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-amber-300 focus:bg-white"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-600">
            Screen corner
            <select
              value={corner}
              onChange={event => setCorner(event.target.value as Corner)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-amber-300 focus:bg-white"
            >
              <option value="top-right">Top right</option>
              <option value="top-left">Top left</option>
              <option value="bottom-right">Bottom right</option>
              <option value="bottom-left">Bottom left</option>
            </select>
          </label>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={!!loading}
            onClick={() => runAction("timer", () => setPresentationTimerState({
              active: true,
              mode: "timer",
              fullscreen: false,
              durationSeconds: Math.max(1, minutes) * 60,
              startedAt: new Date().toISOString(),
              pausedSeconds: 0,
              corner,
            }))}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-black text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "timer" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Start Timer
          </button>
          <button
            type="button"
            disabled={!!loading}
            onClick={() => runAction("stopwatch", () => setPresentationTimerState({
              active: true,
              mode: "stopwatch",
              fullscreen: true,
              durationSeconds: 0,
              startedAt: new Date().toISOString(),
              pausedSeconds: 0,
              corner,
            }))}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "stopwatch" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
            Start Stopwatch
          </button>
        </div>

        <button
          type="button"
          disabled={!!loading}
          onClick={() => runAction("clear", clearPresentationTimerState)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading === "clear" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
          Stop Clock
        </button>
      </div>
    </section>
  );
}
