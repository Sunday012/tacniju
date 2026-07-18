"use client"

import { useMemo, useState } from "react"
import { CalendarDays, Church, FileText, Hash, ImageIcon, ListChecks, Plus, ReceiptText, Save, Trash2, Type } from "lucide-react"

const modules = [
  { id: "heading", label: "Heading", icon: Type },
  { id: "text", label: "Text", icon: FileText },
  { id: "amount", label: "Amount", icon: ReceiptText },
  { id: "date", label: "Date", icon: CalendarDays },
  { id: "number", label: "Number", icon: Hash },
  { id: "list", label: "List", icon: ListChecks },
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "church", label: "Church", icon: Church },
] as const

type ModuleId = typeof modules[number]["id"]
type Block = { id: string; module: ModuleId; label: string; value: string }

function defaultValue(module: ModuleId) {
  if (module === "heading") return "Program Voucher"
  if (module === "amount") return "NGN 0.00"
  if (module === "date") return new Date().toISOString().slice(0, 10)
  if (module === "number") return "VCH-001"
  if (module === "list") return "Opening prayer\nOffering\nClosing prayer"
  if (module === "church") return "TACN IJU"
  if (module === "image") return "Logo / image placeholder"
    return "Write here..."
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function VoucherDesigner() {
  const [format, setFormat] = useState<"voucher" | "page">("voucher")
  const [blocks, setBlocks] = useState<Block[]>([
    { id: "initial-church", module: "church", label: "Church", value: "TACN IJU" },
    { id: "initial-heading", module: "heading", label: "Title", value: "New Voucher" },
    { id: "initial-amount", module: "amount", label: "Amount", value: "NGN 0.00" },
  ])

  const selectedModules = useMemo(() => new Set(blocks.map(block => block.module)), [blocks])

  function addBlock(module: ModuleId) {
    setBlocks(current => [...current, { id: createId(), module, label: modules.find(item => item.id === module)?.label || "Field", value: defaultValue(module) }])
  }

  function updateBlock(id: string, values: Partial<Block>) {
    setBlocks(current => current.map(block => block.id === id ? { ...block, ...values } : block))
  }

  function saveDraft() {
    localStorage.setItem("godware_new_creation_draft", JSON.stringify({ format, blocks }))
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">Create Page / Voucher</h1>
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {(["voucher", "page"] as const).map(item => (
              <button key={item} onClick={() => setFormat(item)} className={`h-9 rounded-lg text-sm font-black capitalize ${format === item ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-950 dark:text-indigo-300" : "text-slate-500"}`}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {modules.map(item => {
            const Icon = item.icon
            return (
              <button key={item.id} onClick={() => addBlock(item.id)} className="flex h-20 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800">
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </div>

        <button onClick={saveDraft} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-black text-white hover:bg-indigo-700">
          <Save className="h-4 w-4" />
          Save Draft
        </button>
      </aside>

      <section className="min-h-[720px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className={`${format === "voucher" ? "mx-auto max-w-3xl border border-slate-300 p-8" : "w-full p-4"} min-h-[640px] bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100`}>
          <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{format}</span>
            <span className="text-xs font-bold text-slate-400">{selectedModules.size} module types</span>
          </div>
          <div className="space-y-4">
            {blocks.map(block => (
              <article key={block.id} className="grid gap-2 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <input value={block.label} onChange={event => updateBlock(block.id, { label: event.target.value })} className="min-w-0 flex-1 bg-transparent text-xs font-black uppercase tracking-widest text-slate-400 outline-none" />
                  <button onClick={() => setBlocks(current => current.filter(item => item.id !== block.id))} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete module">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea value={block.value} onChange={event => updateBlock(block.id, { value: event.target.value })} rows={block.module === "list" ? 5 : 2} className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-900" />
              </article>
            ))}
            <button onClick={() => addBlock("text")} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-sm font-black text-slate-500 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700">
              <Plus className="h-4 w-4" />
              Add Module
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
