const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

async function run() {
    const client = new Client({
        user: 'postgres.venhucvbufytletsbojm',
        password: 'orange99()',
        host: 'aws-1-eu-west-1.pooler.supabase.com',
        port: 6543,
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const sql = fs.readFileSync(path.resolve(__dirname, '024_families_and_battles.sql'), 'utf8');
        await client.query(sql);
        console.log("Successfully created tables.");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}
run();
