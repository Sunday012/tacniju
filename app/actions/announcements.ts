"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, error: "You must be signed in." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return { supabase, user, error: "Admins only." };
  }

  return { supabase, user, error: null };
}

export async function getAnnouncements() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body, is_pinned, is_published, created_at, updated_at")
    .eq("is_published", true)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching announcements:", error);
    return { error: error.message, announcements: [] as Announcement[] };
  }

  return { announcements: (data || []) as Announcement[] };
}

export async function getAdminAnnouncements() {
  const { supabase, error } = await requireAdmin();
  if (error) return { error, announcements: [] as Announcement[] };

  const { data, error: fetchError } = await supabase
    .from("announcements")
    .select("id, title, body, is_pinned, is_published, created_at, updated_at")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error("Error fetching admin announcements:", fetchError);
    return { error: fetchError.message, announcements: [] as Announcement[] };
  }

  return { announcements: (data || []) as Announcement[] };
}

export async function createAnnouncement(formData: FormData) {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error };

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const isPinned = formData.get("isPinned") === "on";
  const isPublished = formData.get("isPublished") !== "off";

  if (!title) return { error: "Title is required." };
  if (!body) return { error: "Announcement body is required." };

  const { error: insertError } = await supabase.from("announcements").insert([
    {
      title,
      body,
      is_pinned: isPinned,
      is_published: isPublished,
      created_by: user.id,
    },
  ]);

  if (insertError) {
    console.error("Error creating announcement:", insertError);
    return { error: insertError.message };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard/announcements");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateAnnouncementStatus(
  id: string,
  updates: { is_pinned?: boolean; is_published?: boolean }
) {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };

  const payload: Record<string, boolean> = {};
  if (typeof updates.is_pinned === "boolean") payload.is_pinned = updates.is_pinned;
  if (typeof updates.is_published === "boolean") payload.is_published = updates.is_published;

  if (!Object.keys(payload).length) return { error: "No update supplied." };

  const { error: updateError } = await supabase
    .from("announcements")
    .update(payload)
    .eq("id", id);

  if (updateError) {
    console.error("Error updating announcement:", updateError);
    return { error: updateError.message };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard/announcements");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteAnnouncement(id: string) {
  const { supabase, error } = await requireAdmin();
  if (error) return { error };

  const { error: deleteError } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Error deleting announcement:", deleteError);
    return { error: deleteError.message };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard/announcements");
  revalidatePath("/dashboard");
  return { success: true };
}
