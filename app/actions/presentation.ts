"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

export async function setPresentationState(isActive: boolean, type: "text" | "bible" | "lyrics" | "media", content: any) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("presentation_state")
    .upsert({
      id: 1,
      is_active: isActive,
      type,
      content,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

  if (error) {
    console.error("Error setting presentation state:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function clearPresentationState() {
  const supabase = await createClient();

  const { error } = await supabase
    .from("presentation_state")
    .update({
      is_active: false,
    })
    .eq("id", 1);

  if (error) {
    console.error("Error clearing presentation state:", error);
    return { error: error.message };
  }

  return { success: true };
}
