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
import { Download, Users, Search, Filter, Eye, UserCog, FileText, Trash2 } from "lucide-react"
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
  const [filterFamily, setFilterFamily] = useState("all")
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<Profile | null>(null)
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards") // NEW: View mode toggle
  const router = useRouter()
  console.log("member", selectedMember)
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = filterDepartment === "all" || member.department === filterDepartment
    const matchesRank = filterRank === "all" || member.rank === filterRank
    const matchesFamily = filterFamily === "all" || member.family === filterFamily
    return matchesSearch && matchesDepartment && matchesRank && matchesFamily
  })

  // Sort members by district, assembly, rank, and family
  const sortedMembers = filteredMembers.sort((a, b) => {
    // First sort by district
    if (a.district !== b.district) {
      return (a.district || '').localeCompare(b.district || '')
    }
    // Then by assembly
    if (a.assembly !== b.assembly) {
      return (a.assembly || '').localeCompare(b.assembly || '')
    }
    // Then by rank (S-Servant first, then A-Chosen, B-Called, C-Multitude)
    const rankOrder = { 'S-Servant': 0, 'A-Chosen': 1, 'B-Called': 2, 'C-Multitude': 3 }
    const aRank = rankOrder[a.rank as keyof typeof rankOrder] ?? 3
    const bRank = rankOrder[b.rank as keyof typeof rankOrder] ?? 3
    if (aRank !== bRank) {
      return aRank - bRank
    }
    // Finally by family
    return (a.family || '').localeCompare(b.family || '')
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

  const deleteMember = async (memberId: string) => {
    setIsDeleting(true)
    const supabase = createClient()
    try {
      // First delete attendance records
      const { error: attendanceError } = await supabase
        .from("attendance")
        .delete()
        .eq("user_id", memberId)
      
      if (attendanceError) throw attendanceError

      // Then delete the profile (this will also delete the auth user due to cascade)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", memberId)
      
      if (profileError) throw profileError

      setMemberToDelete(null)
      router.refresh()
    } catch (error) {
      console.error("Error deleting member:", error)
      alert("Failed to delete member. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }
  // ============================================================================
  // NEW FUNCTION: Individual Member PDF Generation
  // ============================================================================
// Replace the generateIndividualPDF function in your code with this:

const generateIndividualPDF = (member: Profile) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const currentDate = new Date().toLocaleDateString()
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Registration Form - ${member.full_name}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            background: white;
            padding: 20px;
            font-size: 14px;
            line-height: 1.4;
          }
          
          .form-container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #000;
            background: white;
          }
          
          .header {
            text-align: center;
            padding: 15px;
            border-bottom: 2px solid #000;
            background: white;
          }
          
          .church-logo {
            width: 60px;
            height: 80px;
            background: #f0f0f0;
            border: 2px solid #000;
            margin: 0 auto 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
          }
          
          .church-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
          }
          
          .area-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            text-decoration: underline;
          }
          
          .form-title {
            font-size: 14px;
            font-weight: bold;
            border: 2px solid #000;
            padding: 8px;
            margin-top: 10px;
            background: #f8f8f8;
          }
          
          .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            border-bottom: 2px solid #000;
            background: #f8f8f8;
          }
          
          .signature-box {
            border-right: 1px solid #000;
            padding: 8px;
            text-align: center;
            font-size: 11px;
            font-weight: bold;
            min-height: 40px;
          }
          
          .signature-box:last-child {
            border-right: none;
          }
          
          .form-content {
            padding: 0;
          }
          
          .form-row {
            display: flex;
            border-bottom: 1px solid #000;
            min-height: 35px;
          }
          
          .form-row:last-child {
            border-bottom: none;
          }
          
          .form-field {
            border-right: 1px solid #000;
            padding: 8px;
            display: flex;
            align-items: center;
          }
          
          .form-field:last-child {
            border-right: none;
          }
          
          .field-label {
            font-weight: bold;
            margin-right: 10px;
            min-width: 80px;
          }
          
          .field-value {
            flex: 1;
            border-bottom: 1px dotted #666;
            min-height: 20px;
            padding-bottom: 2px;
          }
          
          .ranks-section {
            flex: 1;
            padding: 8px;
            border-right: 1px solid #000;
          }
          
          .departments-section {
            flex: 1;
            padding: 8px;
          }
          
          .rank-item, .dept-item {
            display: flex;
            align-items: center;
            margin-bottom: 3px;
            font-size: 12px;
          }
          
          .checkbox {
            width: 12px;
            height: 12px;
            border: 1px solid #000;
            margin-right: 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
          }
          
          .checkbox.checked {
            background: #000;
            color: white;
          }
          
          .signature-area {
            min-height: 150px;
            padding: 20px;
            border-top: 1px solid #000;
          }
          
          .signature-label {
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          @media print {
            body { padding: 0; }
            .form-container { border: 2px solid #000; }
          }
        </style>
      </head>
      <body>
        <div class="form-container">
          <!-- Header Section -->
          <div class="header">
            <div class="church-logo">✝</div>
            <div class="church-name">The Apostolic Church Nigeria</div>
            <div class="church-name">CT Field, Iju-Station Area</div>
            <div class="area-name">Area Youth Movement</div>
            <div class="form-title">Registration Form</div>
          </div>
          
          <!-- Signature Section -->
          <div class="signature-section">
            <div class="signature-box">
              <div>Signature</div>
            </div>
            <div class="signature-box">
              <div>Youth Leader</div>
              <div style="margin-top: 15px;">_____________</div>
            </div>
            <div class="signature-box">
              <div>Deputy Youth Leader</div>
              <div style="margin-top: 15px;">_____________</div>
            </div>
            <div class="signature-box">
              <div>Youth Secretary</div>
              <div style="margin-top: 15px;">_____________</div>
            </div>
          </div>
          
          <!-- Form Content -->
          <div class="form-content">
            <!-- Name and Reservation Number Row -->
            <div class="form-row">
              <div class="form-field" style="flex: 2;">
                <span class="field-label">Name:</span>
                <span class="field-value">${member.full_name}</span>
              </div>
              <div class="form-field" style="flex: 1;">
                <span class="field-label">Reservation Number:</span>
                <span class="field-value">${member.reservation_number || ''}</span>
              </div>
            </div>
            
            <!-- District and Phone Row -->
            <div class="form-row">
              <div class="form-field" style="flex: 1;">
                <span class="field-label">District:</span>
                <span class="field-value">${member.district || ''}</span>
              </div>
              <div class="form-field" style="flex: 1;">
                <span class="field-label">Phone No:</span>
                <span class="field-value">${member.phone_number || ''}</span>
              </div>
            </div>
            
            <!-- Assembly Row -->
            <div class="form-row">
              <div class="form-field" style="flex: 2;">
                <span class="field-label">Assembly:</span>
                <span class="field-value">${member.assembly || ''}</span>
              </div>
              <div class="form-field" style="flex: 1;">
                <span class="field-label">Date of Birth:</span>
                <span class="field-value">${member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : ''}</span>
              </div>
              <div class="form-field" style="flex: 1;">
                <span class="field-label">Sex:</span>
                <span class="field-value">${member.sex || ''}</span>
              </div>
            </div>
            
            <!-- Address Row -->
            <div class="form-row">
              <div class="form-field" style="flex: 2;">
                <span class="field-label">Address:</span>
                <span class="field-value">${member.address || ''}</span>
              </div>
              <div class="form-field" style="flex: 1;">
                <span class="field-label">Position/Office:</span>
                <span class="field-value">${member.office_position || ''}</span>
              </div>
            </div>
            
            <!-- Ranks and Departments Row -->
            <div class="form-row" style="min-height: 120px; align-items: stretch;">
              <div class="ranks-section">
                <div class="field-label" style="margin-bottom: 10px;">Ranks</div>
                <div class="rank-item">
                  <div class="checkbox ${member.rank === 'A-Chosen' ? 'checked' : ''}">${member.rank === 'A-Chosen' ? '✓' : ''}</div>
                  <span>A-Chosen</span>
                </div>
                <div class="rank-item">
                  <div class="checkbox ${member.rank === 'B-Called' ? 'checked' : ''}">${member.rank === 'B-Called' ? '✓' : ''}</div>
                  <span>B-Called</span>
                </div>
                <div class="rank-item">
                  <div class="checkbox ${member.rank === 'C-Multitude' || !member.rank ? 'checked' : ''}">${member.rank === 'C-Multitude' || !member.rank ? '✓' : ''}</div>
                  <span>C-Multitude</span>
                </div>
              </div>
              <div class="departments-section">
                <div class="field-label" style="margin-bottom: 10px;">Departments</div>
                <div class="dept-item">
                  <div class="checkbox ${member.department === 'Music' ? 'checked' : ''}">${member.department === 'Music' ? '✓' : ''}</div>
                  <span>Music</span>
                </div>
                <div class="dept-item">
                  <div class="checkbox ${member.department === 'Ushering' ? 'checked' : ''}">${member.department === 'Ushering' ? '✓' : ''}</div>
                  <span>Ushering</span>
                </div>
                <div class="dept-item">
                  <div class="checkbox ${member.department === 'Drama' ? 'checked' : ''}">${member.department === 'Drama' ? '✓' : ''}</div>
                  <span>Drama</span>
                </div>
                <div class="dept-item">
                  <div class="checkbox ${member.department === 'Clean Up' ? 'checked' : ''}">${member.department === 'Clean Up' ? '✓' : ''}</div>
                  <span>Clean Up</span>
                </div>
                <div class="dept-item">
                  <div class="checkbox ${member.department === 'Intercessory' ? 'checked' : ''}">${member.department === 'Intercessory' ? '✓' : ''}</div>
                  <span>Intercessory</span>
                </div>
              </div>
            </div>
            
            <!-- Family and Guardian Row -->
            <div class="form-row">
              <div class="form-field" style="flex: 1;">
                <span class="field-label">Family:</span>
                <span class="field-value">${member.family || ''}</span>
              </div>
              <div class="form-field" style="flex: 1;">
                <span class="field-label">Guardian/Spouse No:</span>
                <span class="field-value">${member.guardian_spouse_number || ''}</span>
              </div>
            </div>
            
            <!-- Signature Area -->
            <div class="signature-area">
              <div class="signature-label">Signature</div>
              <div style="border-bottom: 1px solid #000; width: 200px; margin-top: 80px;"></div>
            </div>
          </div>
        </div>
        
        <script>
          // Auto-print when page loads
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          }
        </script>
      </body>
    </html>
  `)
  
  printWindow.document.close()
}

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
                member.rank === "S-Servant"
                  ? "bg-purple-100 text-purple-800 border-purple-300"
                  : member.rank === "A-Chosen"
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
                      <SelectItem value="S-Servant">S-Servant</SelectItem>
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
          
          {/* Delete Button */}
          <Dialog
            open={memberToDelete?.id === member.id}
            onOpenChange={(open) => {
              if (open) setMemberToDelete(member)
              else setMemberToDelete(null)
            }}
          >
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="text-red-600 hover:text-red-700 h-[48px] hover:bg-red-50 flex-1 sm:flex-none cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white rounded-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="w-5 h-5" />
                  Delete Member
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete <strong>{member.full_name}</strong>? This action cannot be undone and will remove all their data including attendance records.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setMemberToDelete(null)}
                  className="flex-1"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMember(member.id)}
                  className="flex-1"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Member"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Members</p>
                <p className="text-2xl font-bold">{sortedMembers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">S-Servant</p>
                <p className="text-2xl font-bold">{sortedMembers.filter(m => m.rank === 'S-Servant').length}</p>
              </div>
              <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center text-purple-800 font-bold">S</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">A-Chosen</p>
                <p className="text-2xl font-bold">{sortedMembers.filter(m => m.rank === 'A-Chosen').length}</p>
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
                <p className="text-2xl font-bold">{sortedMembers.filter(m => m.rank === 'B-Called').length}</p>
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
                <p className="text-2xl font-bold">{sortedMembers.filter(m => !m.rank || m.rank === 'C-Multitude').length}</p>
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
                  <SelectItem value="S-Servant">S-Servant</SelectItem>
                  <SelectItem value="A-Chosen">A-Chosen</SelectItem>
                  <SelectItem value="B-Called">B-Called</SelectItem>
                  <SelectItem value="C-Multitude">C-Multitude</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterFamily} onValueChange={setFilterFamily}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Family" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Families</SelectItem>
                  <SelectItem value="Eden">Eden</SelectItem>
                  <SelectItem value="Taberah">Taberah</SelectItem>
                  <SelectItem value="Bethel">Bethel</SelectItem>
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
            {/* <Button onClick={generatePDF} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button> */}
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
                {sortedMembers.map((member) => (
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
                          member.rank === "S-Servant"
                            ? "bg-purple-100 text-purple-800 border-purple-300"
                            : member.rank === "A-Chosen"
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
                        
                        {/* Delete Button for Table View */}
                        <Dialog
                          open={memberToDelete?.id === member.id}
                          onOpenChange={(open) => {
                            if (open) setMemberToDelete(member)
                            else setMemberToDelete(null)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title={`Delete ${member.full_name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md bg-white rounded-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-red-600">
                                <Trash2 className="w-5 h-5" />
                                Delete Member
                              </DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete <strong>{member.full_name}</strong>? This action cannot be undone and will remove all their data including attendance records.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-3 mt-6">
                              <Button
                                variant="outline"
                                onClick={() => setMemberToDelete(null)}
                                className="flex-1"
                                disabled={isDeleting}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => deleteMember(member.id)}
                                className="flex-1"
                                disabled={isDeleting}
                              >
                                {isDeleting ? "Deleting..." : "Delete Member"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
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
          {sortedMembers.map((member) => (
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