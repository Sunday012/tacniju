const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  // Try to authenticate as an admin if we have credentials, or just check the admin key
  // We can use the service role key to see if it bypasses RLS
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.log("No service role key found.");
    return;
  }
  const adminSupabase = createClient(supabaseUrl, serviceKey);
  
  const { data, error } = await adminSupabase.from('profiles').update({ rank: 'S-Servant' }).eq('email', 'samuelisaiah@user.tacniju.org').select();
  console.log("Update via service role:", data, error);
}
test();
