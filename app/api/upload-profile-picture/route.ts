import { put, del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Get current profile to delete old picture if exists
    const { data: profile } = await supabase.from("profiles").select("profile_picture_url").eq("id", user.id).maybeSingle()

    // Delete old profile picture if exists
    if (profile?.profile_picture_url) {
      try {
        await del(profile.profile_picture_url)
      } catch (error) {
        console.error("Error deleting old profile picture:", error)
      }
    }

    // Upload new profile picture
    const filename = `profile-${user.id}-${Date.now()}.${file.name.split(".").pop()}`
    const blob = await put(filename, file, {
      access: "public",
    })

    // Update profile with new picture URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ profile_picture_url: blob.url })
      .eq("id", user.id)

    if (updateError) {
      // If database update fails, delete the uploaded file
      await del(blob.url)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
