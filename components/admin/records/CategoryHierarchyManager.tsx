"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ChevronDown,
  ChevronRight,
  FolderPlus,
  FolderTree,
  Plus,
  Layers,
  Folder,
  Tag,
  ArrowRightLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { ContentCategoryActions } from "@/components/admin/records/ContentCategoryActions"
import { DreamCategoryActions } from "@/components/admin/dreams/DreamCategoryActions"

export type BaseCategory = {
  id: string
  parent_id: string | null
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  parent?: { id: string; name: string } | null
}

interface CategoryHierarchyManagerProps<T extends BaseCategory> {
  categories: T[]
  recordType?: string // e.g. "teachings", "prophecies", "lyrics" or undefined for "dreams"
  labels: {
    singular: string
    plural: string
  }
  createAction: (formData: FormData) => Promise<{ error?: string; success?: boolean }>
}

export function CategoryHierarchyManager<T extends BaseCategory>({
  categories,
  recordType,
  labels,
  createAction,
}: CategoryHierarchyManagerProps<T>) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Sheet states
  const [isGroupSheetOpen, setIsGroupSheetOpen] = useState(false)
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string>("")

  // Group expand states: key is group ID, default expanded for all groups
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    __ungrouped__: true,
  })

  // Map of child categories by parent_id
  const childrenMap = new Map<string, T[]>()
  categories.forEach((c) => {
    if (c.parent_id) {
      const list = childrenMap.get(c.parent_id) || []
      list.push(c)
      childrenMap.set(c.parent_id, list)
    }
  })

  // Distinguish top-level items (parent_id === null):
  // 1. Groups: top-level items that have child categories assigned to them.
  // 2. Ungrouped Categories: top-level items that do NOT have child categories.
  const groups = categories.filter((c) => c.parent_id === null && childrenMap.has(c.id))
  const ungroupedCategories = categories.filter(
    (c) => c.parent_id === null && !childrenMap.has(c.id)
  )

  // All available groups for category selection (including any top-level item)
  const availableGroups = categories.filter((c) => c.parent_id === null)

  function toggleGroupExpand(groupId: string) {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: prev[groupId] === undefined ? false : !prev[groupId],
    }))
  }

  function isGroupExpanded(groupId: string) {
    return expandedGroups[groupId] !== false
  }

  function handleOpenCategorySheet(groupId?: string) {
    if (groupId) {
      setSelectedGroupId(groupId)
    } else if (availableGroups.length > 0) {
      setSelectedGroupId(availableGroups[0].id)
    } else {
      setSelectedGroupId("")
    }
    setIsCategorySheetOpen(true)
  }

  function handleCreateGroupSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set("parent_id", "") // Top-level group has no parent_id

    startTransition(async () => {
      const result = await createAction(formData)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Group created successfully")
      setIsGroupSheetOpen(false)
      router.refresh()
    })
  }

  function handleCreateCategorySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const pId = formData.get("parent_id")

    if (!pId) {
      toast.error("Please select a group for this category.")
      return
    }

    startTransition(async () => {
      const result = await createAction(formData)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Category created successfully")
      setIsCategorySheetOpen(false)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {labels.plural} Groups & Categories
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Create groups (e.g. Apostle Teachings) and assign series & topics as subcategories under them.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => setIsGroupSheetOpen(true)}
            className="h-11 gap-2 rounded-xl bg-slate-900 px-5 text-sm font-black text-white hover:bg-slate-800 shadow-sm"
          >
            <FolderPlus className="h-4 w-4 text-indigo-400" />
            + New Group
          </Button>

          <Button
            type="button"
            onClick={() => handleOpenCategorySheet()}
            disabled={availableGroups.length === 0}
            className="h-11 gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-black text-white hover:bg-indigo-700 shadow-sm disabled:opacity-50"
            title={availableGroups.length === 0 ? "Create a Group first before adding categories" : undefined}
          >
            <Plus className="h-4 w-4" />
            + New Category
          </Button>
        </div>
      </div>

      {/* Main Hierarchy Listing */}
      <div className="space-y-4">
        {/* SECTION 1: Ungrouped Categories (Existing Categories waiting to be assigned to a group) */}
        {ungroupedCategories.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-indigo-200/80 bg-indigo-50/30 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-100 bg-indigo-50/80 px-5 py-4">
              <div
                onClick={() => toggleGroupExpand("__ungrouped__")}
                className="flex flex-1 cursor-pointer items-center gap-3.5 min-w-[240px]"
              >
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-indigo-200 text-indigo-700 shadow-xs hover:bg-indigo-50"
                >
                  {isGroupExpanded("__ungrouped__") ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-xs">
                  <Tag className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-extrabold text-slate-900">
                      Existing Categories (Unassigned)
                    </h3>
                    <span className="rounded-full bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 text-xs font-black text-indigo-800">
                      {ungroupedCategories.length} {ungroupedCategories.length === 1 ? "category" : "categories"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-indigo-600">
                    These categories don't have a parent group yet. Click the edit icon on any category to assign it to a group.
                  </p>
                </div>
              </div>
            </div>

            {/* List of Ungrouped Categories */}
            {isGroupExpanded("__ungrouped__") && (
              <div className="divide-y divide-indigo-100/60 bg-white px-3 py-2">
                {ungroupedCategories.map((category) => (
                  <div
                    key={category.id}
                    className="group flex items-center justify-between gap-4 rounded-xl px-4 py-3 hover:bg-indigo-50/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                        <Folder className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {category.name}
                          </h4>
                          {!category.is_active && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                              Hidden
                            </span>
                          )}
                        </div>
                        {category.description && (
                          <p className="mt-0.5 text-xs text-slate-500 truncate max-w-md">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {recordType ? (
                        <ContentCategoryActions
                          recordType={recordType as any}
                          category={category as any}
                          categories={categories as any}
                        />
                      ) : (
                        <DreamCategoryActions
                          category={category as any}
                          categories={categories as any}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: Structured Groups & Nested Categories */}
        {groups.length === 0 && ungroupedCategories.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <FolderTree className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-slate-900">No Groups Created Yet</h3>
            <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto">
              Create your first top-level group to start organizing your {labels.plural.toLowerCase()}.
            </p>
            <div className="mt-6">
              <Button
                type="button"
                onClick={() => setIsGroupSheetOpen(true)}
                className="h-11 gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-black text-white hover:bg-indigo-700 shadow-sm"
              >
                <FolderPlus className="h-4 w-4" />
                Create First Group
              </Button>
            </div>
          </div>
        ) : (
          groups.map((group) => {
            const children = childrenMap.get(group.id) || []
            const isExpanded = isGroupExpanded(group.id)

            return (
              <div
                key={group.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all"
              >
                {/* Group Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                  <div
                    onClick={() => toggleGroupExpand(group.id)}
                    className="flex flex-1 cursor-pointer items-center gap-3.5 min-w-[240px]"
                  >
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 shadow-xs hover:bg-slate-100"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold">
                      <Layers className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-base font-extrabold text-slate-900 truncate">
                          {group.name}
                        </h3>
                        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-black text-indigo-700 border border-indigo-200/60">
                          {children.length} {children.length === 1 ? "category" : "categories"}
                        </span>
                        {!group.is_active && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                            Hidden
                          </span>
                        )}
                      </div>
                      {group.description && (
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                          {group.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Group Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenCategorySheet(group.id)}
                      className="h-9 gap-1.5 rounded-lg border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Category
                    </Button>

                    {recordType ? (
                      <ContentCategoryActions
                        recordType={recordType as any}
                        category={group as any}
                        categories={categories as any}
                      />
                    ) : (
                      <DreamCategoryActions
                        category={group as any}
                        categories={categories as any}
                      />
                    )}
                  </div>
                </div>

                {/* Subcategories Collapsible List */}
                {isExpanded && (
                  <div className="divide-y divide-slate-100 bg-white px-3 py-2">
                    {children.length === 0 ? (
                      <div className="py-6 text-center">
                        <p className="text-xs font-semibold text-slate-400">
                          No categories assigned under this group yet.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOpenCategorySheet(group.id)}
                          className="mt-2 text-xs font-extrabold text-indigo-600 hover:underline"
                        >
                          + Add a category to "{group.name}"
                        </button>
                      </div>
                    ) : (
                      children.map((category) => (
                        <div
                          key={category.id}
                          className="group flex items-center justify-between gap-4 rounded-xl px-4 py-3 hover:bg-slate-50/80 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                              <Folder className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900 truncate">
                                  {category.name}
                                </h4>
                                {!category.is_active && (
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                                    Hidden
                                  </span>
                                )}
                              </div>
                              {category.description && (
                                <p className="mt-0.5 text-xs text-slate-500 truncate max-w-md">
                                  {category.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0">
                            {recordType ? (
                              <ContentCategoryActions
                                recordType={recordType as any}
                                category={category as any}
                                categories={categories as any}
                              />
                            ) : (
                              <DreamCategoryActions
                                category={category as any}
                                categories={categories as any}
                              />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* --- DRAWERS / SHEETS --- */}

      {/* 1. New Group Sheet */}
      <Sheet open={isGroupSheetOpen} onOpenChange={setIsGroupSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
              <FolderPlus className="h-5 w-5 text-indigo-600" />
              Create New Group
            </SheetTitle>
            <SheetDescription>
              Create a top-level group for organizing {labels.plural.toLowerCase()}.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleCreateGroupSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Group Name <span className="text-rose-500">*</span>
              </label>
              <input
                name="name"
                required
                placeholder="e.g. Teachings Of The Law, Apostle Teachings..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Description (Optional)
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Brief summary of what this group covers..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsGroupSheetOpen(false)}
                className="h-11 rounded-xl px-5 font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-11 rounded-xl bg-indigo-600 px-6 font-bold text-white hover:bg-indigo-700"
              >
                {isPending ? "Saving..." : "Create Group"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* 2. New Category Sheet */}
      <Sheet open={isCategorySheetOpen} onOpenChange={setIsCategorySheetOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
              <Folder className="h-5 w-5 text-indigo-600" />
              Create New Category
            </SheetTitle>
            <SheetDescription>
              Categories must belong to a parent Group.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleCreateCategorySubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Select Parent Group <span className="text-rose-500">*</span>
              </label>
              <select
                name="parent_id"
                required
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              >
                {availableGroups.length === 0 && <option value="">No Groups Available</option>}
                {availableGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Category Name <span className="text-rose-500">*</span>
              </label>
              <input
                name="name"
                required
                placeholder="e.g. Armour Of God Series, Looking Beneath The Surface..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Description (Optional)
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Optional notes or details for this category..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCategorySheetOpen(false)}
                className="h-11 rounded-xl px-5 font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || availableGroups.length === 0}
                className="h-11 rounded-xl bg-indigo-600 px-6 font-bold text-white hover:bg-indigo-700"
              >
                {isPending ? "Saving..." : "Save Category"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
