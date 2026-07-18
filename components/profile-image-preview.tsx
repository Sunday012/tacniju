"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function ProfileImagePreview({
  imageUrl,
  name,
  className = "h-10 w-10",
  fallbackClassName = "bg-slate-100 text-slate-600 font-bold text-xs",
}: {
  imageUrl?: string | null
  name: string
  className?: string
  fallbackClassName?: string
}) {
  const initials = (name || "User").substring(0, 2).toUpperCase()
  const avatar = (
    <Avatar className={`${className} border border-slate-100 shrink-0`}>
      <AvatarImage src={imageUrl || ""} className="object-cover" />
      <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
    </Avatar>
  )

  if (!imageUrl) return avatar

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="shrink-0 rounded-full outline-none ring-offset-2 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-indigo-500"
          title={`View ${name}'s profile photo`}
          onClick={(event) => event.stopPropagation()}
        >
          {avatar}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl border-slate-200 bg-white p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>
        <div className="px-5 pb-5">
          <div className="flex max-h-[75vh] items-center justify-center overflow-hidden rounded-xl bg-slate-100">
            <img src={imageUrl} alt={`${name} profile photo`} className="max-h-[75vh] w-full object-contain" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
