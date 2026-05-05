const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

async function run() {
    // Try using the EXACT URL from .env
    const connectionString = "postgresql://postgres.venhucvbufytletsbojm:orange99()@aws-1-eu-west-1.pooler.supabase.com:6543/postgres";
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const sql = fs.readFileSync(path.resolve(__dirname, '015_add_details_to_meal_tickets.sql'), 'utf8');
        await client.query(sql);
        console.log("Successfully applied migration 015.");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}
run();
