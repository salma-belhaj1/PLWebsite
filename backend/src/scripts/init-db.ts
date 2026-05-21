import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initializeDatabase() {
  try {
    console.log('🗄️ Initializing database...');

    // Read schema file - go up from scripts to db directory
    const schemaPath = join(__dirname, '..', 'db', 'schema.sql');
    console.log(`📂 Reading schema from: ${schemaPath}`);
    const schema = readFileSync(schemaPath, 'utf-8');

    // Execute schema
    console.log('📋 Creating tables...');
    await pool.query(schema);

    console.log('✅ Database tables created successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    await pool.end();
    process.exit(1);
  }
}

initializeDatabase();
