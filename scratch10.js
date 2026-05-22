import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: approvedOrders, error } = await supabase.from('stall_orders').select('*').eq('status', 'approved');
  if (error) { console.error(error); return; }

  for (const order of approvedOrders) {
    // Check if an assignment already exists
    const { data: existing } = await supabase.from('asset_assignments').select('id').eq('asset_id', order.asset_id).eq('profile_id', order.profile_id);
    if (!existing || existing.length === 0) {
      console.log(`Inserting assignment for order ${order.id}`);
      await supabase.from('asset_assignments').insert({
        asset_id: order.asset_id,
        profile_id: order.profile_id,
        assigned_by: order.profile_id, // assume self-approved or admin
        assigned_at: order.created_at
      });
    }
  }
  console.log("Migration done");
}
run();
