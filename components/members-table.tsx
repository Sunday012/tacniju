"use client"
import { useState } from "react"
import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Download, Users, Search, Filter, Eye, UserCog, FileText } from "lucide-react"
// ============================================================================
// INTERFACES (Keep your existing interfaces - no changes)
// ============================================================================
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
  is_admin: boolean
  created_at: string
}
interface MembersTableProps {
  members: Profile[]
}
export function MembersTable({ members }: MembersTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterRank, setFilterRank] = useState("all")
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards") // NEW: View mode toggle
  const router = useRouter()
  console.log("member", selectedMember)
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = filterDepartment === "all" || member.department === filterDepartment
    const matchesRank = filterRank === "all" || member.rank === filterRank
    return matchesSearch && matchesDepartment && matchesRank
  })
  const updateMemberRank = async (memberId: string, newRank: string) => {
    setIsUpdating(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.from("profiles").update({ rank: newRank }).eq("id", memberId)
      if (error) throw error
      router.refresh()
      setSelectedMember(null)
    } catch (error) {
      console.error("Error updating rank:", error)
    } finally {
      setIsUpdating(false)
    }
  }
  const addAttendance = async (memberId: string, eventName: string) => {
    const supabase = createClient()
    try {
      const { error } = await supabase.from("attendance").insert({
        user_id: memberId,
        event_name: eventName,
        event_date: new Date().toISOString().split("T")[0],
        attended: true,
      })
      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error adding attendance:", error)
    }
  }
  // ============================================================================
  // NEW FUNCTION: Individual Member PDF Generation
  // ============================================================================
  const generateIndividualPDF = (member: Profile) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const currentDate = new Date().toLocaleDateString()
    const joinDate = new Date(member.created_at).toLocaleDateString()
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${member.full_name} - Member Profile</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 20px;
            }
            
            .container {
              background: white;
              border-radius: 15px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              overflow: hidden;
              max-width: 600px;
              margin: 0 auto;
            }
            
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              position: relative;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
              animation: float 6s ease-in-out infinite;
            }
            
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(180deg); }
            }
            
            .logo {
              width: 80px;
              height: 80px;
              background: rgba(255,255,255,0.2);
              border-radius: 50%;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 36px;
              backdrop-filter: blur(10px);
            }
            
            .church-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            
            .form-title {
              font-size: 16px;
              opacity: 0.9;
              margin-bottom: 10px;
            }
            
            .date-generated {
              font-size: 12px;
              opacity: 0.8;
              margin-top: 10px;
            }
            
            .content {
              padding: 40px;
            }
            
            .member-profile {
              text-align: center;
              margin-bottom: 40px;
            }
            
            .profile-avatar {
              width: 120px;
              height: 120px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 50%;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 48px;
              font-weight: bold;
              box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            }
            
            .member-name {
              font-size: 28px;
              font-weight: bold;
              color: #333;
              margin-bottom: 8px;
            }
            
            .member-email {
              font-size: 16px;
              color: #666;
              margin-bottom: 15px;
            }
            
            .rank-badge {
              display: inline-block;
              padding: 8px 20px;
              border-radius: 25px;
              font-weight: bold;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
              ${member.rank === "A-Chosen" 
                ? "background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;" 
                : member.rank === "B-Called" 
                ? "background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;" 
                : "background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333;"
              }
            }
            
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-top: 30px;
            }
            
            .detail-card {
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              padding: 20px;
              border-radius: 12px;
              border-left: 4px solid #667eea;
              box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            }
            
            .detail-label {
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              color: #667eea;
              margin-bottom: 5px;
              letter-spacing: 0.5px;
            }
            
            .detail-value {
              font-size: 16px;
              font-weight: 600;
              color: #333;
            }
            
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              border-top: 1px solid #e9ecef;
              color: #666;
              font-size: 12px;
            }
            
            @media print {
              body { background: white !important; padding: 0 !important; }
              .container { box-shadow: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">✝</div>
              <div class="church-name">THE APOSTOLIC CHURCH NIGERIA</div>
              <div class="church-name">CT FIELD, IJU-STATION AREA</div>
              <div class="form-title">AREA YOUTH MOVEMENT</div>
              <div class="form-title">Member Profile</div>
              <div class="date-generated">Generated on: ${currentDate}</div>
            </div>
            
            <div class="content">
              <div class="member-profile">
                <div class="profile-avatar">${member.full_name.charAt(0).toUpperCase()}</div>
                <div class="member-name">${member.full_name}</div>
                <div class="member-email">${member.email}</div>
                <div class="rank-badge">${member.rank || 'C-Multitude'}</div>
              </div>
              
              <div class="details-grid">
                <div class="detail-card">
                  <div class="detail-label">Phone Number</div>
                  <div class="detail-value">${member.phone_number || 'Not provided'}</div>
                </div>
                
                <div class="detail-card">
                  <div class="detail-label">Gender</div>
                  <div class="detail-value">${member.sex || 'Not specified'}</div>
                </div>
                
                <div class="detail-card">
                  <div class="detail-label">District</div>
                  <div class="detail-value">${member.district || 'Not specified'}</div>
                </div>
                
                <div class="detail-card">
                  <div class="detail-label">Assembly</div>
                  <div class="detail-value">${member.assembly || 'Not specified'}</div>
                </div>
                
                <div class="detail-card">
                  <div class="detail-label">Department</div>
                  <div class="detail-value">${member.department || 'Not assigned'}</div>
                </div>
                
                <div class="detail-card">
                  <div class="detail-label">Office Position</div>
                  <div class="detail-value">${member.office_position || 'Member'}</div>
                </div>
                
                <div class="detail-card">
                  <div class="detail-label">Address</div>
                  <div class="detail-value">${member.address || 'Not provided'}</div>
                </div>
                
                <div class="detail-card">
                  <div class="detail-label">Date of Birth</div>
                  <div class="detail-value">${member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : 'Not provided'}</div>
                </div>
                
                <div class="detail-card">
                  <div class="detail-label">Family</div>
                  <div class="detail-value">${member.family || 'Not specified'}</div>
                </div>
                
                <div class="detail-card">
                  <div class="detail-label">Guardian/Spouse Number</div>
                  <div class="detail-value">${member.guardian_spouse_number || 'Not provided'}</div>
                </div>
                
                <div class="detail-card">
                  <div class="detail-label">Reservation Number</div>
                  <div class="detail-value">${member.reservation_number || 'Not assigned'}</div>
                </div>
                
                <div class="detail-card">
                  <div class="detail-label">Member Since</div>
                  <div class="detail-value">${joinDate}</div>
                </div>
              </div>
            </div>
            
            <div class="footer">
              <p>This document contains confidential member information. Please handle with care.</p>
              <p>© ${new Date().getFullYear()} The Apostolic Church Nigeria - CT Field, Iju-Station Area</p>
            </div>
          </div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  // ============================================================================
  // NEW FUNCTION: PDF GENERATION (Colorful Church-Style PDF)
  // ============================================================================
  const generatePDF = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    const currentDate = new Date().toLocaleDateString()
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Church Youth Members Registry</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 20px;
            }
            
            .container {
              background: white;
              border-radius: 15px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              overflow: hidden;
              max-width: 800px;
              margin: 0 auto;
            }
            
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              position: relative;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
              animation: float 6s ease-in-out infinite;
            }
            
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(180deg); }
            }
            
            .logo {
              width: 80px;
              height: 80px;
              background: rgba(255,255,255,0.2);
              border-radius: 50%;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 36px;
              backdrop-filter: blur(10px);
            }
            
            .church-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            
            .form-title {
              font-size: 16px;
              opacity: 0.9;
              margin-bottom: 10px;
            }
            
            .date-generated {
              font-size: 12px;
              opacity: 0.8;
              margin-top: 10px;
            }
            
            .content {
              padding: 30px;
            }
            
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 30px;
            }
            
            .stat-card {
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              color: white;
              padding: 20px;
              border-radius: 15px;
              text-align: center;
              box-shadow: 0 8px 16px rgba(0,0,0,0.1);
            }
            
            .stat-number {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .stat-label {
              font-size: 14px;
              opacity: 0.9;
            }
            
            .members-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
              gap: 20px;
              margin-top: 20px;
            }
            
            .member-card {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 25px;
              border-radius: 15px;
              box-shadow: 0 8px 16px rgba(0,0,0,0.1);
              position: relative;
              overflow: hidden;
            }
            
            .member-card::before {
              content: '';
              position: absolute;
              top: 0;
              right: 0;
              width: 100px;
              height: 100px;
              background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
              border-radius: 0 15px 0 100px;
            }
            
            .member-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 15px;
            }
            
            .member-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .member-email {
              font-size: 12px;
              opacity: 0.8;
            }
            
            .member-rank {
              background: rgba(255,255,255,0.2);
              padding: 5px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              backdrop-filter: blur(10px);
            }
            
            .member-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              font-size: 14px;
            }
            
            .detail-item {
              background: rgba(255,255,255,0.1);
              padding: 8px 12px;
              border-radius: 8px;
              backdrop-filter: blur(10px);
            }
            
            .detail-label {
              font-weight: bold;
              margin-bottom: 2px;
            }
            
            .detail-value {
              opacity: 0.9;
            }
            
            @media print {
              body { background: white !important; padding: 0 !important; }
              .container { box-shadow: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">✝</div>
              <div class="church-name">THE APOSTOLIC CHURCH NIGERIA</div>
              <div class="church-name">CT FIELD, IJU-STATION AREA</div>
              <div class="form-title">AREA YOUTH MOVEMENT</div>
              <div class="form-title">Members Registry</div>
              <div class="date-generated">Generated on: ${currentDate}</div>
            </div>
            
            <div class="content">
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">${filteredMembers.length}</div>
                  <div class="stat-label">Total Members</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${filteredMembers.filter(m => m.rank === 'A-Chosen').length}</div>
                  <div class="stat-label">A-Chosen</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${filteredMembers.filter(m => m.rank === 'B-Called').length}</div>
                  <div class="stat-label">B-Called</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${filteredMembers.filter(m => !m.rank || m.rank === 'C-Multitude').length}</div>
                  <div class="stat-label">C-Multitude</div>
                </div>
              </div>
              
              <div class="members-grid">
                ${filteredMembers.map(member => `
                  <div class="member-card">
                    <div class="member-header">
                      <div>
                        <div class="member-name">${member.full_name}</div>
                        <div class="member-email">${member.email}</div>
                      </div>
                      <div class="member-rank">${member.rank || 'C-Multitude'}</div>
                    </div>
                    <div class="member-details">
                      <div class="detail-item">
                        <div class="detail-label">District</div>
                        <div class="detail-value">${member.district || 'Not specified'}</div>
                      </div>
                      <div class="detail-item">
                        <div class="detail-label">Assembly</div>
                        <div class="detail-value">${member.assembly || 'Not specified'}</div>
                      </div>
                      <div class="detail-item">
                        <div class="detail-label">Department</div>
                        <div class="detail-value">${member.department || 'Not assigned'}</div>
                      </div>
                      <div class="detail-item">
                        <div class="detail-label">Position</div>
                        <div class="detail-value">${member.office_position || 'Member'}</div>
                      </div>
                      <div class="detail-item">
                        <div class="detail-label">Phone</div>
                        <div class="detail-value">${member.phone_number || 'Not provided'}</div>
                      </div>
                      <div class="detail-item">
                        <div class="detail-label">Sex</div>
                        <div class="detail-value">${member.sex || 'Not specified'}</div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }
  // ============================================================================
  // NEW COMPONENT: Mobile Card View
  // ============================================================================
  // The card is not fully responsive because the layout uses fixed paddings and flex/grid that don't adapt well to small screens.
  // Make the card and its content responsive with width, padding, and flex/grid tweaks.

  const MemberCard = ({ member }: { member: Profile }) => (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-l-indigo-500 hover:shadow-lg transition-all duration-300 w-full max-w-md mx-auto sm:max-w-full">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-800 break-words">{member.full_name}</h3>
            <p className="text-sm text-gray-600 break-all">{member.email}</p>
          </div>
          <div className="mt-2 sm:mt-0 flex-shrink-0">
            <Badge
              variant="secondary"
              className={`${
                member.rank === "A-Chosen"
                  ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                  : member.rank === "B-Called"
                  ? "bg-blue-100 text-blue-800 border-blue-300"
                  : "bg-gray-100 text-gray-800 border-gray-300"
              }`}
            >
              {member.rank || "C-Multitude"}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Department:</span>
            {member.department ? (
              <Badge variant="outline" className="text-xs">{member.department}</Badge>
            ) : (
              <span className="text-xs text-gray-400">Not assigned</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Assembly:</span>
            <span className="text-sm text-gray-700">{member.assembly || "Not specified"}</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog
            open={selectedMember?.id === member.id}
            onOpenChange={(open) => {
              if (open) setSelectedMember(member)
              else setSelectedMember(null)
            }}
          >
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="flex-1 h-[48px] cursor-pointer"
              >
                <UserCog className="w-4 h-4 mr-1" />
                Manage
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[80vh] bg-white rounded-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserCog className="w-5 h-5" />
                  Manage {member.full_name}
                </DialogTitle>
                <DialogDescription>Update member rank and add attendance records</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Update Rank</label>
                  <Select
                    value={selectedMember?.id === member.id ? selectedMember.rank || "C-Multitude" : member.rank || "C-Multitude"}
                    onValueChange={(value) => updateMemberRank(member.id, value)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select rank" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="A-Chosen">A-Chosen</SelectItem>
                      <SelectItem value="B-Called">B-Called</SelectItem>
                      <SelectItem value="C-Multitude">C-Multitude</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Quick Attendance</label>
                  <Select
                    onValueChange={(value) => addAttendance(member.id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Sunday Service">Sunday Service</SelectItem>
                      <SelectItem value="Youth Meeting">Youth Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Individual PDF Download Button */}
          <Button 
            variant="outline" 
            onClick={() => generateIndividualPDF(member)}
            className="text-green-600 hover:text-green-700 h-[48px] hover:bg-green-50 flex-1 sm:flex-none cursor-pointer"
          >
            <FileText className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
  // ============================================================================
  // MAIN RENDER (Enhanced UI with responsive design)
  // ============================================================================
  return (
    <div className="space-y-6">
      {/* ============================================================================ */}
      {/* NEW SECTION: Statistics Overview Cards */}
      {/* ============================================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Members</p>
                <p className="text-2xl font-bold">{filteredMembers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">A-Chosen</p>
                <p className="text-2xl font-bold">{filteredMembers.filter(m => m.rank === 'A-Chosen').length}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-800 font-bold">A</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">B-Called</p>
                <p className="text-2xl font-bold">{filteredMembers.filter(m => m.rank === 'B-Called').length}</p>
              </div>
              <div className="w-8 h-8 bg-indigo-400 rounded-full flex items-center justify-center text-indigo-800 font-bold">B</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm">C-Multitude</p>
                <p className="text-2xl font-bold">{filteredMembers.filter(m => !m.rank || m.rank === 'C-Multitude').length}</p>
              </div>
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-gray-800 font-bold">C</div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* ============================================================================ */}
      {/* ENHANCED SECTION: Search and Filters (Your original logic + better UI) */}
      {/* ============================================================================ */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search members by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Music">Music</SelectItem>
                  <SelectItem value="Ushering">Ushering</SelectItem>
                  <SelectItem value="Drama">Drama</SelectItem>
                  <SelectItem value="Clean Up">Clean Up</SelectItem>
                  <SelectItem value="Intercessory">Intercessory</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterRank} onValueChange={setFilterRank}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Rank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ranks</SelectItem>
                  <SelectItem value="A-Chosen">A-Chosen</SelectItem>
                  <SelectItem value="B-Called">B-Called</SelectItem>
                  <SelectItem value="C-Multitude">C-Multitude</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
                className=""
              >
                Table View
              </Button>
              <Button
                variant={viewMode === "cards" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("cards")}
                className=""
              >
                <Eye className="w-4 h-4 mr-1" />
                Card View
              </Button>
            </div>
            
            {/* NEW: PDF Download Button */}
            <Button onClick={generatePDF} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* ============================================================================ */}
      {/* RESPONSIVE CONTENT: Table for Desktop, Cards for Mobile */}
      {/* ============================================================================ */}
      {viewMode === "table" ? (
        // DESKTOP TABLE VIEW (Enhanced version of your original table)
        <Card className="hidden md:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Rank</TableHead>
                  <TableHead className="font-semibold">Assembly</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium">{member.full_name}</TableCell>
                    <TableCell className="text-gray-600">{member.email}</TableCell>
                    <TableCell>
                      {member.department ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {member.department}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${
                          member.rank === "A-Chosen"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                            : member.rank === "B-Called"
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : "bg-gray-100 text-gray-800 border-gray-300"
                        }`}
                      >
                        {member.rank || "C-Multitude"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{member.assembly || "Not specified"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* ENHANCED MANAGE DIALOG (Same as your original but with better styling) */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedMember(member)}
                            >
                              <UserCog className="w-4 h-4 mr-1" />
                              Manage
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md bg-white">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <UserCog className="w-5 h-5" />
                                Manage {member.full_name}
                              </DialogTitle>
                              <DialogDescription>Update member rank and add attendance records</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-3 block">Update Rank</label>
                                <div className="grid grid-cols-1 gap-2">
                                  <Button
                                    variant={member.rank === "A-Chosen" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => updateMemberRank(member.id, "A-Chosen")}
                                    disabled={isUpdating}
                                    className="justify-start"
                                  >
                                    A-Chosen
                                  </Button>
                                  <Button
                                    variant={member.rank === "B-Called" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => updateMemberRank(member.id, "B-Called")}
                                    disabled={isUpdating}
                                    className="justify-start"
                                  >
                                    B-Called
                                  </Button>
                                  <Button
                                    variant={member.rank === "C-Multitude" || !member.rank ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => updateMemberRank(member.id, "C-Multitude")}
                                    disabled={isUpdating}
                                    className="justify-start"
                                  >
                                    C-Multitude
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-3 block">Quick Attendance</label>
                                <div className="grid grid-cols-1 gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addAttendance(member.id, "Sunday Service")}
                                    className="justify-start"
                                  >
                                    Sunday Service
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addAttendance(member.id, "Youth Meeting")}
                                    className="justify-start"
                                  >
                                    Youth Meeting
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {/* NEW: Individual PDF Download Button for Table View */}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => generateIndividualPDF(member)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title={`Download PDF for ${member.full_name}`}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        // MOBILE CARD VIEW (New responsive cards)
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
      {/* ============================================================================ */}
      {/* EMPTY STATE (Enhanced version of your original) */}
      {/* ============================================================================ */}
      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users className="w-12 h-12 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters to find members.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}