const express = require('express');
const router = express.Router();
const routePlanner = require('../expertSystem/RoutePlanner');
const airportService = require('../services/airportService');

// Route planning endpoints
// POST /api/route-planner/plan
router.post('/plan', async (req, res) => {
    try {
        console.log('POST /api/route-planner/plan - Planning route');
        console.log('Request body:', req.body);

        const { originIata, destinationIata } = req.body;

        if (!originIata || !destinationIata) {
            return res.status(400).json({
                success: false,
                error: 'Origin and destination IATA codes are required'
            });
        }

        // Initialize route planner if needed
        await routePlanner.initialize();
        
        // Plan the route directly with IATA codes
        const route = await routePlanner.planRoute(originIata, destinationIata);
        console.log('Route planned:', route);

        if (!route || route.success === false) {
            return res.status(400).json({
                success: false,
                error: route?.error || 'Failed to plan route'
            });
        }

        res.json({
            success: true,
            data: route
        });
    } catch (error) {
        console.error('Error in POST /api/route-planner/plan:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to plan route'
        });
    }
});

// GET /api/route-planner/explanation/:routeId
router.get('/explanation/:routeId', async (req, res) => {
    try {
        const routeId = req.params.routeId;
        // TO DO: implement route explanation endpoint
        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error in GET /api/route-planner/explanation/:routeId:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get route explanation'
        });
    }
});

module.exports = router;
