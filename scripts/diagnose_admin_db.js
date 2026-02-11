const { Client } = require('pg');
const path = require('path');
const fs = require('fs');
const dns = require('dns').promises;

// Try to load .env manually
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
} else {
    require('dotenv').config();
}

async function resolveHost(hostname) {
    try {
        const { address } = await dns.lookup(hostname, { family: 4 });
        return address;
    } catch (err) {
        console.error(`Failed to resolve ${hostname} to IPv4:`, err);
        return hostname; // Fallback to original
    }
}

async function diagnose() {
    console.log("Using Host (Original):", process.env.POSTGRES_HOST);
    console.log("Using User:", process.env.POSTGRES_USER);

    const hostIp = await resolveHost(process.env.POSTGRES_HOST);
    console.log("Resolved Host IP (IPv4):", hostIp);

    const client = new Client({
        user: process.env.POSTGRES_USER || 'postgres',
        host: hostIp,
        database: process.env.POSTGRES_DATABASE || 'postgres',
        password: process.env.POSTGRES_PASSWORD,
        port: 5432,
        ssl: { rejectUnauthorized: false }
    });

    console.log("Connecting...");
    try {
        await client.connect();
        console.log("Connected to database.");

        // 1. Check if is_admin column exists
        const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'is_admin';
    `);

        if (columnCheck.rows.length === 0) {
            console.log("❌ 'is_admin' column is MISSING in public.profiles.");
            // Fix: Add column
            console.log("🛠️ Attempting to ADD 'is_admin' column...");
            await client.query(`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;`);
            console.log("✅ Added 'is_admin' column.");
        } else {
            console.log("✅ 'is_admin' column EXISTS in public.profiles.");
        }

        // 2. Find the admin user in auth.users
        const adminEmail = 'sundayfavour997@gmail.com';
        const userResult = await client.query(`
      SELECT id, email, created_at 
      FROM auth.users 
      WHERE email = $1;
    `, [adminEmail]);

        if (userResult.rows.length === 0) {
            console.log(`❌ User '${adminEmail}' NOT FOUND in auth.users.`);
            return;
        }

        const user = userResult.rows[0];
        console.log(`✅ User found: ID=${user.id}, Email=${user.email}`);

        // 3. Check public.profiles for this user
        let profileResult = await client.query(`
      SELECT * FROM public.profiles WHERE id = $1;
    `, [user.id]);

        if (profileResult.rows.length === 0) {
            console.log("❌ Profile NOT FOUND in public.profiles for this user.");

            // Fix: Create Profile
            console.log("🛠️ Attempting to CREATE admin profile...");
            await client.query(`
        INSERT INTO public.profiles (id, email, full_name, is_admin, updated_at)
        VALUES ($1, $2, 'System Admin', TRUE, NOW())
        ON CONFLICT (id) DO UPDATE SET is_admin = TRUE;
      `, [user.id, user.email]);
            console.log("✅ Created/Updated admin profile.");

        } else {
            const profile = profileResult.rows[0];
            console.log("✅ Profile FOUND:", profile);
            console.log(`Current is_admin status: ${profile.is_admin}`);

            // Even if profile exists, ensure is_admin is true
            if (!profile.is_admin) {
                console.log("❌ User is NOT an admin (is_admin is false or null).");
                // Fix: Update Profile
                console.log("🛠️ Fixing admin status...");
                await client.query(`UPDATE public.profiles SET is_admin = TRUE WHERE id = $1;`, [user.id]);
                console.log("✅ Admin status set to TRUE.");
            } else {
                console.log("✅ User is correctly set as ADMIN.");
            }
        }

    } catch (err) {
        console.error("Error during diagnosis:", err);
    } finally {
        await client.end();
    }
}

diagnose();
