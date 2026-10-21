/**
 * Full-Stack Server for Library Management System
 * Serves static web frontend AND provides direct PostgreSQL connection bridge.
 * Strictly without Python (uses Node.js standard libraries and 'pg' driver).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { Pool, Client } = require('pg');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;
const CONFIG_PATH = path.join(BASE_DIR, 'db_config.json');

// MIME types for static files
const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.sql': 'text/plain; charset=UTF-8'
};

// Global PostgreSQL Pool
let pool = null;
let currentConfig = {
    host: 'localhost',
    port: 5432,
    database: 'library_management',
    user: 'postgres',
    password: ''
};

// Load saved config if exists
try {
    if (fs.existsSync(CONFIG_PATH)) {
        currentConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    }
} catch (e) {
    console.error('Error reading db_config.json:', e.message);
}

// Try auto-connecting to PostgreSQL if password is present
if (currentConfig.password) {
    initPostgresPool(currentConfig).catch(() => {});
}

async function initPostgresPool(config) {
    if (pool) {
        try { await pool.end(); } catch (e) {}
        pool = null;
    }

    // Step 1: Check if database exists, create if missing
    try {
        const adminClient = new Client({
            host: config.host || 'localhost',
            port: config.port || 5432,
            user: config.user || 'postgres',
            password: String(config.password || ''),
            database: 'postgres' // Connect to default postgres DB first
        });

        await adminClient.connect();
        const checkDb = await adminClient.query(
            "SELECT 1 FROM pg_database WHERE datname = $1", 
            [config.database || 'library_management']
        );

        if (checkDb.rowCount === 0) {
            console.log(`Database '${config.database}' not found. Creating it now...`);
            await adminClient.query(`CREATE DATABASE "${config.database}"`);
            console.log(`Database '${config.database}' created successfully!`);
        }
        await adminClient.end();
    } catch (err) {
        // If connecting to 'postgres' fails, we will try direct pool below
        console.warn('Admin check note:', err.message);
    }

    // Step 2: Create pool for target database
    const newPool = new Pool({
        host: config.host || 'localhost',
        port: config.port || 5432,
        database: config.database || 'library_management',
        user: config.user || 'postgres',
        password: String(config.password || '')
    });

    // Test connection
    const client = await newPool.connect();
    const versionRes = await client.query('SELECT version();');
    client.release();

    pool = newPool;
    currentConfig = { ...config };

    // Save working config
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(currentConfig, null, 2), 'utf8');

    // Check if tables exist, if not, execute schema_and_seed.sql automatically
    await checkAndSeedSchema();

    return {
        success: true,
        message: 'Connected to PostgreSQL successfully!',
        version: versionRes.rows[0].version
    };
}

async function checkAndSeedSchema() {
    if (!pool) return;
    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'books';
        `);

        if (res.rowCount === 0) {
            console.log("Tables not found in PostgreSQL. Seeding from schema_and_seed.sql...");
            const sqlPath = path.join(BASE_DIR, 'schema_and_seed.sql');
            if (fs.existsSync(sqlPath)) {
                let sql = fs.readFileSync(sqlPath, 'utf8');
                // Remove \c command if any
                sql = sql.replace(/\\c\s+\w+;?/g, '');
                await pool.query(sql);
                console.log("PostgreSQL seeded with Books, Members, and Borrowings successfully!");
            }
        }
    } catch (err) {
        console.error("Schema seeding note:", err.message);
    }
}

// Request Handler
const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // API: Check PostgreSQL Connection Status
    if (pathname === '/api/db/status' && req.method === 'GET') {
        const isConnected = pool !== null;
        let version = null;
        if (isConnected) {
            try {
                const v = await pool.query('SELECT version()');
                version = v.rows[0].version;
            } catch (e) {
                pool = null;
            }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            connected: pool !== null,
            host: currentConfig.host,
            port: currentConfig.port,
            database: currentConfig.database,
            user: currentConfig.user,
            hasPassword: !!currentConfig.password,
            version
        }));
        return;
    }

    // API: Connect / Configure PostgreSQL
    if (pathname === '/api/db/connect' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const result = await initPostgresPool(data);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: err.message || 'Failed to connect to PostgreSQL.'
                }));
            }
        });
        return;
    }

    // API: Execute Raw SQL on PostgreSQL
    if (pathname === '/api/db/query' && req.method === 'POST') {
        if (!pool) {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'PostgreSQL is not connected. Please connect your database first.'
            }));
            return;
        }

        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const startTime = Date.now();
            try {
                const { sql } = JSON.parse(body);
                if (!sql || !sql.trim()) {
                    throw new Error('Empty SQL statement.');
                }

                const result = await pool.query(sql);
                const executionTimeMs = (Date.now() - startTime).toFixed(2);

                let columns = [];
                let rows = [];

                if (Array.isArray(result)) {
                    // Multi-statement query (e.g. UNION or BEGIN/COMMIT)
                    const last = result[result.length - 1];
                    columns = last.fields ? last.fields.map(f => f.name) : ['Status'];
                    rows = last.rows ? last.rows.map(r => columns.map(c => r[c])) : [];
                } else if (result.fields) {
                    columns = result.fields.map(f => f.name);
                    rows = result.rows.map(r => columns.map(c => r[c]));
                } else {
                    columns = ['Command', 'Rows Affected'];
                    rows = [[result.command, result.rowCount]];
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    columns,
                    rows,
                    rowCount: result.rowCount !== undefined ? result.rowCount : rows.length,
                    executionTimeMs
                }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: err.message,
                    executionTimeMs: (Date.now() - startTime).toFixed(2)
                }));
            }
        });
        return;
    }

    // API: Fetch All Tables Data from PostgreSQL
    if (pathname === '/api/db/data' && req.method === 'GET') {
        if (!pool) {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Not connected' }));
            return;
        }

        try {
            const booksRes = await pool.query('SELECT * FROM Books ORDER BY book_id ASC;');
            const membersRes = await pool.query('SELECT * FROM Members ORDER BY member_id ASC;');
            const borrowingsRes = await pool.query('SELECT * FROM Borrowings ORDER BY borrow_id ASC;');

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                books: booksRes.rows,
                members: membersRes.rows,
                borrowings: borrowingsRes.rows
            }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
        return;
    }

    // API: Run Full Seed Script on PostgreSQL
    if (pathname === '/api/db/seed' && req.method === 'POST') {
        if (!pool) {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'PostgreSQL not connected' }));
            return;
        }

        try {
            const sqlPath = path.join(BASE_DIR, 'schema_and_seed.sql');
            let sql = fs.readFileSync(sqlPath, 'utf8');
            sql = sql.replace(/\\c\s+\w+;?/g, '');
            await pool.query(sql);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'PostgreSQL database initialized and seeded!' }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        }
        return;
    }

    // Static File Serving
    if (pathname === '/') {
        pathname = '/index.html';
    }

    const filePath = path.join(BASE_DIR, pathname);

    if (!filePath.startsWith(BASE_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        });

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  Library Management System (DBMS Project)`);
    console.log(`  Frontend & PostgreSQL Server running at: http://localhost:${PORT}`);
    console.log(`  PostgreSQL 18 Bridge Ready on port 5432 (Zero Python)`);
    console.log(`=======================================================`);
});
