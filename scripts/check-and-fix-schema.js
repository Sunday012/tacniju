
const { Client } = require('pg');
require('dotenv').config({ path: '.env' }); // Load from .env

async function checkAndFixSchema() {
    // Attempt direct connection to the project matching NEXT_PUBLIC_SUPABASE_URL
    // Project: venhucvbufytletsbojm

    const client = new Client({
        user: 'postgres', // Direct connection uses just 'postgres'
        password: process.env.POSTGRES_PASSWORD || 'orange99()',
        host: 'db.venhucvbufytletsbojm.supabase.co',
        port: 5432,
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        // 1. Check if public.profiles table exists (sanity check)
        const tableRes = await client.query(`
      SELECT EXISTS(
    SELECT FROM information_schema.tables 
        WHERE  table_schema = 'public'
        AND    table_name = 'profiles'
);
`);

        if (!tableRes.rows[0].exists) {
            console.error('CRITICAL: public.profiles table does not exist!');
            return;
        }

        // 2. Check columns in public.profiles
        const columnsRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles';
`);

        console.log('Current columns in public.profiles:', columnsRes.rows.map(r => r.column_name).join(', '));

        const isAdminExists = columnsRes.rows.some(r => r.column_name === 'is_admin');

        if (!isAdminExists) {
            console.log('is_admin column is MISSING. Adding it now...');
            await client.query(`
        ALTER TABLE public.profiles 
        ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
`);
            console.log('SUCCESS: is_admin column added.');
        } else {
            console.log('is_admin column ALREADY EXISTS.');
        }

    } catch (err) {
        console.error('Error checking/fixing schema:', err);
    } finally {
        await client.end();
    }
}

checkAndFixSchema();
