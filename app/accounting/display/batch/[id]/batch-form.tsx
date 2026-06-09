"use client"

import { useFormState } from "react-dom"
import { toast } from "sonner"
import { useEffect, ReactNode } from "react"
import { saveBatch } from "../actions"

export function BatchForm({ children }: { children: ReactNode }) {
    const [state, formAction] = useFormState(saveBatch, null)

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error)
        }
    }, [state])

    return (
        <form id="batch-form" action={formAction} className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
            {children}
        </form>
    )
}

import { useFormStatus } from "react-dom"
import { Save } from "lucide-react"

export function SubmitButton({ form }: { form?: string }) {
    const { pending } = useFormStatus()
    return (
        <button
            form={form}
            disabled={pending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-black text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Save className="h-4 w-4" />
            {pending ? "Saving..." : "Save"}
        </button>
    )
}

import { Trash2 } from "lucide-react"
import { deleteBatch } from "../actions"
import { useTransition } from "react"

export function DeleteBatchForm({ batchId }: { batchId: string }) {
    const [isPending, startTransition] = useTransition()

    return (
        <button
            disabled={isPending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 text-sm font-black text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => {
                e.preventDefault()
                if (window.confirm("Are you sure you want to delete this batch?")) {
                    startTransition(async () => {
                        const result = await deleteBatch(batchId)
                        if (result?.error) toast.error(result.error)
                    })
                }
            }}
        >
            <Trash2 className="h-4 w-4" />
            {isPending ? "Deleting..." : "Delete"}
        </button>
    )
}
