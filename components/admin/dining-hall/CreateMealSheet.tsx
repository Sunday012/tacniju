"use client"

import { CalendarDays, Plus } from "lucide-react"
import { createDiningHallMeal } from "@/app/admin/dining-hall/actions"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function CreateMealSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-indigo-700">
          <Plus className="h-4 w-4" />
          Create Meal
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full border-slate-200 bg-white p-0 text-slate-900 sm:max-w-md">
        <SheetHeader className="border-b border-slate-100 px-6 py-5 text-left">
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <CalendarDays className="h-5 w-5" />
          </div>
          <SheetTitle className="text-xl font-extrabold text-slate-900">Create Meal</SheetTitle>
          <SheetDescription className="text-sm font-medium text-slate-500">
            Add a meal to the active dining hall timetable.
          </SheetDescription>
        </SheetHeader>
        <form action={createDiningHallMeal} className="grid gap-4 px-6 py-5">
          <label className="grid gap-1.5 text-sm font-bold text-slate-600">
            Meal name
            <input name="meal_name" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" placeholder="Meal name" required />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-600">
            Camp day
            <input name="camp_day" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" placeholder="Camp day" required />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-600">
            Meal time
            <input name="meal_time" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" placeholder="Meal time" required />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-bold text-slate-600">
              Points allotted
              <input name="points" type="number" min="0" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" placeholder="0" required />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-slate-600">
              Unit
              <input name="unit_name" className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-indigo-300 focus:bg-white" placeholder="Plate" defaultValue="Plate" required />
            </label>
          </div>
          <button className="mt-2 h-11 rounded-xl bg-indigo-600 font-black text-white shadow-sm hover:bg-indigo-700">
            Save Meal Setup
          </button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
