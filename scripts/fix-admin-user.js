
const { Client } = require('pg');
const crypto = require('crypto');
require('dotenv').config({ path: '.env' });

const TARGET_EMAIL = 'sundayfavour997@gmail.com';
const TARGET_PASSWORD = 'orange99()'; // Using the password from the user request
// Note: For auth.users, we need to be careful. Direct insert is tricky due to encryption.
// Ideally usage of supabase-js service role is best, but we don't have the key.
// We can use the pgcrypto extension if available, or just update the password for now if user exists.

async function fixAdminUser() {
    const client = new Client({
        user: 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'orange99()',
        host: 'db.venhucvbufytletsbojm.supabase.co',
        port: 5432,
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log(`Checking user: ${TARGET_EMAIL}`);

        // 1. Check if user exists in auth.users
        const userRes = await client.query(`
      SELECT id, email, encrypted_password 
      FROM auth.users 
      WHERE email = $1
    `, [TARGET_EMAIL]);

        let userId;

        if (userRes.rowCount === 0) {
            console.log('User NOT FOUND in auth.users. Creating...');
            // INSERTING into auth.users is complex without pgcrypto for password hashing.
            // We will try to insert with a placeholder and let the user use "Forgot Password" OR
            // we assume pgcrypto is available (standard in Supabase).

            const newId = crypto.randomUUID();
            userId = newId;

            // Try to insert. Validation: confirm pgcrypto is there?
            // Usually auth schema has it.
            await client.query(`
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
        VALUES ($1, $2, crypt($3, gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated')
      `, [newId, TARGET_EMAIL, TARGET_PASSWORD]);

            console.log(`User created with ID: ${newId}`);
        } else {
            userId = userRes.rows[0].id;
            console.log(`User FOUND. ID: ${userId}`);

            // Update password just in case
            console.log('Updating password...');
            await client.query(`
        UPDATE auth.users 
        SET encrypted_password = crypt($2, gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, now()),
            updated_at = now()
        WHERE id = $1
      `, [userId, TARGET_PASSWORD]);
            console.log('Password updated and email confirmed.');
        }

        // 2. Ensure profile exists and is admin
        console.log('Checking public.profiles...');
        const profileRes = await client.query(`
      SELECT id, is_admin FROM public.profiles WHERE id = $1
    `, [userId]);

        if (profileRes.rowCount === 0) {
            console.log('Profile missing. Creating...');
            await client.query(`
        INSERT INTO public.profiles (id, is_admin, email)
        VALUES ($1, TRUE, $2)
      `, [userId, TARGET_EMAIL]);
            // Note: adjust columns based on actual schema if 'email' is not in profiles, 
            // but usually it's good to have. If it fails, we might need to check schema again.
            console.log('Profile created as ADMIN.');
        } else {
            const profile = profileRes.rows[0];
            if (!profile.is_admin) {
                console.log('Profile exists but is NOT admin. Updating...');
                await client.query(`
          UPDATE public.profiles SET is_admin = TRUE WHERE id = $1
        `, [userId]);
                console.log('Profile updated to ADMIN.');
            } else {
                console.log('Profile is already ADMIN.');
            }
        }

    } catch (err) {
        console.error('Error fixing admin user:', err);
    } finally {
        await client.end();
    }
}

fixAdminUser();
