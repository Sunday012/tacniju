"use client"

import { useState } from "react"
import { Eye, EyeOff, Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteKitchenFoodItem, toggleKitchenFoodVisibility } from "@/app/accounting/production/actions"

export function KitchenFoodVisibilityToggle({
  itemId,
  isVisible,
}: {
  itemId: string
  isVisible: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      const result = await toggleKitchenFoodVisibility(itemId, isVisible)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(isVisible ? "Hidden from Dining Hall" : "Visible in Dining Hall")
        router.refresh()
      }
    } catch {
      toast.error("Could not update visibility.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-black transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        isVisible
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
      }`}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      {isVisible ? "Seen" : "Hidden"}
    </button>
  )
}

export function DeleteKitchenFoodButton({
  itemId,
  itemName,
}: {
  itemId: string
  itemName: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!window.confirm(`Delete ${itemName} from the kitchen list? The Stock Journal record will remain in accounting.`)) return

    setLoading(true)
    try {
      const result = await deleteKitchenFoodItem(itemId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Food removed from kitchen.")
        router.refresh()
      }
    } catch {
      toast.error("Could not delete food.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-3 text-xs font-black text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      Delete
    </button>
  )
}
