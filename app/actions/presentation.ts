"use server";

import { createClient as createServerClient } from "@/lib/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function setPresentationState(isActive: boolean, type: "text" | "bible" | "lyrics" | "media", content: any) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return { success: false, error: "Server config error" };
  
  const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey);

  const { error } = await adminSupabase
    .from("presentation_state")
    .update({
      is_active: isActive,
      type,
      content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

  if (error) {
    console.error("Error setting presentation state:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function clearPresentationState() {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return { success: false, error: "Server config error" };
  
  const adminSupabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey);

  const { error } = await adminSupabase
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
