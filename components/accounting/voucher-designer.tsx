"use client"

import { useMemo, useState, useTransition } from "react"
import {
  CalendarDays,
  Church,
  Copy,
  FileText,
  Hash,
  ImageIcon,
  ListChecks,
  Plus,
  ReceiptText,
  Save,
  Trash2,
  Type,
} from "lucide-react"
import { toast } from "sonner"
import {
  deleteCreationTemplate,
  saveCreationTemplate,
  type CreationTemplate,
  type CreationTemplateBlock,
  type CreationTemplateKind,
  type CreationTemplateScope,
} from "@/app/accounting/voucher-designer/actions"

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
type Block = CreationTemplateBlock & { module: ModuleId }

const iconOptions = ["Receipt", "Church", "File", "List", "Image"]

function defaultBlocks(): Block[] {
  return [
    { id: "initial-church", module: "church", label: "Church", value: "TACN IJU" },
    { id: "initial-heading", module: "heading", label: "Title", value: "New Voucher" },
    { id: "initial-amount", module: "amount", label: "Amount", value: "NGN 0.00" },
  ]
}

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

function normalizeBlocks(blocks: CreationTemplateBlock[]): Block[] {
  return blocks.map(block => ({
    id: block.id || createId(),
    module: modules.some(item => item.id === block.module) ? block.module as ModuleId : "text",
    label: block.label || "Field",
    value: block.value || "",
  }))
}

export function VoucherDesigner({
  templates,
  defaultScope = "accounting",
}: {
  templates: CreationTemplate[]
  defaultScope?: CreationTemplateScope
}) {
  const [templateId, setTemplateId] = useState("")
  const [name, setName] = useState("New Voucher Template")
  const [description, setDescription] = useState("")
  const [format, setFormat] = useState<CreationTemplateKind>("voucher")
  const [scope, setScope] = useState<CreationTemplateScope>(defaultScope === "admin" ? "admin" : "both")
  const [iconName, setIconName] = useState("Receipt")
  const [blocks, setBlocks] = useState<Block[]>(defaultBlocks())
  const [isPending, startTransition] = useTransition()
  const selectedModules = useMemo(() => new Set(blocks.map(block => block.module)), [blocks])

  function addBlock(module: ModuleId) {
    setBlocks(current => [...current, { id: createId(), module, label: modules.find(item => item.id === module)?.label || "Field", value: defaultValue(module) }])
  }

  function updateBlock(id: string, values: Partial<Block>) {
    setBlocks(current => current.map(block => block.id === id ? { ...block, ...values } : block))
  }

  function loadTemplate(template: CreationTemplate) {
    setTemplateId(template.id)
    setName(template.name)
    setDescription(template.description || "")
    setFormat(template.template_kind)
    setScope(template.scope)
    setIconName(template.icon_name || "Receipt")
    setBlocks(normalizeBlocks(template.blocks || []))
  }

  function newTemplate() {
    setTemplateId("")
    setName(format === "page" ? "New Page Template" : "New Voucher Template")
    setDescription("")
    setIconName(format === "page" ? "File" : "Receipt")
    setBlocks(defaultBlocks())
  }

  function saveDraft() {
    localStorage.setItem("godware_new_creation_draft", JSON.stringify({ name, description, format, scope, iconName, blocks }))
    toast.success("Browser draft saved")
  }

  function saveTemplate() {
    const formData = new FormData()
    formData.set("id", templateId)
    formData.set("name", name)
    formData.set("description", description)
    formData.set("template_kind", format)
    formData.set("scope", scope)
    formData.set("icon_name", iconName)
    formData.set("blocks", JSON.stringify(blocks))

    startTransition(async () => {
      const result = await saveCreationTemplate(formData)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(templateId ? "Template updated" : "Template saved")
    })
  }

  function removeTemplate() {
    if (!templateId) {
      toast.error("Select a saved template first.")
      return
    }
    if (!confirm(`Delete "${name}"?`)) return

    startTransition(async () => {
      const result = await deleteCreationTemplate(templateId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Template deleted")
      newTemplate()
    })
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
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

        <div className="space-y-3">
          <input value={name} onChange={event => setName(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" placeholder="Template name" />
          <textarea value={description} onChange={event => setDescription(event.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" placeholder="Description" />
          <div className="grid grid-cols-2 gap-2">
            <select value={scope} onChange={event => setScope(event.target.value as CreationTemplateScope)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-950">
              <option value="both">Admin + Account</option>
              <option value="accounting">Account Only</option>
              <option value="admin">Admin Only</option>
            </select>
            <select value={iconName} onChange={event => setIconName(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-950">
              {iconOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
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

        <div className="grid grid-cols-2 gap-2">
          <button onClick={saveTemplate} disabled={isPending} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-black text-white hover:bg-indigo-700 disabled:opacity-60">
            <Save className="h-4 w-4" />
            Save
          </button>
          <button onClick={saveDraft} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
            <Copy className="h-4 w-4" />
            Draft
          </button>
          <button onClick={newTemplate} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
            New
          </button>
          <button onClick={removeTemplate} disabled={!templateId || isPending} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-xs font-black text-red-600 hover:bg-red-100 disabled:opacity-50">
            Delete
          </button>
        </div>

        <div className="space-y-2 border-t border-slate-200 pt-4 dark:border-slate-800">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Saved Templates</p>
          {templates.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-500 dark:bg-slate-950">No saved templates yet.</p>
          ) : templates.map(template => (
            <button key={template.id} onClick={() => loadTemplate(template)} className={`w-full rounded-xl border px-3 py-2 text-left transition ${templateId === template.id ? "border-indigo-300 bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"}`}>
              <span className="block truncate text-sm font-black">{template.name}</span>
              <span className="mt-0.5 block text-xs font-semibold capitalize text-slate-400">{template.template_kind} · {template.scope}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="min-h-[720px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className={`${format === "voucher" ? "mx-auto max-w-3xl border border-slate-300 p-8 dark:border-slate-700" : "w-full p-4"} min-h-[640px] bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100`}>
          <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">{format} template</span>
              <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">{name || "Untitled Template"}</h2>
            </div>
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
