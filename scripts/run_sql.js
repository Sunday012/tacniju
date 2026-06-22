const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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
        const sqlFile = process.argv[2];
        if (!sqlFile) throw new Error("No SQL file provided");
        const sql = fs.readFileSync(path.resolve(process.cwd(), sqlFile), 'utf8');
        await client.query(sql);
        console.log("Successfully executed:", sqlFile);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}
run();
