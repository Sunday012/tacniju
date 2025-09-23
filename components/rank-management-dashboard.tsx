"use client"

import { useState } from "react"
// import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Profile {
  id: string
  full_name: string
  email: string
  rank?: string
  department?: string
}

interface RankManagementDashboardProps {
  members: Profile[]
}

export function RankManagementDashboard({ members }: RankManagementDashboardProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [bulkRank, setBulkRank] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const rankStats = {
    "A-Chosen": members.filter((m) => m.rank === "A-Chosen").length,
    "B-Called": members.filter((m) => m.rank === "B-Called").length,
    "C-Multitude": members.filter((m) => m.rank === "C-Multitude" || !m.rank).length,
  }

  const handleMemberSelect = (memberId: string) => {
    setSelectedMembers((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]))
  }

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([])
    } else {
      setSelectedMembers(members.map((m) => m.id))
    }
  }

  const handleBulkRankUpdate = async () => {
    if (selectedMembers.length === 0 || !bulkRank) {
      toast(
        "Please select members and a rank to update",
      )
      return
    }

    setIsUpdating(true)

    try {
      const updates = selectedMembers.map((memberId) => ({
        memberId,
        newRank: bulkRank,
      }))

      const response = await fetch("/api/admin/bulk-rank-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updates }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Update failed")
      }

      const successCount = result.results.filter((r: { success: boolean }) => r.success).length

      toast(
       `Updated ${successCount} member(s) to ${bulkRank}`,
      )

      setSelectedMembers([])
      setBulkRank("")
      router.refresh()
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Failed to update ranks",
      )
    } finally {
      setIsUpdating(false)
    }
  }

  const promoteEligibleMembers = async () => {
    // const supabase = createClient()

    // Logic to promote members based on attendance or other criteria
    // For now, we'll promote C-Multitude members with good attendance to B-Called
    const eligibleMembers = members.filter((m) => (m.rank === "C-Multitude" || !m.rank) && m.department)

    if (eligibleMembers.length === 0) {
      toast(
        "No members are currently eligible for promotion",
      )
      return
    }

    setIsUpdating(true)

    try {
      const updates = eligibleMembers.map((member) => ({
        memberId: member.id,
        newRank: "B-Called",
      }))

      const response = await fetch("/api/admin/bulk-rank-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updates }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Promotion failed")
      }

      const successCount = result.results.filter((r: { success: boolean }) => r.success).length

      toast(
        `Promoted ${successCount} member(s) to B-Called`,
      )

      router.refresh()
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Failed to promote members",
      )
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Rank Statistics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">A-Chosen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{rankStats["A-Chosen"]}</div>
            <p className="text-xs text-muted-foreground">Leadership level</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">B-Called</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{rankStats["B-Called"]}</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">C-Multitude</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{rankStats["C-Multitude"]}</div>
            <p className="text-xs text-muted-foreground">New members</p>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Rank Management</CardTitle>
          <CardDescription>Select multiple members to update their ranks at once</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedMembers.length === members.length ? "Deselect All" : "Select All"}
            </Button>
            <Button variant="outline" size="sm" onClick={promoteEligibleMembers} disabled={isUpdating}>
              Auto-Promote Eligible
            </Button>
          </div>

          {selectedMembers.length > 0 && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">{selectedMembers.length} member(s) selected</span>
              <Select value={bulkRank} onValueChange={setBulkRank}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select rank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A-Chosen">A-Chosen</SelectItem>
                  <SelectItem value="B-Called">B-Called</SelectItem>
                  <SelectItem value="C-Multitude">C-Multitude</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleBulkRankUpdate} disabled={isUpdating || !bulkRank} size="sm">
                {isUpdating ? "Updating..." : "Update Ranks"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members List with Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Members</CardTitle>
          <CardDescription>Click on members to select them for bulk operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 max-h-96 overflow-y-auto">
            {members.map((member) => (
              <div
                key={member.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedMembers.includes(member.id) ? "bg-purple-50 border-purple-200" : "hover:bg-gray-50"
                }`}
                onClick={() => handleMemberSelect(member.id)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded border-2 ${
                      selectedMembers.includes(member.id) ? "bg-purple-600 border-purple-600" : "border-gray-300"
                    }`}
                  >
                    {selectedMembers.includes(member.id) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{member.full_name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {member.department && (
                    <Badge variant="outline" className="text-xs">
                      {member.department}
                    </Badge>
                  )}
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      member.rank === "A-Chosen"
                        ? "bg-yellow-100 text-yellow-800"
                        : member.rank === "B-Called"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {member.rank || "C-Multitude"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
