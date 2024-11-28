const pool = require('./database');

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection successful!');
        
        // Test query
        const [rows] = await connection.query('SELECT 1');
        console.log('Query test successful!');
        
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Error connecting to database:', error);
        process.exit(1);
    }
}

testConnection();
