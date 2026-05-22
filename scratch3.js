import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { error } = await supabase
    .from("presentation_state")
    .update({
      is_active: true,
      type: "text",
      content: { text: "Hello from script" },
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);
  console.log("Error:", error);
}
run();
