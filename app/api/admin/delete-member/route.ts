import { NextResponse } from "next/server"
import { createClient } from "@/lib/server"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: adminProfile, error: adminProfileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle()

  if (adminProfileError) {
    return NextResponse.json({ error: adminProfileError.message }, { status: 500 })
  }

  if (!adminProfile?.is_admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 })
  }

  let memberId: string | undefined

  try {
    const body = await request.json()
    memberId = body.memberId
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!memberId) {
    return NextResponse.json({ error: "Member ID is required" }, { status: 400 })
  }

  if (memberId === user.id) {
    return NextResponse.json({ error: "You cannot delete your own account here." }, { status: 400 })
  }

  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: memberProfile, error: memberProfileError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", memberId)
    .maybeSingle()

  if (memberProfileError) {
    return NextResponse.json({ error: memberProfileError.message }, { status: 500 })
  }

  if (!memberProfile) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 })
  }

  const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(memberId)

  if (deleteAuthError) {
    const message = deleteAuthError.message.toLowerCase()
    const authUserMissing = message.includes("not found") || message.includes("does not exist")

    if (!authUserMissing) {
      return NextResponse.json({ error: deleteAuthError.message }, { status: 500 })
    }

    const { error: deleteProfileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", memberId)

    if (deleteProfileError) {
      return NextResponse.json({ error: deleteProfileError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
