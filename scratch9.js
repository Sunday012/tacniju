import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // 1. Create a Jotter asset
  const { data: asset, error: err1 } = await supabase.from('assets').insert({
    name: 'TACN Iju Jotter',
    category: 'Merch',
    is_gift: true,
    total_quantity: 100,
    available_quantity: 99,
    is_stall_item: true,
    is_visible: true,
    point_price: 50
  }).select().single();

  if (err1) { console.log(err1); return; }

  // 2. Assign it to Favour Billing
  const { error: err2 } = await supabase.from('asset_assignments').insert({
    asset_id: asset.id,
    profile_id: '74de8ebe-c899-4e79-97b0-47c854a0201e',
    assigned_by: '74de8ebe-c899-4e79-97b0-47c854a0201e' // Self assigned for demo
  });

  if (err2) { console.log(err2); return; }
  console.log("Done!");
}
run();
