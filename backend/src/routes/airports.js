const express = require('express');
const router = express.Router();
const airportService = require('../services/airportService');

// GET /api/airports
router.get('/', async (req, res) => {
    try {
        console.log('GET /api/airports - Fetching all airports');
        const airports = await airportService.getAllAirports();
        console.log(`Found ${airports.length} airports`);
        res.json({
            success: true,
            data: airports
        });
    } catch (error) {
        console.error('Error in GET /api/airports:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch airports'
        });
    }
});

// GET /api/airports/:iata
router.get('/:iata', async (req, res) => {
    try {
        const { iata } = req.params;
        console.log(`GET /api/airports/${iata} - Fetching airport details`);
        
        const airport = await airportService.getAirportByIata(iata);
        
        if (!airport) {
            console.log(`Airport with IATA code ${iata} not found`);
            return res.status(404).json({
                success: false,
                error: `Airport with IATA code ${iata} not found`
            });
        }

        console.log('Airport found:', airport);
        res.json({
            success: true,
            data: airport
        });
    } catch (error) {
        console.error(`Error in GET /api/airports/${req.params.iata}:`, error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch airport details'
        });
    }
});

module.exports = router;
