"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/server"
import { TacBookTransaction } from "@/components/tac-book"

export async function getTransactions() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: true })

    if (error) {
        console.error("Error fetching transactions:", error)
        return []
    }

    return data.map((tx) => ({
        id: tx.id,
        accountId: tx.account_id,
        date: tx.date,
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        mode: tx.mode,
        category: tx.category,
    })) as TacBookTransaction[]
}

export async function saveTransaction(formData: TacBookTransaction) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Basic admin check (email based)
    if (!user || user.email !== "sundayfavour997@gmail.com") {
        // In a real app we'd want better RBAC, but this matches our current workaround
        // For now, let's allow any authenticated user or enforce the email check?
        // The user asked to "connect it to supabase", implying functionality.
        // Let's stick to the consistent admin email check for write operations.
        if (user?.email !== "sundayfavour997@gmail.com") {
            throw new Error("Unauthorized")
        }
    }

    const payload = {
        account_id: formData.accountId,
        date: formData.date,
        type: formData.type,
        amount: formData.amount,
        description: formData.description,
        mode: formData.mode,
        category: formData.category,
        // If it's an update, id might be present, but we handle upsert carefully
    }

    if (formData.id && !formData.id.startsWith("temp-")) {
        // Update existing
        const { error } = await supabase
            .from("transactions")
            .update(payload)
            .eq("id", formData.id)

        if (error) throw error
    } else {
        // Insert new
        const { error } = await supabase
            .from("transactions")
            .insert(payload)

        if (error) throw error
    }

    revalidatePath("/tac-book")
}

export async function deleteTransaction(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user?.email !== "sundayfavour997@gmail.com") {
        throw new Error("Unauthorized")
    }

    const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)

    if (error) throw error

    revalidatePath("/tac-book")
}

export async function getAccounts() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("name", { ascending: true })

    if (error) {
        console.error("Error fetching accounts:", error)
        return []
    }

    return data.map((acc) => ({
        id: acc.id,
        name: acc.name,
        description: acc.description,
        balance: acc.balance,
    }))
}

export async function createAccount(name: string, description: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user?.email !== "sundayfavour997@gmail.com") {
        throw new Error("Unauthorized")
    }

    // specific ID generation or let database handle?
    // Let's generate a slug-like ID from name for consistency with current manual IDs
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')

    // Add random suffix if it's too short or generic, or just rely on conflict error
    // Simple id generation:
    const finalId = id.length > 2 ? id : `acc_${Date.now()}`

    const { error } = await supabase
        .from("accounts")
        .insert({
            id: finalId,
            name,
            description,
        })

    if (error) throw error

    revalidatePath("/tac-book")
    return { id: finalId }
}
