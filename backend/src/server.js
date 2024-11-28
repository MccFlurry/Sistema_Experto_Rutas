const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:3000', // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database configuration will be imported here
// const db = require('./config/database');

// Import routes
const routePlannerRoutes = require('./routes/routePlanner');
const airportRoutes = require('./routes/airports');
// const routeRoutes = require('./routes/routes');
// const ruleRoutes = require('./routes/rules');
// const weatherRoutes = require('./routes/weather');

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Air Routes Expert System API' });
});

// Mount routes
app.use('/api/route-planner', routePlannerRoutes);
app.use('/api/airports', airportRoutes);
// app.use('/api/routes', routeRoutes);
// app.use('/api/rules', ruleRoutes);
// app.use('/api/weather', weatherRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error: ' + (err.message || 'Unknown error'),
        data: null
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
});
