import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/server"
import { cookies } from "next/headers"

async function signOut(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const cookieStore = cookies()
  cookieStore.delete("active_org_id")
  return NextResponse.redirect(new URL("/select-church", request.url))
}

export async function GET(request: NextRequest) {
  return signOut(request)
}

export async function POST(request: NextRequest) {
  return signOut(request)
}
