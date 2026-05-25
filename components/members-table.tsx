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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { updateMemberRankAction, giveMemberPointsAction, updateMemberDiaryDetailsAction } from "@/app/actions"
import { Download, Users, Search, Filter, Eye, UserCog, FileText, Trash2, Coins, PlusCircle } from "lucide-react"
import { toast } from "sonner"
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
  points?: number
  is_admin?: boolean
  member_role?: string
  member_status?: string
  status_reason?: string
  awards?: string
  avatar_url?: string
  created_at: string
}
interface MembersTableProps {
  members: Profile[]
  availableAwards?: { id: string, name: string }[]
  gifts?: any[]
}
export function MembersTable({ members, availableAwards = [], gifts = [] }: MembersTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterRank, setFilterRank] = useState("all")
  const [filterFamily, setFilterFamily] = useState("all")
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<Profile | null>(null)
  const [viewMode, setViewMode] = useState<"table" | "cards">("table") // NEW: View mode toggle
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
    try {
      const result = await updateMemberRankAction(memberId, newRank)
      if (!result.success) throw new Error(result.message || "Failed update")
      setSelectedMember(null)
      toast.success("Rank updated successfully")
    } catch (error) {
      console.error("Error updating rank:", error)
      toast.error("Failed to update rank")
    } finally {
      setIsUpdating(false)
    }
  }

  const updateDiaryDetails = async (memberId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true)
    try {
      const formData = new FormData(e.currentTarget);
      const awardsSelected = formData.getAll("awards").join(", ");
      const data = {
        office_position: formData.get("office_position") as string,
        member_role: formData.get("member_role") as string,
        member_status: formData.get("member_status") as string,
        status_reason: formData.get("status_reason") as string,
        awards: awardsSelected,
      }
      const result = await updateMemberDiaryDetailsAction(memberId, data);
      if (!result.success) throw new Error(result.message || "Failed update")
      toast.success("Details updated successfully")
    } catch (error) {
      console.error("Error updating details:", error)
      toast.error("Failed to update details")
    } finally {
      setIsUpdating(false)
    }
  }
  const handleGivePoints = async (memberId: string, amount: number) => {
    if (isNaN(amount) || amount === 0) return
    setIsUpdating(true)
    try {
      const res = await giveMemberPointsAction(memberId, amount)
      if (res.success) {
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      toast.error("Failed to update points")
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteMember = async (memberId: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch("/api/admin/delete-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete member")
      }

      setMemberToDelete(null)
      setSelectedMember(null)
      router.refresh()
    } catch (error) {
      console.error("Error deleting member:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete member. Please try again.")
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
                  <div class="checkbox ${member.rank === 'S-Servant' ? 'checked' : ''}">${member.rank === 'S-Servant' ? '✓' : ''}</div>
                  <span>S-Servant</span>
                </div>
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
                  <div class="checkbox ${member.department === 'Admin Unit' ? 'checked' : ''}">${member.department === 'Admin Unit' ? '✓' : ''}</div>
                  <span>Admin Unit</span>
                </div>
                <div class="dept-item">
                  <div class="checkbox ${member.department === 'Account Unit' ? 'checked' : ''}">${member.department === 'Account Unit' ? '✓' : ''}</div>
                  <span>Account Unit</span>
                </div>
                <div class="dept-item">
                  <div class="checkbox ${member.department === 'Welfare' ? 'checked' : ''}">${member.department === 'Welfare' ? '✓' : ''}</div>
                  <span>Welfare</span>
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
    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 w-full max-w-md mx-auto sm:max-w-full group">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 border border-slate-100 shrink-0">
              <AvatarImage src={member.avatar_url || ""} />
              <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">
                {member.full_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg text-gray-800 break-words leading-tight">{member.full_name}</h3>
              <p className="text-sm text-gray-600 break-all mt-0.5">{member.email}</p>
            </div>
          </div>
          <div className="mt-2 sm:mt-0 flex-shrink-0">
            <Badge
              variant="secondary"
              className={`${member.rank === "S-Servant"
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
                <DialogDescription>Update member rank, points, and diary details</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="rank" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="rank">Rank & Points</TabsTrigger>
                  <TabsTrigger value="diary">Diary Details</TabsTrigger>
                </TabsList>
                <div className="overflow-y-auto max-h-[55vh] pr-2">
                  <TabsContent value="rank" className="space-y-6 mt-0">
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
                      <label className="text-sm font-medium text-gray-700 mb-3 block flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-500" />
                        Manage Points (Current: {member.points || 0})
                      </label>
                      <div className="flex gap-2">
                        <Input 
                          type="number" 
                          placeholder="Amount (+ or -)" 
                          className="flex-1"
                          id={`points-${member.id}`}
                        />
                        <Button 
                          onClick={() => {
                            const input = document.getElementById(`points-${member.id}`) as HTMLInputElement
                            handleGivePoints(member.id, parseInt(input.value))
                            input.value = ""
                          }}
                          disabled={isUpdating}
                          className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          <PlusCircle className="w-4 h-4 mr-1" />
                          Update
                        </Button>
                        <Button
                          onClick={() => handleGivePoints(member.id, -(member.points || 0))}
                          disabled={isUpdating || !member.points}
                          variant="outline"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 px-3"
                          title="Reset points to 0"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="diary" className="mt-0">
                    <form onSubmit={(e) => updateDiaryDetails(member.id, e)} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Office Position</label>
                        <Input 
                          name="office_position" 
                          defaultValue={member.office_position || ""} 
                          placeholder="e.g. Choir Master" 
                          disabled={isUpdating}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Role</label>
                          <Select name="member_role" defaultValue={member.member_role || "Member"} disabled={isUpdating}>
                            <SelectTrigger>
                              <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="Member">Member</SelectItem>
                              <SelectItem value="Worker">Worker</SelectItem>
                              <SelectItem value="Executive">Executive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                          <Select name="member_status" defaultValue={member.member_status || "Active"} disabled={isUpdating}>
                            <SelectTrigger>
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Transferred">Transferred</SelectItem>
                              <SelectItem value="Terminated">Terminated</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Status Reason (if transferred/terminated)</label>
                        <Input 
                          name="status_reason" 
                          defaultValue={member.status_reason || ""} 
                          placeholder="Reason for transfer or termination..." 
                          disabled={isUpdating}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Awards</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-3 border border-slate-200 rounded-md bg-slate-50/50">
                          {availableAwards.length > 0 ? availableAwards.map(award => (
                            <div key={award.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`award-${member.id}-${award.id}`} 
                                name="awards" 
                                value={award.name}
                                defaultChecked={member.awards ? member.awards.split(",").map(a => a.trim()).includes(award.name) : false}
                                disabled={isUpdating}
                              />
                              <label htmlFor={`award-${member.id}-${award.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                {award.name}
                              </label>
                            </div>
                          )) : <p className="text-xs text-gray-500">No awards created yet.</p>}
                        </div>
                      </div>

                      <Button type="submit" disabled={isUpdating} className="w-full">
                        {isUpdating ? "Saving..." : "Save Diary Details"}
                      </Button>
                    </form>
                  </TabsContent>
                </div>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={() => generateIndividualPDF(member)}
            className="text-green-600 hover:text-green-700 h-[48px] hover:bg-green-50 flex-1 sm:flex-none cursor-pointer"
          >
            <FileText className="w-4 h-4" />
          </Button>

          {/* ID Card Button */}
          <Button
            variant="outline"
            onClick={() => window.open(`/id-card/${member.id}`, '_blank')}
            className="text-indigo-600 hover:text-indigo-700 h-[48px] hover:bg-indigo-50 flex-1 sm:flex-none cursor-pointer"
          >
            <span className="sr-only">View ID Card</span>
            <Users className="w-4 h-4" />
            {/* Using Users icon for ID card for now, or maybe Fingerprint/Scan? Users works as "Member ID" */}
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
    <div className="space-y-6 ">
      {/* ============================================================================ */}
      {/* NEW SECTION: Statistics Overview Cards */}
      {/* ============================================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card className="relative overflow-hidden bg-[#3952c4] border border-[#4f69dc] shadow-[0_10px_30px_rgba(37,56,120,0.14)] hover:shadow-[0_14px_36px_rgba(37,56,120,0.18)] transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/20 via-white/10 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/45 pointer-events-none" />
          <CardContent className="relative z-10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/85 text-xs font-bold uppercase tracking-wider mb-1">Total</p>
                <p className="text-3xl font-black text-white">{sortedMembers.length}</p>
              </div>
              <div className="p-2.5 bg-white/14 text-white rounded-[10px] shadow-sm border border-white/20 backdrop-blur-sm">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-[#7645c7] border border-[#8f5fe0] shadow-[0_10px_30px_rgba(86,46,146,0.14)] hover:shadow-[0_14px_36px_rgba(86,46,146,0.18)] transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/20 via-white/10 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/45 pointer-events-none" />
          <CardContent className="relative z-10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/85 text-xs font-bold uppercase tracking-wider mb-1">S-Servant</p>
                <p className="text-3xl font-black text-white">{sortedMembers.filter(m => m.rank === 'S-Servant').length}</p>
              </div>
              <div className="w-10 h-10 bg-white/14 shadow-sm border border-white/20 rounded-[10px] flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm">S</div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-[#b47a1f] border border-[#d0912d] shadow-[0_10px_30px_rgba(128,87,24,0.14)] hover:shadow-[0_14px_36px_rgba(128,87,24,0.18)] transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/20 via-white/10 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/45 pointer-events-none" />
          <CardContent className="relative z-10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/85 text-xs font-bold uppercase tracking-wider mb-1">A-Chosen</p>
                <p className="text-3xl font-black text-white">{sortedMembers.filter(m => m.rank === 'A-Chosen').length}</p>
              </div>
              <div className="w-10 h-10 bg-white/14 shadow-sm border border-white/20 rounded-[10px] flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm">A</div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-[#1f8a79] border border-[#2aa08d] shadow-[0_10px_30px_rgba(22,103,88,0.14)] hover:shadow-[0_14px_36px_rgba(22,103,88,0.18)] transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/20 via-white/10 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/45 pointer-events-none" />
          <CardContent className="relative z-10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/85 text-xs font-bold uppercase tracking-wider mb-1">B-Called</p>
                <p className="text-3xl font-black text-white">{sortedMembers.filter(m => m.rank === 'B-Called').length}</p>
              </div>
              <div className="w-10 h-10 bg-white/14 shadow-sm border border-white/20 rounded-[10px] flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm">B</div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-[#5b6b96] border border-[#7282ad] shadow-[0_10px_30px_rgba(62,72,98,0.14)] hover:shadow-[0_14px_36px_rgba(62,72,98,0.18)] transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/20 via-white/10 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/45 pointer-events-none" />
          <CardContent className="relative z-10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/85 text-xs font-bold uppercase tracking-wider mb-1">C-Mult</p>
                <p className="text-3xl font-black text-white">{sortedMembers.filter(m => !m.rank || m.rank === 'C-Multitude').length}</p>
              </div>
              <div className="w-10 h-10 bg-white/14 shadow-sm border border-white/20 rounded-[10px] flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm">C</div>
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
                  <SelectItem value="Admin Unit">Admin Unit</SelectItem>
                  <SelectItem value="Account Unit">Account Unit</SelectItem>
                  <SelectItem value="Welfare">Welfare</SelectItem>
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
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Rank</TableHead>
                  <TableHead className="font-semibold">Points</TableHead>
                  <TableHead className="font-semibold">Assembly</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMembers.map((member) => (
                  <TableRow key={member.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-slate-100">
                          <AvatarImage src={member.avatar_url || ""} />
                          <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-[10px]">
                            {member.full_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {member.full_name}
                      </div>
                    </TableCell>
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
                        className={`${member.rank === "S-Servant"
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
                    <TableCell>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold">
                        {member.points || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{member.assembly || "Not specified"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2">
                        {/* ENHANCED MANAGE DIALOG (Same as your original but with better styling) */}
                        <Dialog
                          open={selectedMember?.id === member.id}
                          onOpenChange={(isOpen) => {
                            if (isOpen) setSelectedMember(member)
                            else setSelectedMember(null)
                          }}
                        >
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
                              <DialogDescription>Update member rank and manage reward points</DialogDescription>
                            </DialogHeader>
                            <Tabs defaultValue="rank" className="w-full">
                              <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="rank">Rank & Points</TabsTrigger>
                                <TabsTrigger value="diary">Diary</TabsTrigger>
                                <TabsTrigger value="gifts">Gifts</TabsTrigger>
                              </TabsList>
                              <div className="overflow-y-auto max-h-[55vh] pr-2 custom-scrollbar">
                                <TabsContent value="gifts" className="space-y-4 mt-0">
                                  <div className="space-y-3">
                                    {gifts.filter(g => g.profile_id === member.id).length === 0 ? (
                                      <p className="text-sm text-gray-500 text-center py-4">No gifts received yet.</p>
                                    ) : (
                                      gifts.filter(g => g.profile_id === member.id).map(gift => (
                                        <div key={gift.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50">
                                          <div className="flex flex-col">
                                            <span className="font-bold text-gray-800 text-sm">{Array.isArray(gift.asset) ? gift.asset[0]?.name : gift.asset?.name}</span>
                                            <span className="text-xs text-gray-500">{new Date(gift.assigned_at).toLocaleDateString()}</span>
                                          </div>
                                          <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200">
                                            {Array.isArray(gift.asset) ? gift.asset[0]?.category : gift.asset?.category}
                                          </Badge>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </TabsContent>
                                <TabsContent value="rank" className="space-y-6 mt-0">
                                  <div>
                                    <label className="text-sm font-medium text-gray-700 mb-3 block">Update Rank</label>
                                    <div className="grid grid-cols-1 gap-2">
                                      <Button
                                        variant={member.rank === "S-Servant" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => updateMemberRank(member.id, "S-Servant")}
                                        disabled={isUpdating}
                                        className="justify-start"
                                      >
                                        S-Servant
                                      </Button>
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
                                    <label className="text-sm font-medium text-gray-700 mb-3 block flex items-center gap-2">
                                      <Coins className="w-4 h-4 text-amber-500" />
                                      Manage Points (Current: {member.points || 0})
                                    </label>
                                    <div className="flex gap-2">
                                      <Input 
                                        type="number" 
                                        placeholder="Amount (+ or -)" 
                                        className="flex-1"
                                        id={`points-table-${member.id}`}
                                      />
                                      <Button 
                                        onClick={() => {
                                          const input = document.getElementById(`points-table-${member.id}`) as HTMLInputElement
                                          handleGivePoints(member.id, parseInt(input.value))
                                          input.value = ""
                                        }}
                                        disabled={isUpdating}
                                        className="bg-amber-500 hover:bg-amber-600 text-white"
                                      >
                                        <PlusCircle className="w-4 h-4 mr-1" />
                                        Update
                                      </Button>
                                      <Button
                                        onClick={() => handleGivePoints(member.id, -(member.points || 0))}
                                        disabled={isUpdating || !member.points}
                                        variant="outline"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 px-3"
                                        title="Reset points to 0"
                                      >
                                        Reset
                                      </Button>
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="diary" className="mt-0">
                                  <form onSubmit={(e) => updateDiaryDetails(member.id, e)} className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-700 mb-1 block">Office Position</label>
                                      <Input 
                                        name="office_position" 
                                        defaultValue={member.office_position || ""} 
                                        placeholder="e.g. Choir Master" 
                                        disabled={isUpdating}
                                      />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Role</label>
                                        <Select name="member_role" defaultValue={member.member_role || "Member"} disabled={isUpdating}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Role" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-white">
                                            <SelectItem value="Member">Member</SelectItem>
                                            <SelectItem value="Worker">Worker</SelectItem>
                                            <SelectItem value="Executive">Executive</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                                        <Select name="member_status" defaultValue={member.member_status || "Active"} disabled={isUpdating}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-white">
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Transferred">Transferred</SelectItem>
                                            <SelectItem value="Terminated">Terminated</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium text-gray-700 mb-1 block">Status Reason (if transferred/terminated)</label>
                                      <Input 
                                        name="status_reason" 
                                        defaultValue={member.status_reason || ""} 
                                        placeholder="Reason for transfer or termination..." 
                                        disabled={isUpdating}
                                      />
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium text-gray-700 mb-1 block">Awards</label>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-3 border border-slate-200 rounded-md bg-slate-50/50">
                                        {availableAwards.length > 0 ? availableAwards.map(award => (
                                          <div key={award.id} className="flex items-center space-x-2">
                                            <Checkbox 
                                              id={`award-table-${member.id}-${award.id}`} 
                                              name="awards" 
                                              value={award.name}
                                              defaultChecked={member.awards ? member.awards.split(",").map(a => a.trim()).includes(award.name) : false}
                                              disabled={isUpdating}
                                            />
                                            <label htmlFor={`award-table-${member.id}-${award.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                              {award.name}
                                            </label>
                                          </div>
                                        )) : <p className="text-xs text-gray-500">No awards created yet.</p>}
                                      </div>
                                    </div>

                                    <Button type="submit" disabled={isUpdating} className="w-full">
                                      {isUpdating ? "Saving..." : "Save Diary Details"}
                                    </Button>
                                  </form>
                                </TabsContent>
                              </div>
                            </Tabs>
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
