import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: asset, error } = await supabase.from('assets').select('*').eq('id', '0e5504c4-9d51-4ade-85e3-822c609139f4');
  console.log("Asset:", asset);
}
run();
