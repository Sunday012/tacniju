import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: assignments, error: err1 } = await supabase.from('asset_assignments').select('*');
  const { data: requests, error: err2 } = await supabase.from('asset_requests').select('*');
  console.log("Assignments:", assignments);
  console.log("Requests:", requests);
}
run();
