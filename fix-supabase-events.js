const { Client } = require('pg');
require('dotenv').config();

async function fixSupabaseEvents() {
  console.log('🔧 Fixing Supabase Events - Setting active = true\n');
  
  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };

  const client = new Client(config);

  try {
    await client.connect();
    console.log('✅ Connected to Supabase!\n');

    // Show current events
    console.log('📊 Current events status:');
    const current = await client.query('SELECT id, name, active FROM events ORDER BY created_at DESC');
    console.table(current.rows);

    // Update all events to be active
    console.log('\n🔄 Setting all events to active = true...');
    const updateResult = await client.query('UPDATE events SET active = true WHERE active = false');
    console.log(`✅ Updated ${updateResult.rowCount} events\n`);

    // Show updated events
    console.log('📊 Updated events status:');
    const updated = await client.query('SELECT id, name, active FROM events ORDER BY created_at DESC');
    console.table(updated.rows);

    console.log('\n🎉 Done! Your events should now appear in the API.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixSupabaseEvents().catch(console.error);