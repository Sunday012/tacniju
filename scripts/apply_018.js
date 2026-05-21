const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

async function run() {
    const client = new Client({
        user: 'postgres.venhucvbufytletsbojm',
        host: 'aws-1-eu-west-1.pooler.supabase.com',
        database: 'postgres',
        password: 'orange99()',
        port: 6543,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const sql = fs.readFileSync(path.resolve(__dirname, '018_add_stall_fields.sql'), 'utf8');
        await client.query(sql);
        console.log("Successfully applied 018_add_stall_fields.sql");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}
run();
