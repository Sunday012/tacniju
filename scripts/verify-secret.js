
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env' });

const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secret = process.env.SUPABASE_JWT_SECRET;

if (!anonKey || !secret) {
    console.log('Missing ANON_KEY or SECRET');
    process.exit(1);
}

try {
    jwt.verify(anonKey, secret);
    console.log('SUCCESS: Secret matches Anon Key.');
} catch (err) {
    console.error('FAILURE: Secret does NOT match Anon Key.', err.message);
}
