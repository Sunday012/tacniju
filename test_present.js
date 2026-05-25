require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function test() {
  const { data, error } = await supabase.from('presentation_state').select('*').eq('id', 1)
  console.log("State:", JSON.stringify(data, null, 2))
  if (error) console.error(error)
}

test()
