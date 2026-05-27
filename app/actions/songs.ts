"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

export async function getSongs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching songs:", error);
    return { error: error.message };
  }

  return { songs: data };
}

export async function createSong(formData: FormData) {
  const supabase = await createClient();
  
  const title = formData.get("title") as string;
  const type = formData.get("type") as string;
  const rawLyrics = formData.get("lyrics") as string;

  if (!title || !type || !rawLyrics) {
    return { error: "Missing required fields" };
  }

  // Parse raw text lyrics into JSON format
  // Assume stanzas are separated by double newlines
  const stanzas = rawLyrics.split(/\n\s*\n/).filter(s => s.trim().length > 0);
  const lyricsJson = stanzas.map((text, index) => ({
    type: "verse",
    label: `Verse ${index + 1}`,
    content: text.trim()
  }));

  const { error } = await supabase.from("songs").insert({
    title,
    type,
    lyrics: lyricsJson
  });

  if (error) {
    console.error("Error creating song:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/presenter");
  return { success: true };
}

export async function deleteSong(id: number | string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) return { error: "Only admins can delete songs" };

  const { error } = await supabase.from("songs").delete().eq("id", id);

  if (error) {
    console.error("Error deleting song:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/presenter");
  return { success: true };
}
