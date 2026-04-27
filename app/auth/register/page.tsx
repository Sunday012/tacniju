"use client"
import type React from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "", // Optional field
    fullName: "",
    district: "",
    assembly: "",
    address: "",
    positionOffice: "",
    family: "",
    guardianSpouseNo: "",
    reservationNumber: "",
    phoneNo: "",
    dateOfBirth: "",
    sex: "",
    department: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Reset username availability when username changes
    if (field === "username") {
      setUsernameAvailable(null)
    }
  }

  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) return

    setUsernameChecking(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase.rpc('check_username_exists', {
        username_to_check: username.toLowerCase()
      })

      if (error) {
        console.error('Error checking username:', error)
        setUsernameAvailable(null)
        return
      }

      setUsernameAvailable(!data) // true if username is available (doesn't exist)
    } catch (error) {
      console.error('Error checking username:', error)
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

  const handleDepartmentChange = (department: string) => {
    setFormData((prev) => ({
      ...prev,
      department: department,
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    // Validation
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

    if (!formData.username) {
      setError("Username is required")
      setIsLoading(false)
      return
    }

    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters long")
      setIsLoading(false)
      return
    }

    if (!formData.reservationNumber) {
      setError("Reservation number is required")
      setIsLoading(false)
      return
    }

    // Check username availability one more time before registration
    if (usernameAvailable === false) {
      setError("Username is already taken")
      setIsLoading(false)
      return
    }

    try {
      // Use fake email for username-only accounts, real email if provided
      const sanitizedUsername = formData.username.toLowerCase().replace(/_/g, '-')
      const authEmail = formData.email || `${sanitizedUsername}@user.tacniju.org`

      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            username: formData.username.toLowerCase(),
            full_name: formData.fullName,
            district: formData.district,
            assembly: formData.assembly,
            address: formData.address,
            position_office: formData.positionOffice,
            family: formData.family,
            guardian_spouse_no: formData.guardianSpouseNo,
            reservation_number: formData.reservationNumber,
            phone_number: formData.phoneNo,
            date_of_birth: formData.dateOfBirth,
            sex: formData.sex,
            rank: "C-Multitude",
            department: formData.department,
            email: authEmail,
            avatar_url: "",
          },
        },
      })

      if (error) {
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          throw new Error('This username or email is already registered. Please try a different one.')
        }
        throw error
      }

      // 👇 after signUp, insert into profiles
      // The database trigger will handle the initial creation using metadata.
      // We attempt an update here just in case, but if it fails due to RLS (no session),
      // we can safely ignore it because the trigger works as Security Definer.
      if (data.user) {
        try {
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: data.user.id,
            email: authEmail,
            full_name: formData.fullName,
            district: formData.district,
            assembly: formData.assembly,
            address: formData.address,
            office_position: formData.positionOffice || null,
            family: formData.family,
            guardian_spouse_number: formData.guardianSpouseNo || null,
            reservation_number: formData.reservationNumber,
            phone_number: formData.phoneNo,
            date_of_birth: formData.dateOfBirth,
            sex: formData.sex,
            rank: "C-Multitude",
            department: formData.department || null,
            username: formData.username.toLowerCase(),
            avatar_url: "",
            updated_at: new Date().toISOString(),
          })

          if (profileError) {
            // If RLS error (42501), it means user isn't logged in yet (email confirm pending),
            // but the TRIGGER has already saved the data from metadata. Safe to ignore.
            if (profileError.code === '42501') {
              console.warn('Profile upsert blocked by RLS (expected if email not verified). Trigger should have handled it.', profileError)
            } else {
              console.error('Profile upsert failed:', profileError)
              // Only throw if it's NOT an RLS error
              throw profileError
            }
          }
        } catch (profileError: any) {
          if (profileError?.code !== '42501') {
            console.error('Profile creation/update failed:', profileError)
            throw profileError
          }
        }
      }


      // if (error) {
      //   const errMsg = (typeof error === "object" && error !== null && "message" in error && typeof (error as any).message === "string")
      //     ? (error as any).message
      //     : "";
      //   if (errMsg.includes('User already registered')) {
      //     throw new Error('Username is already taken');
      //   }
      //   throw error;
      // }

      // Redirect based on whether email was provided
      if (formData.email) {
        router.push("/auth/check-email")
      } else {
        // For username-only accounts, go directly to dashboard since no email confirmation needed
        router.push("/dashboard")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#e8e6df] py-16 px-4 relative flex items-center justify-center selection:bg-[#ff3b30]/30 overflow-hidden text-[#1c1c1a]">
      {/* Grungy background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1c1c1a 2px, transparent 2px)', backgroundSize: '32px 32px' }}></div>
      
      <div className="max-w-4xl mx-auto w-full relative z-10 pt-10">
        
        {/* Floating Logo Element */}
        <div className="absolute top-0 -left-2 md:-left-8 rotate-[-4deg] bg-[#cc2936] text-white py-2 px-6 border-4 border-[#1c1c1a] shadow-[6px_6px_0_rgba(0,0,0,1)] z-20">
          <Link href="/">
            <h2 className="font-anton text-2xl uppercase tracking-wider cursor-pointer">JOIN THE MOVEMENT</h2>
          </Link>
        </div>

        <div className="bg-[#fcfcfb] border-4 border-[#1c1c1a] shadow-[12px_12px_0_rgba(0,0,0,1)] p-6 md:p-12 relative">
          
          <div className="mb-10 text-center border-b-4 border-[#1c1c1a] pb-6">
            <h1 className="font-anton text-4xl md:text-6xl text-[#1c1c1a] uppercase leading-none">REGISTRATION FORM</h1>
            <p className="font-serif font-bold text-sm uppercase tracking-widest mt-4 text-[#cc2936]">TACN IJU • AREA YOUTH MOVEMENT</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6 font-serif">
            {/* Split layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#cc2936] rounded-none bg-[#f4f4f0]"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reservationNumber" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">Reservation Number *</Label>
                <Input
                  id="reservationNumber"
                  type="text"
                  required
                  value={formData.reservationNumber}
                  onChange={(e) => handleInputChange("reservationNumber", e.target.value)}
                  className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#cc2936] rounded-none bg-[#f4f4f0]"
                  placeholder="Enter your reservation number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="district" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">District *</Label>
                <Input
                  id="district"
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => handleInputChange("district", e.target.value)}
                  className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#cc2936] rounded-none bg-[#f4f4f0]"
                  placeholder="Enter your district"
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
                  className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#cc2936] rounded-none bg-[#f4f4f0]"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="assembly" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">Assembly *</Label>
                <Input
                  id="assembly"
                  type="text"
                  required
                  value={formData.assembly}
                  onChange={(e) => handleInputChange("assembly", e.target.value)}
                  className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#cc2936] rounded-none bg-[#f4f4f0]"
                  placeholder="Enter your assembly"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#cc2936] rounded-none bg-[#f4f4f0]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">Sex *</Label>
                  <Select value={formData.sex} onValueChange={(value) => handleInputChange("sex", value)}>
                    <SelectTrigger className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#cc2936] rounded-none bg-[#f4f4f0]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-[#1c1c1a] rounded-none shadow-[4px_4px_0_rgba(0,0,0,1)]">
                      <SelectItem value="Male" className="cursor-pointer focus:bg-[#009b72] focus:text-white">Male</SelectItem>
                      <SelectItem value="Female" className="cursor-pointer focus:bg-[#009b72] focus:text-white">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#cc2936] rounded-none bg-[#f4f4f0]"
                placeholder="Enter your full address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="positionOffice" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">Position/Office</Label>
                <Input
                  id="positionOffice"
                  type="text"
                  value={formData.positionOffice}
                  onChange={(e) => handleInputChange("positionOffice", e.target.value)}
                  className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#cc2936] rounded-none bg-[#f4f4f0]"
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="family" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">Family</Label>
                <Select value={formData.family} onValueChange={(value) => handleInputChange("family", value)}>
                  <SelectTrigger className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#cc2936] rounded-none bg-[#f4f4f0]">
                    <SelectValue placeholder="Select your family" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-[#1c1c1a] rounded-none shadow-[4px_4px_0_rgba(0,0,0,1)]">
                    <SelectItem value="Eden" className="cursor-pointer focus:bg-[#009b72] focus:text-white">Eden</SelectItem>
                    <SelectItem value="Taberah" className="cursor-pointer focus:bg-[#009b72] focus:text-white">Taberah</SelectItem>
                    <SelectItem value="Bethel" className="cursor-pointer focus:bg-[#009b72] focus:text-white">Bethel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="guardianSpouseNo" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">Guardian/Spouse No</Label>
                <Input
                  id="guardianSpouseNo"
                  type="text"
                  value={formData.guardianSpouseNo}
                  onChange={(e) => handleInputChange("guardianSpouseNo", e.target.value)}
                  className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#cc2936] rounded-none bg-[#f4f4f0]"
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">Department</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border-2 border-[#1c1c1a] bg-[#f4f4f0]">
                  {["Music", "Ushering", "Drama", "Clean Up", "Intercessory"].map((dept) => (
                    <div key={dept} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={dept}
                        name="department"
                        checked={formData.department === dept}
                        onChange={() => handleDepartmentChange(dept)}
                        className="border-2 border-[#1c1c1a] accent-[#cc2936] w-4 h-4 cursor-pointer"
                      />
                      <Label htmlFor={dept} className="text-sm font-bold cursor-pointer text-[#1c1c1a]">
                        {dept}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
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
                      className={`h-12 border-2 rounded-none bg-[#fcfcfb] pr-10 focus-visible:ring-0 focus-visible:border-[#cc2936] ${
                        usernameAvailable === true ? 'border-[#009b72]' : usernameAvailable === false ? 'border-[#cc2936]' : 'border-[#1c1c1a]'
                      }`}
                      placeholder="Choose a username"
                    />
                    {usernameChecking && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-[#1c1c1a] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {usernameAvailable === false && <p className="text-sm font-bold text-[#cc2936]">Username is taken</p>}
                  {usernameAvailable === true && <p className="text-sm font-bold text-[#009b72]">Username is available</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#cc2936] rounded-none bg-[#fcfcfb]"
                    placeholder="Enter email (optional)"
                  />
                  <p className="text-xs text-[#1c1c1a] opacity-80 pb-2 border-b-2 border-dashed border-[#1c1c1a]">
                    If left empty, you will use username ONLY to login.
                  </p>
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
                    className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#cc2936] rounded-none bg-[#fcfcfb]"
                    placeholder="At least 6 characters"
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
                    className="h-12 border-2 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#cc2936] rounded-none bg-[#fcfcfb]"
                    placeholder="Confirm your password"
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
                className="flex-[2] h-14 bg-[#009b72] hover:bg-[#007a5a] text-white font-anton uppercase text-xl rounded-none border-4 border-[#1c1c1a] shadow-[6px_6px_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0_rgba(0,0,0,1)] transition-all"
                disabled={isLoading || usernameAvailable === false}
              >
                {isLoading ? "JOINING..." : "JOIN FAMILY"}
              </Button>
              <Link href="/auth/guest-register" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-14 bg-[#ffbc42] hover:bg-[#e0a436] text-[#1c1c1a] font-anton uppercase text-xl rounded-none border-4 border-[#1c1c1a] shadow-[6px_6px_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0_rgba(0,0,0,1)] transition-all"
                >
                  AS GUEST
                </Button>
              </Link>
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