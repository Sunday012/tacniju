"use client"

import { useRef, useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { recordDiningHallServing } from "@/app/admin/dining-hall/actions"

type MealOption = {
  id: string
  meal_name: string
  camp_day: string
}

export function RecordServingForm({ profileId, meals }: { profileId: string; meals: MealOption[] }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)
  const [recorded, setRecorded] = useState(false)
  const hasMeals = meals.length > 0

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    if (!String(formData.get("meal_id") || "")) {
      toast.error("Select a meal before recording food.")
      return
    }

    setLoading(true)
    try {
      const result = await recordDiningHallServing(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        setRecorded(true)
        toast.success("Food recorded.")
        formRef.current?.reset()
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex justify-end gap-2">
      <input type="hidden" name="profile_id" value={profileId} />
      <select
        name="meal_id"
        className="h-9 max-w-[180px] rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600"
        disabled={!hasMeals || loading}
        required
      >
        <option value="">Select meal</option>
        {meals.map(meal => (
          <option key={meal.id} value={meal.id}>
            {meal.camp_day} - {meal.meal_name}
          </option>
        ))}
      </select>
      <input
        name="plates"
        type="number"
        min="0.5"
        step="0.5"
        defaultValue="1"
        className="h-9 w-16 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600"
        disabled={!hasMeals || loading}
      />
      <button
        type="submit"
        disabled={!hasMeals || loading}
        className={
          recorded
            ? "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-black text-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            : "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-xs font-black text-indigo-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
        }
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : recorded ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
        {recorded ? "Recorded" : "Record Food"}
      </button>
    </form>
  )
}
