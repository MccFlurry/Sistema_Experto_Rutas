const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/database');
require('dotenv').config();
const routePlannerController = require('./controllers/routePlannerController');
const dashboardController = require('./controllers/dashboardController');

const app = express();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const routePlannerRoutes = require('./routes/routePlanner');
const airportRoutes = require('./routes/airports');

// Test database connection before starting server
async function startServer() {
    try {
        // Test database connection
        const connection = await db.getConnection();
        console.log('Database connection successful');
        
        // Check if airports table exists and has data
        const [tables] = await connection.query('SHOW TABLES LIKE "airports"');
        if (tables.length === 0) {
            console.error('Warning: airports table does not exist');
        } else {
            const [count] = await connection.query('SELECT COUNT(*) as count FROM airports');
            console.log('Number of airports in database:', count[0].count);
        }
        
        connection.release();

        // Basic route for testing
        app.get('/', (req, res) => {
            res.json({ message: 'Welcome to Air Routes Expert System API' });
        });

        // Routes
        app.get('/health', (req, res) => {
            res.json({ status: 'ok' });
        });
        app.post('/api/route-planner/plan', (req, res) => {
            console.log('Received route planning request:', req.body);
            routePlannerController.planRoute(req, res);
        });

        // Dashboard routes
        app.get('/api/dashboard/recent-routes', dashboardController.getRecentRoutes);
        app.get('/api/dashboard/weather-analysis', dashboardController.getWeatherAnalysis);
        app.get('/api/dashboard/system-metrics', dashboardController.getSystemMetrics);

        // Mount routes
        app.use('/api/airports', airportRoutes);
        app.use('/api/route-planner', routePlannerRoutes);

        // Error handling middleware
        app.use((err, req, res, next) => {
            console.error('Global error handler:', err);
            res.status(500).json({
                success: false,
                error: 'Internal server error: ' + (err.message || 'Unknown error'),
                data: null
            });
        });

        // Start server
        const PORT = process.env.PORT || 5000;
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use. Please try a different port or kill the process using this port.`);
                process.exit(1);
            } else {
                console.error('Server error:', error);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

// Start the server
startServer();

module.exports = app;
