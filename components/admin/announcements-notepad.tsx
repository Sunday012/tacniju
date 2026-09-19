"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { Megaphone, Pin, PinOff, Send, Trash2, Loader2, Eye, EyeOff, Pencil, X } from "lucide-react";
import {
  Announcement,
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
  updateAnnouncementStatus,
} from "@/app/actions/announcements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export function AnnouncementsNotepad({ initialAnnouncements }: { initialAnnouncements: Announcement[] }) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const refreshFromServer = async () => {
    window.location.reload();
  };

  const resetEditor = () => {
    setTitle("");
    setBody("");
    setIsPinned(false);
    setIsPublished(true);
    setEditingId(null);
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.set("title", title);
    formData.set("body", body);
    if (isPinned) formData.set("isPinned", "on");
    if (!isPublished) formData.set("isPublished", "off");

    startTransition(async () => {
      const result = editingId
        ? await updateAnnouncement(editingId, formData)
        : await createAnnouncement(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success(editingId ? "Announcement updated." : "Announcement added.");
      resetEditor();
      refreshFromServer();
    });
  };

  const startEditing = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setTitle(announcement.title);
    setBody(announcement.body);
    setIsPinned(announcement.is_pinned);
    setIsPublished(announcement.is_published);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatus = (announcement: Announcement, updates: { is_pinned?: boolean; is_published?: boolean }) => {
    setAnnouncements(prev =>
      prev.map(item => item.id === announcement.id ? { ...item, ...updates } : item)
    );

    startTransition(async () => {
      const result = await updateAnnouncementStatus(announcement.id, updates);
      if (result?.error) {
        toast.error(result.error);
        setAnnouncements(initialAnnouncements);
        return;
      }
      toast.success("Announcement updated.");
    });
  };

  const handleDelete = (announcement: Announcement) => {
    if (!confirm(`Delete "${announcement.title}"?`)) return;

    setAnnouncements(prev => prev.filter(item => item.id !== announcement.id));
    startTransition(async () => {
      const result = await deleteAnnouncement(announcement.id);
      if (result?.error) {
        toast.error(result.error);
        setAnnouncements(initialAnnouncements);
        return;
      }
      toast.success("Announcement deleted.");
    });
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(340px,420px)_1fr]">
      <section className="bg-[#fff9db] border border-amber-200 shadow-[0_20px_50px_-24px_rgba(120,80,0,0.4)] rounded-lg overflow-hidden">
        <div className="h-10 bg-amber-100 border-b border-amber-200 flex items-center px-5 gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-300" />
          <span className="h-3 w-3 rounded-full bg-amber-300" />
          <span className="h-3 w-3 rounded-full bg-emerald-300" />
          <p className="ml-2 text-xs font-extrabold uppercase tracking-widest text-amber-800">
            {editingId ? "Edit announcement" : "Notepad"}
          </p>
          {editingId && (
            <button
              type="button"
              onClick={resetEditor}
              className="ml-auto rounded p-1 text-amber-800 hover:bg-amber-200"
              title="Cancel editing"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="p-6 bg-[linear-gradient(to_bottom,transparent_31px,rgba(245,158,11,0.18)_32px)] bg-[length:100%_32px]">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="announcement-title" className="text-amber-950">Title</Label>
              <Input
                id="announcement-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Sunday service update"
                className="bg-white/75 border-amber-200 focus-visible:ring-amber-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="announcement-body" className="text-amber-950">Note</Label>
              <Textarea
                id="announcement-body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write the announcement members should see..."
                rows={9}
                className="bg-white/75 border-amber-200 focus-visible:ring-amber-500 resize-none leading-8"
              />
            </div>

            <div className="flex flex-col gap-3 rounded-md bg-white/55 border border-amber-200 p-4">
              <label className="flex items-center gap-3 text-sm font-semibold text-amber-950">
                <Checkbox checked={isPinned} onCheckedChange={(checked) => setIsPinned(checked === true)} />
                Pin to the top
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold text-amber-950">
                <Checkbox checked={isPublished} onCheckedChange={(checked) => setIsPublished(checked === true)} />
                Publish for members
              </label>
            </div>

            <Button
              onClick={handleSave}
              disabled={isPending}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {editingId ? "Save Changes" : "Post Announcement"}
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white/80 border border-slate-200 rounded-lg p-12 text-center">
            <Megaphone className="h-12 w-12 mx-auto text-slate-300" />
            <h2 className="mt-4 text-lg font-extrabold text-slate-800">No announcements yet</h2>
            <p className="text-sm text-slate-500 mt-1">Create the first note from the notepad.</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <article key={announcement.id} className="bg-white/85 border border-slate-200 rounded-lg p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-extrabold text-slate-900">{announcement.title}</h2>
                    {announcement.is_pinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                        <Pin className="h-3 w-3" />
                        Pinned
                      </span>
                    )}
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      announcement.is_published
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {announcement.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    {format(parseISO(announcement.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{announcement.body}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    title="Edit"
                    onClick={() => startEditing(announcement)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    title={announcement.is_pinned ? "Unpin" : "Pin"}
                    onClick={() => handleStatus(announcement, { is_pinned: !announcement.is_pinned })}
                  >
                    {announcement.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    title={announcement.is_published ? "Unpublish" : "Publish"}
                    onClick={() => handleStatus(announcement, { is_published: !announcement.is_published })}
                  >
                    {announcement.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    title="Delete"
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => handleDelete(announcement)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
