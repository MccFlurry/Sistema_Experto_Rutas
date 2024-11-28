const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigrations() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    try {
        console.log('Running migrations...');
        
        // Leer el archivo SQL
        const sqlPath = path.join(__dirname, 'migrations', 'dashboard_tables.sql');
        const sql = await fs.readFile(sqlPath, 'utf8');
        
        // Ejecutar las migraciones
        await connection.query(sql);
        
        console.log('Migrations completed successfully');
    } catch (error) {
        console.error('Error running migrations:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

// Ejecutar migraciones si este archivo se ejecuta directamente
if (require.main === module) {
    runMigrations()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = runMigrations;
