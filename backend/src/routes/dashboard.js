const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Rutas del dashboard
router.get('/recent-routes', dashboardController.getRecentRoutes);
router.get('/weather-analysis', dashboardController.getWeatherAnalysis);
router.get('/system-metrics', dashboardController.getSystemMetrics);

module.exports = router;
