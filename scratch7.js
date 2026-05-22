import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: profiles, error } = await supabase.from('profiles').select('id, full_name').ilike('full_name', '%Favour Billing%');
  console.log("Profiles:", profiles);
  const { data: assets } = await supabase.from('assets').select('*').ilike('name', '%Jotter%');
  console.log("Assets:", assets);
}
run();
