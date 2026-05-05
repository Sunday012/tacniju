const { Client } = require('pg');
require('dotenv').config();

async function run() {
    // Try both pooler and direct connections
    const configs = [
        {
            name: "Pooler (from URL)",
            connectionString: "postgresql://postgres.venhucvbufytletsbojm:orange99()@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"
        },
        {
            name: "Direct (if accessible)",
            host: "db.venhucvbufytletsbojm.supabase.co",
            user: "postgres",
            password: "orange99()",
            port: 5432,
            database: "postgres"
        }
    ];

    for (const config of configs) {
        console.log(`Trying ${config.name}...`);
        const client = new Client(config.connectionString ? { connectionString: config.connectionString, ssl: { rejectUnauthorized: false } } : { ...config, ssl: { rejectUnauthorized: false } });
        
        try {
            await client.connect();
            console.log(`Connected via ${config.name}!`);
            const sql = `
                ALTER TABLE public.meal_tickets 
                ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0,
                ADD COLUMN IF NOT EXISTS transaction_type TEXT DEFAULT 'MEAL',
                ADD COLUMN IF NOT EXISTS remark TEXT,
                ADD COLUMN IF NOT EXISTS beneficiary_name TEXT;
            `;
            await client.query(sql);
            console.log("Successfully applied migration.");
            await client.end();
            return; // Success
        } catch (err) {
            console.error(`Failed via ${config.name}:`, err.message);
            if (client) await client.end().catch(() => {});
        }
    }
    
    console.error("\nCRITICAL: Could not apply database migration automatically.");
    console.error("Please run the following SQL in your Supabase SQL Editor:");
    console.error(`
ALTER TABLE public.meal_tickets 
ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS transaction_type TEXT DEFAULT 'MEAL',
ADD COLUMN IF NOT EXISTS remark TEXT,
ADD COLUMN IF NOT EXISTS beneficiary_name TEXT;
    `);
}

run();
