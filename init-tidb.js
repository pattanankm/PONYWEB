const mysql = require('mysql2/promise');
const fs = require('fs');

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: 'EBoVMb53JmihxCk.root',
    password: 'COJ9iE73iaZXPyeG',
    database: 'pony_shop',
    ssl: {
      rejectUnauthorized: false
    }
  });

  console.log('✅ Connected to TiDB');

  try {
    const sql = fs.readFileSync('./database/setup.sql', 'utf8');
    const statements = sql.split(';').filter(s => s.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('✅', statement.substring(0, 50) + '...');
        } catch (err) {
          console.log('⚠️ ', err.message.substring(0, 100));
        }
      }
    }

    console.log('\n✅ Database initialized successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

initializeDatabase();
