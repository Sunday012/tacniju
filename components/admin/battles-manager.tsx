"use client"
import { useState } from "react"
import { Swords, Plus, Trash2, Trophy, Shuffle, Loader2, MonitorPlay } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createBattleAction, deleteBattleAction, updateBattleAction } from "@/app/actions/battles"
import { setPresentationState } from "@/app/actions/presentation"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type CompetitionOption = { id: string; name: string }
type CompetitionEntryOption = {
  competitionId: string
  profile: {
    id: string
    full_name: string
    reservation_number?: string | null
    avatar_url?: string | null
  }
}

export function BattlesManager({
  battles,
  competitions,
  entries,
}: {
  battles: any[]
  competitions: CompetitionOption[]
  entries: CompetitionEntryOption[]
}) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("General")
  const [competitionId, setCompetitionId] = useState("")
  const [player1Id, setPlayer1Id] = useState("")
  const [player2Id, setPlayer2Id] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const profiles = entries
    .filter(entry => entry.competitionId === competitionId)
    .map(entry => entry.profile)

  const handleRandomize = () => {
    if (!competitionId) return toast.error("Select a competition first")
    if (profiles.length < 2) return toast.error("Not enough members")
    const shuffled = [...profiles].sort(() => 0.5 - Math.random())
    setPlayer1Id(shuffled[0].id)
    setPlayer2Id(shuffled[1].id)
    setTitle(`Random Match: ${shuffled[0].full_name.split(' ')[0]} vs ${shuffled[1].full_name.split(' ')[0]}`)
  }

  const handleCreate = async () => {
    if (!competitionId || !title || !player1Id || !player2Id) return toast.error("Please fill all fields")
    if (player1Id === player2Id) return toast.error("Select two different players")
    
    setIsCreating(true)
    const res = await createBattleAction(title, player1Id, player2Id, category, competitionId)
    setIsCreating(false)
    if (res.success) {
      toast.success("Battle match created!")
      setTitle("")
      setPlayer1Id("")
      setPlayer2Id("")
    } else {
      toast.error(res.error || "Failed to create battle")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this battle?")) return
    setProcessingId(id)
    const res = await deleteBattleAction(id)
    setProcessingId(null)
    if (res.success) {
      toast.success("Battle deleted")
    } else {
      toast.error(res.error || "Failed to delete")
    }
  }

  const handleUpdateStatus = async (id: string, updates: any) => {
    setProcessingId(id)
    const res = await updateBattleAction(id, updates)
    setProcessingId(null)
    if (res.success) {
      toast.success("Battle updated")
    } else {
      toast.error(res.error || "Failed to update")
    }
  }

  const handlePresentBattle = async (battle: any) => {
    // Open window synchronously from the click — must happen before any await,
    // otherwise the browser's popup blocker swallows it.
    const presentWindow = window.open("/present", "presentation_screen")
    presentWindow?.focus()

    toast.loading("Sending to screen...", { id: "present" })
    const res = await setPresentationState(true, "media", {
      isBattle: true,
      title: battle.title,
      category: battle.category || "General",
      player1: battle.player1?.full_name,
      player2: battle.player2?.full_name,
      p1Avatar: battle.player1?.avatar_url,
      p2Avatar: battle.player2?.avatar_url,
    })
    if (res.success) {
      toast.success("Battle on screen!", { id: "present" })
    } else {
      toast.error(res.error || "Failed to present", { id: "present" })
    }
  }

  return (
    <div className="space-y-8">
      {/* Create Battle */}
      <Card className="border-indigo-100 shadow-sm">
        <CardHeader className="bg-indigo-50/50 pb-4 border-b border-indigo-50">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Swords className="w-5 h-5 text-indigo-600" />
            Create Match-Up
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Competition</label>
                <Select value={competitionId} onValueChange={(value) => {
                  setCompetitionId(value)
                  setPlayer1Id("")
                  setPlayer2Id("")
                }}>
                  <SelectTrigger><SelectValue placeholder="Select Competition" /></SelectTrigger>
                  <SelectContent>
                    {competitions.map(competition => <SelectItem key={competition.id} value={competition.id}>{competition.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Battle Title</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Memory Verse Challenge" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General Knowledge</SelectItem>
                    <SelectItem value="Bible">Bible Quiz</SelectItem>
                    <SelectItem value="Music">Music / Hymn</SelectItem>
                    <SelectItem value="Sports">Sports / Physical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 border border-slate-200 shadow-sm z-10 hidden md:block">
                <span className="text-[10px] font-black text-slate-400">VS</span>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Player 1</label>
                <Select value={player1Id} onValueChange={setPlayer1Id}>
                  <SelectTrigger><SelectValue placeholder={competitionId ? "Select Entrant" : "Select competition first"} /></SelectTrigger>
                  <SelectContent>
                    {profiles.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Player 2</label>
                <Select value={player2Id} onValueChange={setPlayer2Id}>
                  <SelectTrigger><SelectValue placeholder={competitionId ? "Select Entrant" : "Select competition first"} /></SelectTrigger>
                  <SelectContent>
                    {profiles.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button onClick={handleRandomize} variant="outline" className="flex-1 text-slate-600">
                  <Shuffle className="w-4 h-4 mr-2" />
                  Random Pair
                </Button>
                <Button onClick={handleCreate} disabled={isCreating || !competitionId} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                  <Swords className="w-4 h-4 mr-2" />
                  Start Battle
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Battles List */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-slate-600" />
            Active & Past Battles
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {battles.length === 0 ? (
              <p className="text-slate-500 text-sm italic col-span-full text-center py-8">No battles created yet.</p>
            ) : battles.map(b => (
              <div key={b.id} className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col relative overflow-hidden">
                {b.status === 'live' && (
                  <div className="absolute top-0 right-0 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-bl-lg border-l border-b border-emerald-100/50 uppercase tracking-wider animate-pulse">
                    Live
                  </div>
                )}
                {b.status !== 'live' && b.winner_id && (
                  <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg border-l border-b border-slate-200/50 uppercase tracking-wider">
                    Completed
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg">{b.title}</h3>
                    <Badge variant="outline" className="mt-1 text-[10px] bg-slate-50">{b.category}</Badge>
                  </div>
                  <button 
                    onClick={() => handleDelete(b.id)}
                    disabled={processingId === b.id}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    {processingId === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 relative mb-4">
                  <div className="flex-1 text-center">
                    <div className="font-bold text-slate-800">{b.player1?.full_name}</div>
                    {b.winner_id === b.participant1_id && <Badge className="mt-2 bg-amber-500 text-white">Winner 🏆</Badge>}
                  </div>
                  <div className="shrink-0 flex items-center justify-center bg-white border border-slate-200 shadow-sm rounded-full w-8 h-8">
                    <span className="text-[10px] font-black text-slate-400">VS</span>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="font-bold text-slate-800">{b.player2?.full_name}</div>
                    {b.winner_id === b.participant2_id && <Badge className="mt-2 bg-amber-500 text-white">Winner 🏆</Badge>}
                  </div>
                </div>

                <div className="mt-auto flex gap-2">
                  {b.status === 'live' ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(b.id, { winner_id: b.participant1_id, status: 'completed' })} className="flex-1 text-xs border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                        P1 Wins
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(b.id, { winner_id: b.participant2_id, status: 'completed' })} className="flex-1 text-xs border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                        P2 Wins
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handlePresentBattle(b)} className="flex-1 text-xs bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100">
                        <MonitorPlay className="w-3 h-3 mr-1" />
                        Present
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(b.id, { status: 'completed' })} className="flex-1 text-xs text-slate-500">
                        End Draw
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(b.id, { winner_id: null, status: 'live' })} className="w-full text-xs text-amber-600 hover:bg-amber-50">
                      Reopen Match
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
