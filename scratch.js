import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase
    .from("asset_assignments")
    .select(`
      id,
      assigned_at,
      asset:assets!asset_id(
        name,
        category
      ),
      profile:profiles!profile_id(
        full_name,
        reservation_number,
        phone_number
      ),
      assigned_by_profile:profiles!assigned_by(
        full_name
      )
    `)
    .order("assigned_at", { ascending: false });

  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}

run();
