"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { ProfilePictureUpload } from "@/components/profile-picture-upload"

interface Profile {
  id: string
  email: string
  full_name: string
  phone_number?: string
  address?: string
  sex?: string
  date_of_birth?: string
  district?: string
  assembly?: string
  department?: string
  family?: string
  guardian_spouse_number?: string
  office_position?: string
  rank?: string
  reservation_number?: string
  profile_picture_url?: string
}

interface ProfileFormProps {
  profile: Profile | null
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone_number: profile?.phone_number || "",
    address: profile?.address || "",
    sex: profile?.sex || "",
    date_of_birth: profile?.date_of_birth || "",
    district: profile?.district || "",
    assembly: profile?.assembly || "",
    department: profile?.department || "",
    family: profile?.family || "",
    guardian_spouse_number: profile?.guardian_spouse_number || "",
    office_position: profile?.office_position || "",
    reservation_number: profile?.reservation_number || "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleProfilePictureUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, profile_picture_url: url }))
    router.refresh() // Refresh to show new profile picture
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("profiles").update(formData).eq("id", profile?.id)

      if (error) throw error

      setMessage({ type: "success", text: "Profile updated successfully!" })
      router.refresh()
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <ProfilePictureUpload
          currentImageUrl={profile?.profile_picture_url}
          userName={profile?.full_name || "User"}
          onUploadComplete={handleProfilePictureUpload}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange("full_name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              value={formData.phone_number}
              onChange={(e) => handleInputChange("phone_number", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sex">Sex</Label>
            <Select value={formData.sex} onValueChange={(value) => handleInputChange("sex", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <Input
              id="district"
              value={formData.district}
              onChange={(e) => handleInputChange("district", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assembly">Assembly</Label>
            <Input
              id="assembly"
              value={formData.assembly}
              onChange={(e) => handleInputChange("assembly", e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Music">Music</SelectItem>
                <SelectItem value="Ushering">Ushering</SelectItem>
                <SelectItem value="Drama">Drama</SelectItem>
                <SelectItem value="Clean Up">Clean Up</SelectItem>
                <SelectItem value="Intercessory">Intercessory</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="family">Family</Label>
            <Input id="family" value={formData.family} onChange={(e) => handleInputChange("family", e.target.value)} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guardian_spouse_number">Guardian/Spouse Number</Label>
            <Input
              id="guardian_spouse_number"
              value={formData.guardian_spouse_number}
              onChange={(e) => handleInputChange("guardian_spouse_number", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="office_position">Office/Position</Label>
            <Input
              id="office_position"
              value={formData.office_position}
              onChange={(e) => handleInputChange("office_position", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reservation_number">Reservation Number</Label>
          <Input
            id="reservation_number"
            value={formData.reservation_number}
            onChange={(e) => handleInputChange("reservation_number", e.target.value)}
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-600 border border-green-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Profile"}
        </Button>
      </form>
    </div>
  )
}
