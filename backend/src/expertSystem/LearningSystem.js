const mysql = require('mysql2/promise');
require('dotenv').config();
const pool = require('../config/database');

class LearningSystem {
    constructor() {
        this.pool = pool;
    }

    async learnFromRoute(route, success, feedback) {
        try {
            console.log('Learning from route:', route);
            const connection = await this.pool.getConnection();
            
            try {
                // 1. Actualizar estadísticas de la ruta
                await this.updateRouteStatistics(connection, route);
                
                // 2. Aprender de las condiciones climáticas
                if (route.weatherRisks && route.weatherRisks.length > 0) {
                    await this.learnFromWeatherConditions(connection, route.weatherRisks, success);
                }

                // 3. Actualizar reglas basadas en el feedback
                if (feedback) {
                    await this.updateRules(connection, route, feedback);
                }

                return true;
            } catch (error) {
                console.error('Error in learning process:', error);
                throw error;
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error in learning system:', error);
            return false;
        }
    }

    async updateRouteStatistics(connection, route) {
        try {
            const query = `
                INSERT INTO routes (origin_id, destination_id, distance, typical_duration)
                SELECT 
                    o.id,
                    d.id,
                    ?,
                    ?
                FROM airports o, airports d
                WHERE o.iata_code = ? AND d.iata_code = ?
                ON DUPLICATE KEY UPDATE
                    typical_duration = (typical_duration + VALUES(typical_duration)) / 2
            `;

            await connection.execute(query, [
                route.distance,
                route.duration,
                route.origin.iata_code,
                route.destination.iata_code
            ]);

            // Registrar métrica de aprendizaje
            await this.recordLearningMetric(connection, 'ROUTE_OPTIMIZATION', route.duration);
        } catch (error) {
            console.error('Error updating route statistics:', error);
            throw error;
        }
    }

    async learnFromWeatherConditions(connection, weatherRisks, success) {
        try {
            for (const risk of weatherRisks) {
                if (!risk.type || !risk.value) {
                    console.log('Skipping invalid weather risk:', risk);
                    continue;
                }

                // Registrar la métrica del clima
                await this.recordLearningMetric(
                    connection,
                    `WEATHER_${risk.type}`,
                    risk.value
                );

                const query = `
                    UPDATE weather_constraints
                    SET 
                        min_value = CASE 
                            WHEN ? < min_value AND ? THEN GREATEST(0, min_value - 1)
                            ELSE min_value 
                        END,
                        max_value = CASE 
                            WHEN ? > max_value AND ? THEN max_value + 1
                            ELSE max_value 
                        END,
                        updated_at = NOW()
                    WHERE condition_type = ?
                `;

                const params = [
                    risk.value,
                    success ? 1 : 0,
                    risk.value,
                    success ? 1 : 0,
                    risk.type
                ];

                await connection.execute(query, params);
            }
        } catch (error) {
            console.error('Error learning from weather conditions:', error);
            throw error;
        }
    }

    async updateRules(connection, route, feedback) {
        try {
            const query = `
                INSERT INTO rules (rule_type, condition_json, action_json, priority)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                priority = CASE 
                    WHEN ? THEN priority + 1
                    ELSE GREATEST(0, priority - 1)
                END
            `;

            const ruleCondition = {
                distance_range: [route.distance * 0.9, route.distance * 1.1],
                weather_conditions: route.weatherRisks.map(risk => ({
                    type: risk.type,
                    severity: risk.severity
                }))
            };

            await connection.execute(query, [
                'ROUTE',
                JSON.stringify(ruleCondition),
                JSON.stringify(feedback.action),
                1,
                feedback.success ? 1 : 0
            ]);
        } catch (error) {
            console.error('Error updating rules:', error);
            throw error;
        }
    }

    async recordLearningMetric(connection, metricType, value) {
        try {
            console.log('Recording learning metric:', { metricType, value });
            
            await connection.beginTransaction();
            
            const query = `
                INSERT INTO learning_metrics (metric_type, value, timestamp)
                VALUES (?, ?, NOW())
            `;
            await connection.execute(query, [metricType, value]);
            
            // Verificar que la métrica se guardó
            const [result] = await connection.execute(
                'SELECT * FROM learning_metrics WHERE metric_type = ? ORDER BY timestamp DESC LIMIT 1',
                [metricType]
            );
            
            if (!result || result.length === 0) {
                throw new Error('Metric verification failed - no record found');
            }
            
            console.log('Metric recorded successfully:', result[0]);
            
            await connection.commit();
        } catch (error) {
            console.error('Error recording learning metric:', error);
            await connection.rollback();
            throw error;
        }
    }

    async getRulesByPriority() {
        const connection = await this.pool.getConnection();
        try {
            const [rules] = await connection.execute(
                'SELECT * FROM rules WHERE is_active = TRUE ORDER BY priority DESC'
            );
            return rules;
        } catch (error) {
            console.error('Error getting rules:', error);
            return [];
        } finally {
            connection.release();
        }
    }

    async getConnection() {
        return await this.pool.getConnection();
    }
}

module.exports = new LearningSystem();
