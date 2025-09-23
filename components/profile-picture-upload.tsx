"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null
  userName?: string
  onUploadComplete?: (url: string) => void
}

export function ProfilePictureUpload({
  currentImageUrl,
  userName = "User",
  onUploadComplete,
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(currentImageUrl)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-profile-picture", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }

      setImageUrl(result.url)
      onUploadComplete?.(result.url)

      toast("Profile picture updated successfully.")

    } catch (error) {
      console.error("Upload error:", error)
      toast(
        "Upload Failed"
      )
      setIsUploading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24 border-4 border-indigo-100">
          <AvatarImage src={imageUrl || undefined} alt={userName} />
          <AvatarFallback className="bg-indigo-100 text-indigo-700 text-lg font-semibold">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center space-y-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="hidden"
          id="profile-picture-upload"
        />
        <label htmlFor="profile-picture-upload">
          <Button variant="outline" size="sm" disabled={isUploading} className="cursor-pointer bg-transparent" asChild>
            <span>
              {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              {isUploading ? "Uploading..." : "Upload Photo"}
            </span>
          </Button>
        </label>
        <p className="text-xs text-muted-foreground text-center">JPG, PNG or GIF (max 5MB)</p>
      </div>
    </div>
  )
}
