"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

function generateTicketCode(): string {
  // Generates MTRC followed by exactly 6 random digits
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `MTRC${digits}`;
}

export async function generateMealTicket() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "You must be logged in to generate a ticket." };
  }

  // Attempt to generate and insert the ticket
  // We'll retry a few times in the highly unlikely event of a ticket code collision
  let maxRetries = 3;
  let success = false;
  let ticketCode = "";

  while (maxRetries > 0 && !success) {
    ticketCode = generateTicketCode();
    
    const { error: insertError } = await supabase
      .from("meal_tickets")
      .insert([
        {
          profile_id: user.id,
          ticket_code: ticketCode,
        }
      ]);

    if (insertError) {
      if (insertError.code === "23505") { // Unique violation
        if (insertError.message.includes("meal_tickets_profile_id_key")) {
          return { error: "You have already generated a meal ticket." };
        }
        if (insertError.message.includes("meal_tickets_ticket_code_key")) {
          // Collision on ticket code, retry
          maxRetries--;
          continue;
        }
      }
      console.error("Error creating meal ticket:", insertError);
      return { error: "Failed to generate meal ticket. Please try again." };
    }
    
    success = true;
  }

  if (!success) {
    return { error: "Failed to generate a unique ticket code. Please try again." };
  }

  revalidatePath("/dashboard");
  return { success: true, ticketCode };
}

export async function getAdminMealTickets() {
  const supabase = await createClient();
  
  // We need to fetch meal tickets along with profile info
  const { data, error } = await supabase
    .from("meal_tickets")
    .select(`
      id,
      ticket_code,
      created_at,
      scanned,
      profile:profiles!profile_id(
        full_name,
        reservation_number,
        phone_number
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching meal tickets:", error);
    return { error: error.message, tickets: [] };
  }

  return { tickets: data };
}

export async function getUserMealTicket() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ticket: null };

  const { data, error } = await supabase
    .from("meal_tickets")
    .select("ticket_code, scanned, created_at")
    .eq("profile_id", user.id)
    .single();

  if (error) {
    return { ticket: null };
  }

  return { ticket: data };
}

export async function deleteMealTicket(ticketId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("meal_tickets")
    .delete()
    .eq("id", ticketId);

  if (error) {
    console.error("Error deleting meal ticket:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/meal-tickets");
  return { success: true };
}
