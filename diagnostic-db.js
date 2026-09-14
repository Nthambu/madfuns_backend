const { Client } = require('pg');
require('dotenv').config();

async function diagnosticCheck() {
  console.log('🔍 Database Diagnostic Check\n');
  
  // Configuration from .env
  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
  
  console.log('📋 Current Configuration:');
  console.log(`Host: ${config.host}`);
  console.log(`Port: ${config.port}`);
  console.log(`Database: ${config.database}`);
  console.log(`User: ${config.user}`);
  console.log(`SSL: ${config.ssl ? 'Enabled' : 'Disabled'}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}\n`);

  const client = new Client(config);

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Check if events table exists
    console.log('📊 Checking table existence...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'events'
      );
    `);
    console.log(`Events table exists: ${tableCheck.rows[0].exists}\n`);

    if (tableCheck.rows[0].exists) {
      // Check table structure
      console.log('🏗️ Table structure:');
      const structure = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'events'
        ORDER BY ordinal_position;
      `);
      console.table(structure.rows);

      // Count total records
      console.log('\n📈 Data analysis:');
      const totalCount = await client.query('SELECT COUNT(*) FROM events');
      console.log(`Total events: ${totalCount.rows[0].count}`);

      // Count active records
      const activeCount = await client.query('SELECT COUNT(*) FROM events WHERE active = true');
      console.log(`Active events: ${activeCount.rows[0].count}`);

      // Check for any records with active = false
      const inactiveCount = await client.query('SELECT COUNT(*) FROM events WHERE active = false');
      console.log(`Inactive events: ${inactiveCount.rows[0].count}`);

      // Sample records
      console.log('\n📋 Sample records:');
      const samples = await client.query('SELECT id, name, active, created_at FROM events LIMIT 3');
      console.table(samples.rows);

      // Check active field values distribution
      console.log('\n🔍 Active field analysis:');
      const activeDistribution = await client.query(`
        SELECT active, COUNT(*) as count 
        FROM events 
        GROUP BY active 
        ORDER BY active;
      `);
      console.table(activeDistribution.rows);
    }

  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(`Error: ${error.message}`);
    
    if (error.code) {
      console.error(`Code: ${error.code}`);
    }
    
    if (error.code === 'ENOTFOUND') {
      console.error('💡 Suggestion: Check your DB_HOST value');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Suggestion: Check if database is running and DB_PORT is correct');
    } else if (error.message.includes('password authentication failed')) {
      console.error('💡 Suggestion: Check your DB_USER and DB_PASSWORD');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('💡 Suggestion: Check your DB_NAME value');
    }
  } finally {
    await client.end();
  }
}

diagnosticCheck().catch(console.error);