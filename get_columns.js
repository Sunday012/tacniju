require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('attendance').select('*').limit(1);
  console.log("Attendance columns:", Object.keys(data[0] || {}).join(", "));
  
  const { data: d2 } = await supabase.rpc('get_schema').limit(1).catch(() => ({data: []}));
  console.log(d2);
}
check();
