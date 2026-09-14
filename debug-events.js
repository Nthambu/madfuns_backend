const { Client } = require('pg');
require('dotenv').config();

async function debugEvents() {
  console.log('🔍 Events Query Debug\n');
  
  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
  
  console.log(`Database: ${config.host}:${config.port}/${config.database}\n`);

  const client = new Client(config);

  try {
    await client.connect();
    console.log('✅ Connected!\n');

    // Test the exact query your service uses
    console.log('📊 Testing Events Service Query:');
    console.log('Query: SELECT * FROM events WHERE active = $1 ORDER BY event_date ASC');
    
    const serviceQuery = await client.query(`
      SELECT * FROM events 
      WHERE active = $1 
      ORDER BY event_date ASC
    `, [true]);
    
    console.log(`\n✅ Found ${serviceQuery.rows.length} active events:`);
    
    if (serviceQuery.rows.length > 0) {
      serviceQuery.rows.forEach((event, index) => {
        console.log(`${index + 1}. ${event.name} (active: ${event.active}) - ${event.event_date}`);
      });
    } else {
      console.log('❌ No active events found');
      
      // Check all events regardless of active status
      console.log('\n🔍 Checking ALL events (ignoring active status):');
      const allEvents = await client.query('SELECT id, name, active, event_date FROM events ORDER BY created_at DESC');
      
      if (allEvents.rows.length > 0) {
        console.log(`Found ${allEvents.rows.length} total events:`);
        allEvents.rows.forEach((event, index) => {
          console.log(`${index + 1}. ${event.name} (active: ${event.active})`);
        });
        
        // Check active field data types
        console.log('\n🔍 Active field analysis:');
        const activeAnalysis = await client.query(`
          SELECT 
            active,
            pg_typeof(active) as data_type,
            COUNT(*) as count
          FROM events 
          GROUP BY active, pg_typeof(active)
          ORDER BY active;
        `);
        console.table(activeAnalysis.rows);
        
      } else {
        console.log('❌ No events found at all - table is empty');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

debugEvents().catch(console.error);