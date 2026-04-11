"use client"

import type React from "react"

import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Check if user is admin after successful login
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .maybeSingle()

      console.log("Admin Login Debug:", { userId: data.user.id, profile, profileError })

      if (profileError) {
        console.error("Profile error:", profileError)
        throw new Error("Failed to verify admin status")
      }

      if (!profile?.is_admin) {
        // Sign out the user if they're not admin
        await supabase.auth.signOut()
        setError("Access denied. Admin privileges required.")
        setIsLoading(false)
        return
      }

      // Set explicit login mode cookie for middleware
      document.cookie = "login_mode=admin; path=/; max-age=2592000; SameSite=Lax" // 30 days

      // Redirect to admin dashboard
      router.push("/admin")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1c1c1a] py-16 px-4 relative flex items-center justify-center selection:bg-[#ff3b30]/30 text-[#f4f4f0] overflow-hidden">
      {/* Grungy background pattern */}
      <div className="absolute inset-0 opacity-[0.2] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Floating Accent Element */}
        <div className="absolute -top-6 -right-6 md:-right-10 rotate-[8deg] bg-[#cc2936] text-white py-2 px-6 border-4 border-[#1c1c1a] shadow-[6px_6px_0_rgba(0,0,0,1)] z-20">
          <h2 className="font-anton text-xl uppercase tracking-wider">RESTRICTED ZONE</h2>
        </div>

        <div className="bg-[#fcfcfb] border-4 border-[#1c1c1a] shadow-[12px_12px_0_rgba(0,0,0,1)] p-8 md:p-10 relative">
          
          <div className="mb-8 text-center border-b-4 border-[#1c1c1a] pb-6">
            <div className="flex justify-center items-center gap-1 mb-2">
              <span className="font-anton text-4xl text-[#cc2936]">T</span>
              <span className="font-anton text-4xl text-[#009b72]">A</span>
              <span className="font-anton text-4xl text-[#ffbc42]">C</span>
              <span className="font-anton text-4xl text-[#004e89]">N</span>
            </div>
            <h1 className="font-anton text-3xl md:text-5xl text-[#1c1c1a] uppercase leading-none mt-2">ADMIN PORTAL</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 font-serif">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@church.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-4 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#cc2936] rounded-none bg-white text-[#1c1c1a]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold uppercase tracking-wider text-[#1c1c1a]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-4 border-[#1c1c1a] focus-visible:ring-0 focus-visible:border-[#cc2936] rounded-none bg-white text-[#1c1c1a]"
              />
            </div>
            
            {error && (
              <div className="p-3 bg-[#cc2936] text-white border-2 border-[#1c1c1a] font-bold shadow-[2px_2px_0_rgba(0,0,0,1)] uppercase text-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 bg-[#cc2936] hover:bg-[#a1202a] text-white font-anton uppercase text-xl rounded-none border-4 border-[#1c1c1a] shadow-[6px_6px_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0_rgba(0,0,0,1)] transition-all mt-4" 
              disabled={isLoading}
            >
              {isLoading ? "SIGNING IN..." : "SIGN IN AS ADMIN"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t-4 border-[#1c1c1a] space-y-4">
            <div className="text-center">
              <Link href="/auth/login" className="text-sm font-bold text-[#1c1c1a] uppercase hover:underline opacity-50 hover:opacity-100 transition-opacity">
                Regular Member Login
              </Link>
            </div>
            <div className="text-center font-serif text-[#1c1c1a] font-bold text-xs opacity-50">
              Admin access required. Contact IT if you need privileges.
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
