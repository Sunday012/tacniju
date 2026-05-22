import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.rpc('get_realtime_tables', {});
  console.log("Realtime tables error:", error);
  console.log("Realtime tables data:", data);
}
// Actually, it's easier to just issue the SQL to add it.
