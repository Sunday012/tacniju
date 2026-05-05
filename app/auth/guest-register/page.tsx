"use client"
import type React from "react"
import Image from "next/image"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function GuestRegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "", 
    fullName: "",
    address: "",
    phoneNo: "",
    dateOfBirth: "",
    sex: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "username") {
      setUsernameAvailable(null)
    }
  }

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) return
    setUsernameChecking(true)
    const supabase = createClient()
    try {
      const { data, error } = await supabase.rpc('check_username_exists', {
        username_to_check: username.toLowerCase()
      })
      if (error) {
        setUsernameAvailable(null)
        return
      }
      setUsernameAvailable(!data)
    } catch (error) {
      setUsernameAvailable(null)
    } finally {
      setUsernameChecking(false)
    }
  }

  const handleUsernameBlur = () => {
    if (formData.username && formData.username.length >= 3) {
      checkUsernameAvailability(formData.username)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    if (!formData.username || formData.username.length < 3) {
      setError("Username must be at least 3 characters long")
      setIsLoading(false)
      return
    }

    if (usernameAvailable === false) {
      setError("Username is already taken")
      setIsLoading(false)
      return
    }

    try {
      const sanitizedUsername = formData.username.toLowerCase().replace(/_/g, '-')
      const authEmail = formData.email || `${sanitizedUsername}@guest.tacniju.org`

      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            username: formData.username.toLowerCase(),
            full_name: formData.fullName,
            district: "Guest",
            assembly: "Guest",
            address: formData.address,
            phone_number: formData.phoneNo,
            date_of_birth: formData.dateOfBirth,
            sex: formData.sex,
            rank: "Guest",
            email: authEmail,
            avatar_url: "",
          },
        },
      })

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('This username or email is already registered. Please try a different one.')
        }
        throw error
      }

      if (data.user) {
        try {
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: data.user.id,
            email: authEmail,
            full_name: formData.fullName,
            district: "Guest",
            assembly: "Guest",
            address: formData.address,
            phone_number: formData.phoneNo,
            date_of_birth: formData.dateOfBirth,
            sex: formData.sex,
            rank: "Guest",
            username: formData.username.toLowerCase(),
            avatar_url: "",
            updated_at: new Date().toISOString(),
          })

          if (profileError && profileError.code !== '42501') {
            throw profileError
          }
        } catch (profileError: any) {
          if (profileError?.code !== '42501') {
            throw profileError
          }
        }
      }

      if (formData.email) {
        router.push("/auth/check-email")
      } else {
        router.push("/dashboard")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#e8e6df] py-16 px-4 relative flex items-center justify-center selection:bg-[#ffbc42]/30 overflow-hidden text-[#1c1c1a]">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1c1c1a 2px, transparent 2px)', backgroundSize: '32px 32px' }}></div>
      
      <div className="max-w-4xl mx-auto w-full relative z-10 pt-10">
        <div className="absolute top-0 -left-2 md:-left-8 rotate-[-4deg] bg-white p-2 border-4 border-[#1c1c1a] shadow-[6px_6px_0_rgba(0,0,0,1)] z-20">
          <Link href="/">
            <Image 
              src="https://res.cloudinary.com/dzckvrvu9/image/upload/v1777993333/WhatsApp_Image_2026-05-01_at_08.37.56-removebg-preview_a8w3wt.png" 
              alt="TACN Logo" 
              width={150} 
              height={50} 
              className="h-10 w-auto object-contain cursor-pointer"
            />
          </Link>
        </div>

        <div className="bg-[#fcfcfb] border-4 border-[#1c1c1a] shadow-[12px_12px_0_rgba(0,0,0,1)] p-6 md:p-12 relative">
          <div className="mb-10 text-center border-b-4 border-[#1c1c1a] pb-6">
            <h1 className="font-anton text-4xl md:text-6xl text-[#1c1c1a] uppercase leading-none">GUEST REGISTRATION</h1>
            <p className="font-serif font-bold text-sm uppercase tracking-widest mt-4 text-[#004e89]">TACN IJU • AREA YOUTH MOVEMENT</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6 font-serif">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#004e89] rounded-none bg-[#f4f4f0]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNo" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">Phone Number *</Label>
                <Input
                  id="phoneNo"
                  type="tel"
                  required
                  value={formData.phoneNo}
                  onChange={(e) => handleInputChange("phoneNo", e.target.value)}
                  className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#004e89] rounded-none bg-[#f4f4f0]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#004e89] rounded-none bg-[#f4f4f0]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">Sex *</Label>
                <Select value={formData.sex} onValueChange={(value) => handleInputChange("sex", value)}>
                  <SelectTrigger className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#004e89] rounded-none bg-[#f4f4f0]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-[#1c1c1a] rounded-none shadow-[4px_4px_0_rgba(0,0,0,1)]">
                    <SelectItem value="Male" className="cursor-pointer focus:bg-[#004e89] focus:text-white">Male</SelectItem>
                    <SelectItem value="Female" className="cursor-pointer focus:bg-[#004e89] focus:text-white">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">Address *</Label>
              <Input
                id="address"
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#004e89] rounded-none bg-[#f4f4f0]"
              />
            </div>

            <div className="bg-[#ffbc42] p-4 sm:p-6 border-4 border-[#1c1c1a] shadow-[4px_4px_0_rgba(0,0,0,1)] mt-8">
              <h3 className="font-anton text-2xl uppercase text-[#1c1c1a] mb-6 border-b-2 border-[#1c1c1a] pb-2">
                ACCOUNT CREATION
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">Username *</Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      required
                      minLength={3}
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      onBlur={handleUsernameBlur}
                      className={`h-12 border-2 rounded-none bg-[#fcfcfb] pr-10 focus-visible:ring-0 focus-visible:border-[#004e89] ${
                        usernameAvailable === true ? 'border-[#009b72]' : usernameAvailable === false ? 'border-[#cc2936]' : 'border-[#1c1c1a]'
                      }`}
                    />
                    {usernameChecking && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-[#1c1c1a] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {usernameAvailable === false && <p className="text-sm font-bold text-[#cc2936]">Username is taken</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#004e89] rounded-none bg-[#fcfcfb]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#004e89] rounded-none bg-[#fcfcfb]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#004e89] rounded-none bg-[#fcfcfb]"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-[#cc2936] text-white border-4 border-[#1c1c1a] font-bold shadow-[2px_2px_0_rgba(0,0,0,1)] uppercase">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="submit"
                className="flex-[2] h-14 bg-[#004e89] hover:bg-[#003865] text-white font-anton uppercase text-xl rounded-none border-4 border-[#1c1c1a] shadow-[6px_6px_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0_rgba(0,0,0,1)] transition-all"
                disabled={isLoading || usernameAvailable === false}
              >
                {isLoading ? "REGISTERING..." : "REGISTER AS GUEST"}
              </Button>
              <Link href="/auth/login" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-14 bg-white hover:bg-[#e8e6df] text-[#1c1c1a] font-anton uppercase text-xl rounded-none border-4 border-[#1c1c1a] shadow-[6px_6px_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0_rgba(0,0,0,1)] transition-all"
                >
                  SIGN IN
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
