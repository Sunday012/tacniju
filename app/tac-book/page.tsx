import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { TacBook, type TacBookInitialData } from "@/components/tac-book"
import { getTransactions, getAccounts } from "./actions"

export default async function TacBookPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  if (!profile?.is_admin) {
    redirect("/dashboard")
  }

  const transactions = await getTransactions()
  const accounts = await getAccounts()

  const initialData: TacBookInitialData = {
    accounts: accounts.length > 0 ? accounts : [
      // Fallback or empty if DB script hasn't run yet, 
      // essentially acts as a localized offline cache or default
      // We'll leave it empty to encourage running the script
    ],
    transactions,
  }

  return <TacBook initialData={initialData} />
}

