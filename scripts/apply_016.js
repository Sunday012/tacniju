const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

async function run() {
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
        const sql = fs.readFileSync(path.resolve(__dirname, '016_add_diary_fields.sql'), 'utf8');
        await client.query(sql);
        console.log("Successfully applied migration 016.");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}
run();
