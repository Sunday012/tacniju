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
    departments: [] as string[],
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

  const handleDepartmentChange = (department: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      departments: checked ? [...prev.departments, department] : prev.departments.filter((d) => d !== department),
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

    // Check username availability one more time before registration
    if (usernameAvailable === false) {
      setError("Username is already taken")
      setIsLoading(false)
      return
    }

    try {
      // Use fake email for username-only accounts, real email if provided
      const authEmail = formData.email || `${formData.username.toLowerCase()}@yourapp.local`
      
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
            department: formData.departments.join(", "),
            email: formData.email || null,
          },
        },
      })
      
      if (error) throw error
      
      // 👇 after signUp, insert into profiles
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,  // important: must match auth.users.id
            email: formData.email || null,
            full_name: formData.fullName,
            district: formData.district,
            assembly: formData.assembly,
            address: formData.address,
            office_position: formData.positionOffice || null,
            family: formData.family || null,
            guardian_spouse_number: formData.guardianSpouseNo || null,
            reservation_number: formData.reservationNumber || null,
            phone_number: formData.phoneNo,
            date_of_birth: formData.dateOfBirth,
            sex: formData.sex,
            rank: "C-Multitude",
            department: formData.departments.length > 0 ? formData.departments.join(", ") : null,
            username: formData.username.toLowerCase(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
      
        if (profileError) throw profileError
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto w-full">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4 gap-2 sm:gap-0">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-0 sm:mr-4 backdrop-blur-sm mb-2 sm:mb-0">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-lg font-bold leading-tight">
                  THE APOSTOLIC CHURCH NIGERIA FCT FIELD,
                  <br />
                  IJU-STATION AREA
                  <br />
                  AREA YOUTH MOVEMENT
                </h1>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-white/20 backdrop-blur-sm py-3 rounded-lg">
              Registration Form
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-indigo-500 rounded-lg"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reservationNumber" className="text-sm font-semibold text-gray-700">
                    Reservation Number
                  </Label>
                  <Input
                    id="reservationNumber"
                    type="text"
                    value={formData.reservationNumber}
                    onChange={(e) => handleInputChange("reservationNumber", e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-indigo-500 rounded-lg"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="district" className="text-sm font-semibold text-gray-700">
                    District *
                  </Label>
                  <Input
                    id="district"
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => handleInputChange("district", e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-indigo-500 rounded-lg"
                    placeholder="Enter your district"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNo" className="text-sm font-semibold text-gray-700">
                    Phone Number *
                  </Label>
                  <Input
                    id="phoneNo"
                    type="tel"
                    required
                    value={formData.phoneNo}
                    onChange={(e) => handleInputChange("phoneNo", e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-indigo-500 rounded-lg"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="assembly" className="text-sm font-semibold text-gray-700">
                    Assembly *
                  </Label>
                  <Input
                    id="assembly"
                    type="text"
                    required
                    value={formData.assembly}
                    onChange={(e) => handleInputChange("assembly", e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-indigo-500 rounded-lg"
                    placeholder="Enter your assembly"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-700">
                      Date of Birth *
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-indigo-500 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sex" className="text-sm font-semibold text-gray-700">
                      Sex *
                    </Label>
                    <Select value={formData.sex} onValueChange={(value) => handleInputChange("sex", value)}>
                      <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-indigo-500 rounded-lg">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                  Address *
                </Label>
                <Input
                  id="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="h-12 border-2 border-gray-200 focus:border-indigo-500 rounded-lg"
                  placeholder="Enter your full address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="positionOffice" className="text-sm font-semibold text-gray-700">
                    Position/Office
                  </Label>
                  <Input
                    id="positionOffice"
                    type="text"
                    value={formData.positionOffice}
                    onChange={(e) => handleInputChange("positionOffice", e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-indigo-500 rounded-lg"
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="family" className="text-sm font-semibold text-gray-700">
                    Family
                  </Label>
                  <Input
                    id="family"
                    type="text"
                    value={formData.family}
                    onChange={(e) => handleInputChange("family", e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-indigo-500 rounded-lg"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="guardianSpouseNo" className="text-sm font-semibold text-gray-700">
                    Guardian/Spouse Number
                  </Label>
                  <Input
                    id="guardianSpouseNo"
                    type="text"
                    value={formData.guardianSpouseNo}
                    onChange={(e) => handleInputChange("guardianSpouseNo", e.target.value)}
                    className="h-12 border-2 border-gray-200 focus:border-indigo-500 rounded-lg"
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Department</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                    {["Music", "Ushering", "Drama", "Clean Up", "Intercessory"].map((dept) => (
                      <div key={dept} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={dept}
                          name="department"
                          checked={formData.departments[0] === dept}
                          onChange={() => handleDepartmentChange(dept, true)}
                          className="border-2 border-gray-300 accent-indigo-600"
                        />
                        <Label htmlFor={dept} className="text-sm font-medium text-gray-700">
                          {dept}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 sm:p-6 rounded-lg border-2 border-indigo-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                      Username *
                    </Label>
                    <div className="relative">
                      <Input
                        id="username"
                        type="text"
                        required
                        minLength={3}
                        value={formData.username}
                        onChange={(e) => handleInputChange("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        onBlur={handleUsernameBlur}
                        className={`h-12 border-2 focus:border-indigo-500 rounded-lg bg-white pr-10 ${
                          usernameAvailable === true ? 'border-green-500' : 
                          usernameAvailable === false ? 'border-red-500' : 
                          'border-gray-200'
                        }`}
                        placeholder="Choose a username (min 3 chars)"
                      />
                      {usernameChecking && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      {!usernameChecking && usernameAvailable === true && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      {!usernameChecking && usernameAvailable === false && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {usernameAvailable === false && (
                      <p className="text-sm text-red-600">Username is already taken</p>
                    )}
                    {usernameAvailable === true && (
                      <p className="text-sm text-green-600">Username is available</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                      Email (Optional)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-indigo-500 rounded-lg bg-white"
                      placeholder="your.email@example.com"
                    />
                    <p className="text-xs text-gray-500">
                      Email is optional. If not provided, you&apos;ll use username-only login.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                      Password *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-indigo-500 rounded-lg bg-white"
                      placeholder="At least 6 characters"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                      Confirm Password *
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      minLength={6}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-indigo-500 rounded-lg bg-white"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              </div>
              {error && (
                <div className="p-4 text-sm text-red-700 bg-red-50 border-2 border-red-200 rounded-lg flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  {error}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="submit"
                  className="flex-1 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200"
                  disabled={isLoading || usernameAvailable === false}
                >
                  {isLoading ? "Registering..." : "Complete Registration"}
                </Button>
                <Link href="/auth/login" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-14 border-2 border-gray-300 hover:border-indigo-500 hover:text-indigo-600 font-semibold rounded-lg transition-all duration-200 bg-transparent"
                  >
                    Already have an account?
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}