const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'air_routes_expert',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

console.log('Database configuration:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    // No mostramos la contraseña por seguridad
});

const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection test successful');
        
        // Verificar si la tabla airports existe
        const [tables] = await connection.query('SHOW TABLES LIKE "airports"');
        if (tables.length === 0) {
            console.error('Warning: airports table does not exist');
        } else {
            const [count] = await connection.query('SELECT COUNT(*) as count FROM airports');
            console.log('Number of airports in database:', count[0].count);
        }
        
        connection.release();
        return true;
    } catch (err) {
        console.error('Database connection test failed:', err.message);
        return false;
    }
}

// Ejecutar el test de conexión inmediatamente
testConnection();

module.exports = pool;
