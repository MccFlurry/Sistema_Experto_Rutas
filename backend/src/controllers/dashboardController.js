const LearningSystem = require('../expertSystem/LearningSystem');
const pool = require('../config/database');

const dashboardController = {
    async getRecentRoutes(req, res) {
        try {
            const [routes] = await pool.query(`
                SELECT 
                    r.id,
                    o.iata_code as origin_code,
                    d.iata_code as destination_code,
                    r.distance,
                    r.typical_duration,
                    r.created_at,
                    (
                        SELECT COUNT(*)
                        FROM learning_metrics lm
                        WHERE lm.metric_type = 'ROUTE_OPTIMIZATION'
                        AND lm.timestamp >= r.created_at
                        AND lm.timestamp <= NOW()
                    ) as learning_iterations
                FROM routes r
                JOIN airports o ON r.origin_id = o.id
                JOIN airports d ON r.destination_id = d.id
                WHERE r.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                ORDER BY r.created_at DESC
                LIMIT 10
            `);

            res.json({
                success: true,
                data: routes
            });
        } catch (error) {
            console.error('Error al obtener rutas recientes:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener rutas recientes'
            });
        }
    },

    async getWeatherAnalysis(req, res) {
        try {
            // Obtener restricciones climáticas actuales
            const [conditions] = await pool.query(`
                SELECT 
                    wc.condition_type,
                    wc.min_value,
                    wc.max_value,
                    wc.unit,
                    wc.updated_at,
                    COUNT(lm.id) as learning_count,
                    AVG(lm.value) as avg_learned_value
                FROM weather_constraints wc
                LEFT JOIN learning_metrics lm ON lm.metric_type = CONCAT('WEATHER_', wc.condition_type)
                    AND lm.timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                GROUP BY wc.condition_type, wc.min_value, wc.max_value, wc.unit, wc.updated_at
                ORDER BY wc.condition_type
            `);

            // Obtener historial de aprendizaje climático
            const [weatherHistory] = await pool.query(`
                SELECT 
                    metric_type,
                    DATE(timestamp) as date,
                    COUNT(*) as updates_count,
                    AVG(value) as avg_value,
                    MIN(value) as min_value,
                    MAX(value) as max_value
                FROM learning_metrics
                WHERE metric_type LIKE 'WEATHER_%'
                    AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY metric_type, DATE(timestamp)
                ORDER BY date DESC, metric_type
                LIMIT 300
            `);

            res.json({
                success: true,
                data: {
                    currentConditions: conditions,
                    learningHistory: weatherHistory
                }
            });
        } catch (error) {
            console.error('Error al obtener análisis climático:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener análisis climático'
            });
        }
    },

    async getSystemMetrics(req, res) {
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            // Obtener métricas de rutas
            const [routeMetrics] = await connection.query(`
                SELECT 
                    COUNT(*) as total_routes,
                    AVG(distance) as avg_distance,
                    AVG(typical_duration) as avg_duration,
                    MIN(created_at) as first_route_date,
                    MAX(created_at) as last_route_date
                FROM routes
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            `);

            // Obtener métricas de reglas
            const [ruleMetrics] = await connection.query(`
                SELECT 
                    rule_type,
                    priority,
                    is_active,
                    updated_at,
                    JSON_EXTRACT(condition_json, '$.weather_conditions') as weather_conditions,
                    JSON_EXTRACT(action_json, '$.type') as action_type
                FROM rules
                WHERE is_active = true
                AND updated_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                ORDER BY priority DESC
            `);

            // Obtener estadísticas de aprendizaje
            const [learningStats] = await connection.query(`
                SELECT 
                    metric_type,
                    COUNT(*) as total_updates,
                    MIN(timestamp) as first_learning,
                    MAX(timestamp) as last_learning,
                    AVG(value) as avg_value
                FROM learning_metrics
                WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                GROUP BY metric_type
                HAVING total_updates > 0
            `);

            // Obtener progreso del aprendizaje por día
            const [learningProgress] = await connection.query(`
                SELECT 
                    DATE(timestamp) as date,
                    metric_type,
                    COUNT(*) as updates_count,
                    AVG(value) as avg_value
                FROM learning_metrics
                WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY DATE(timestamp), metric_type
                ORDER BY date DESC, metric_type
                LIMIT 100
            `);

            await connection.commit();

            res.json({
                success: true,
                data: {
                    routeMetrics: routeMetrics[0],
                    ruleMetrics,
                    learningStats,
                    learningProgress
                }
            });
        } catch (error) {
            console.error('Error al obtener métricas del sistema:', error);
            if (connection) {
                try {
                    await connection.rollback();
                } catch (rollbackError) {
                    console.error('Error al revertir transacción:', rollbackError);
                }
            }
            res.status(500).json({
                success: false,
                error: 'Error al obtener métricas del sistema: ' + error.message
            });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
};

module.exports = dashboardController;
