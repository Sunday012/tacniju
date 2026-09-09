"use client"

import { useEffect, useState } from "react"
import { Download, Share2, X } from "lucide-react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

const DISMISSED_KEY = "godware-install-prompt-dismissed"

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosHint, setShowIosHint] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    if (window.localStorage.getItem(DISMISSED_KEY) === "true") return

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
      setVisible(true)
    }

    const handleInstalled = () => {
      setVisible(false)
      setInstallEvent(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleInstalled)

    if (isIosDevice()) {
      setShowIosHint(true)
      setVisible(true)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleInstalled)
    }
  }, [])

  async function installApp() {
    if (!installEvent) return

    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice.outcome === "accepted") {
      setVisible(false)
    }
    setInstallEvent(null)
  }

  function dismiss() {
    window.localStorage.setItem(DISMISSED_KEY, "true")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-5 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-indigo-200 bg-white p-3 text-slate-900 shadow-[0_18px_50px_-18px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:left-auto sm:right-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
          {showIosHint && !installEvent ? <Share2 className="h-5 w-5" /> : <Download className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black">Install Godware</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
            {showIosHint && !installEvent
              ? "Use Share, then Add to Home Screen."
              : "Add it to this device for faster access."}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {installEvent ? (
              <button
                type="button"
                onClick={installApp}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-sm font-black text-white shadow-sm hover:bg-indigo-700"
              >
                <Download className="h-4 w-4" />
                Install App
              </button>
            ) : null}
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label="Dismiss install prompt"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
