"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trophy, Plus, Trash2 } from "lucide-react"
import { createAwardAction, deleteAwardAction } from "@/app/actions"
import { toast } from "sonner"

export function AdminAwards({ awards }: { awards: { id: string, name: string }[] }) {
  const [newAward, setNewAward] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAward.trim()) return

    setIsSubmitting(true)
    try {
      const res = await createAwardAction(newAward.trim())
      if (res.success) {
        toast.success("Award created successfully")
        setNewAward("")
      } else {
        toast.error(res.message)
      }
    } catch (err) {
      toast.error("Failed to create award")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await deleteAwardAction(id)
      if (res.success) {
        toast.success("Award deleted successfully")
      } else {
        toast.error(res.message)
      }
    } catch (err) {
      toast.error("Failed to delete award")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card className="bg-white/70 backdrop-blur-3xl border border-white/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-[20px] text-slate-800 font-extrabold tracking-tight">
          <div className="p-2.5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[12px] shadow-sm border border-amber-100/60">
            <Trophy className="w-[20px] h-[20px] text-amber-600" />
          </div>
          Awards Management
        </CardTitle>
        <CardDescription>Create and manage the awards that can be assigned to members.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreate} className="flex gap-3 mb-6">
          <Input 
            value={newAward} 
            onChange={(e) => setNewAward(e.target.value)} 
            placeholder="e.g. Worker of the Year" 
            disabled={isSubmitting}
            className="flex-1"
          />
          <Button type="submit" disabled={isSubmitting || !newAward.trim()} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="w-4 h-4 mr-1" /> Add Award
          </Button>
        </form>

        <div className="space-y-2">
          {awards.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">No awards created yet.</p>
          ) : (
            awards.map(award => (
              <div key={award.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="font-medium text-slate-700">{award.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(award.id)}
                  disabled={deletingId === award.id}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
