import { CalendarCheck, MinusCircle, Sparkles, Users } from "lucide-react"

export const pointCategories = [
  {
    slug: "work-force",
    name: "Work Force",
    itemName: "Work",
    icon: Users,
    defaultMode: "add",
    description: "Award points for assigned camp service and labour.",
  },
  {
    slug: "negative-force",
    name: "Negative Force",
    itemName: "Work",
    icon: MinusCircle,
    defaultMode: "remove",
    description: "Record point deductions and corrective entries.",
  },
  {
    slug: "attendance",
    name: "Attendance",
    itemName: "Work",
    icon: CalendarCheck,
    defaultMode: "add",
    description: "Connect points to attendance and punctuality.",
  },
  {
    slug: "special",
    name: "Special",
    itemName: "Work",
    icon: Sparkles,
    defaultMode: "add",
    description: "Record special point awards and exceptions.",
  },
] as const

export type PointCategorySlug = typeof pointCategories[number]["slug"]

export function getPointCategory(slug: string) {
  return pointCategories.find(category => category.slug === slug)
}
