import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/server"
import { v2 as cloudinary } from "cloudinary"

// Configure cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ 
        error: "Server Configuration Error: Cloudinary is perfectly integrated in code, but your .env is missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET." 
      }, { status: 500 })
    }

    // Convert file to Base64 to upload to Cloudinary directly from memory (no temp files needed)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      folder: "tacn_profiles", // Organizes images in a folder
      public_id: `profile_${user.id}_${Date.now()}`,
      overwrite: true,
      invalidate: true, // Invalidate CDN cache
    })

    const publicUrl = uploadResult.secure_url

    // Get current profile
    const { data: profile } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle()

    // Delete old profile picture from Cloudinary if exists
    if (profile?.avatar_url?.includes("cloudinary.com")) {
      const urlParts = profile.avatar_url.split('/')
      const fileWithExt = urlParts[urlParts.length - 1]
      const folderName = urlParts[urlParts.length - 2]
      if (folderName === "tacn_profiles") {
         const publicId = `tacn_profiles/${fileWithExt.split('.')[0]}`
         try {
           await cloudinary.uploader.destroy(publicId)
         } catch (e) {
           console.error("Failed to delete old Cloudinary image:", e)
         }
      }
    }

    // Update profile with new picture URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id)

    if (updateError) {
      // If database update fails, safely delete the newly uploaded file on Cloudinary
      await cloudinary.uploader.destroy(uploadResult.public_id).catch(console.error)
      console.error("Supabase Database Update Error:", updateError)
      return NextResponse.json({ error: `Database Error: ${updateError.message} (${updateError.code})` }, { status: 500 })
    }

    return NextResponse.json({
      url: publicUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed: " + (error as Error).message }, { status: 500 })
  }
}
