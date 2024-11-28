const RoutePlanner = require('../expertSystem/RoutePlanner');
const LearningSystem = require('../expertSystem/LearningSystem');

const routePlannerController = {
    async planRoute(req, res) {
        try {
            console.log('Received route planning request:', req.body);
            const { originIata, destinationIata, preferences } = req.body;
            
            if (!originIata || !destinationIata) {
                return res.status(400).json({
                    success: false,
                    error: 'Origin and destination airports are required',
                    data: null
                });
            }

            const result = await RoutePlanner.planRoute(originIata, destinationIata, preferences);
            console.log('Route planning result:', result);
            
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error || 'Route planning failed',
                    data: null
                });
            }

            return res.json({
                success: true,
                error: null,
                data: result.data
            });
        } catch (error) {
            console.error('Error in route planning controller:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Internal server error',
                data: null
            });
        }
    },

    async getRouteExplanation(req, res) {
        try {
            const { routeId } = req.params;
            
            // In a real implementation, you would store and retrieve
            // route explanations from a database
            const explanation = await RoutePlanner.getExplanation(routeId);
            
            res.json({
                success: true,
                data: explanation
            });
        } catch (error) {
            console.error('Error getting route explanation:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error retrieving route explanation'
            });
        }
    },

    async getRecentRoutes(req, res) {
        try {
            const connection = await LearningSystem.getConnection();
            const [routes] = await connection.execute(`
                SELECT 
                    r.*, 
                    a1.name as origin_name, a1.iata_code as origin_code,
                    a2.name as destination_name, a2.iata_code as destination_code
                FROM routes r
                JOIN airports a1 ON r.origin_id = a1.id
                JOIN airports a2 ON r.destination_id = a2.id
                ORDER BY r.updated_at DESC
                LIMIT 5
            `);
            connection.release();

            res.json({
                success: true,
                error: null,
                data: routes
            });
        } catch (error) {
            console.error('Error getting recent routes:', error);
            res.status(500).json({
                success: false,
                error: 'Error retrieving recent routes',
                data: null
            });
        }
    },

    async getWeatherAnalysis(req, res) {
        try {
            const connection = await LearningSystem.getConnection();
            const [constraints] = await connection.execute(`
                SELECT * FROM weather_constraints
                WHERE updated_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
                ORDER BY condition_type
            `);
            connection.release();

            res.json({
                success: true,
                error: null,
                data: constraints
            });
        } catch (error) {
            console.error('Error getting weather analysis:', error);
            res.status(500).json({
                success: false,
                error: 'Error retrieving weather analysis',
                data: null
            });
        }
    },

    async getSystemMetrics(req, res) {
        try {
            const connection = await LearningSystem.getConnection();
            const [metrics] = await connection.execute(`
                SELECT 
                    COUNT(DISTINCT origin_id, destination_id) as total_routes,
                    AVG(typical_duration) as avg_duration,
                    MIN(typical_duration) as min_duration,
                    MAX(typical_duration) as max_duration,
                    AVG(distance) as avg_distance
                FROM routes
            `);

            const [rules] = await connection.execute(`
                SELECT rule_type, COUNT(*) as count, AVG(priority) as avg_priority
                FROM rules
                WHERE is_active = TRUE
                GROUP BY rule_type
            `);

            connection.release();

            res.json({
                success: true,
                error: null,
                data: {
                    routeMetrics: metrics[0],
                    ruleMetrics: rules
                }
            });
        } catch (error) {
            console.error('Error getting system metrics:', error);
            res.status(500).json({
                success: false,
                error: 'Error retrieving system metrics',
                data: null
            });
        }
    }
};

module.exports = routePlannerController;
