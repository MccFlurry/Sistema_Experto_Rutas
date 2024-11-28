const mysql = require('mysql2/promise');
const dbConfig = require('../config/database');

const airportService = {
    async getAllAirports() {
        let connection;
        try {
            console.log('Attempting to fetch airports from database...');
            connection = await dbConfig.getConnection();
            console.log('Database connection established');

            const [airports] = await connection.query('SELECT * FROM airports WHERE iata_code IS NOT NULL AND latitude IS NOT NULL AND longitude IS NOT NULL');
            console.log('Retrieved airports from database:', airports.length);
            
            if (!airports || airports.length === 0) {
                console.log('No airports found in database');
                return [];
            }

            const mappedAirports = airports.map(airport => {
                const latitude = parseFloat(airport.latitude);
                const longitude = parseFloat(airport.longitude);
                
                // Validar que las coordenadas sean números válidos
                if (isNaN(latitude) || isNaN(longitude)) {
                    console.warn(`Invalid coordinates for airport ${airport.iata_code}:`, { latitude, longitude });
                    return null;
                }

                return {
                    id: airport.id,
                    name: airport.name || 'Unknown Airport',
                    iata_code: airport.iata_code,
                    latitude,
                    longitude,
                    timezone: airport.timezone || 'UTC'
                };
            }).filter(airport => airport !== null); // Eliminar aeropuertos inválidos

            console.log(`Successfully mapped ${mappedAirports.length} valid airports`);
            if (mappedAirports.length > 0) {
                console.log('First airport example:', mappedAirports[0]);
            }

            return mappedAirports;
        } catch (error) {
            console.error('Error getting airports:', error);
            throw new Error('Database error: ' + error.message);
        } finally {
            if (connection) {
                try {
                    connection.release();
                    console.log('Database connection released');
                } catch (releaseError) {
                    console.error('Error releasing connection:', releaseError);
                }
            }
        }
    },

    async getAirportByIata(iataCode) {
        if (!iataCode) {
            throw new Error('IATA code is required');
        }

        let connection;
        try {
            console.log('Searching for airport with IATA:', iataCode);
            connection = await dbConfig.getConnection();
            
            const [airports] = await connection.query(
                'SELECT * FROM airports WHERE iata_code = ? AND latitude IS NOT NULL AND longitude IS NOT NULL',
                [iataCode]
            );
            
            if (!airports || airports.length === 0) {
                console.log('No airport found with IATA:', iataCode);
                return null;
            }

            const airport = airports[0];
            const latitude = parseFloat(airport.latitude);
            const longitude = parseFloat(airport.longitude);

            // Validar que las coordenadas sean números válidos
            if (isNaN(latitude) || isNaN(longitude)) {
                console.error(`Invalid coordinates for airport ${iataCode}:`, { latitude, longitude });
                return null;
            }

            const mappedAirport = {
                id: airport.id,
                name: airport.name || 'Unknown Airport',
                iata_code: airport.iata_code,
                latitude,
                longitude,
                timezone: airport.timezone || 'UTC'
            };

            console.log('Found airport:', mappedAirport);
            return mappedAirport;
        } catch (error) {
            console.error(`Error getting airport with IATA ${iataCode}:`, error);
            throw new Error('Database error: ' + error.message);
        } finally {
            if (connection) {
                try {
                    connection.release();
                    console.log('Database connection released');
                } catch (releaseError) {
                    console.error('Error releasing connection:', releaseError);
                }
            }
        }
    },

    async addAirport(airportData) {
        if (!airportData || !airportData.iata_code) {
            throw new Error('Airport data with IATA code is required');
        }

        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            const result = await connection.query(
                'INSERT INTO airports (name, iata_code, latitude, longitude, timezone) VALUES (?, ?, ?, ?, ?)',
                [
                    airportData.name || 'Unknown Airport',
                    airportData.iata_code,
                    airportData.latitude,
                    airportData.longitude,
                    airportData.timezone || 'UTC'
                ]
            );

            console.log('Airport added successfully:', airportData);
            return result;
        } catch (error) {
            console.error('Error adding airport:', error);
            throw new Error('Database error: ' + error.message);
        } finally {
            if (connection) {
                try {
                    connection.release();
                } catch (releaseError) {
                    console.error('Error releasing connection:', releaseError);
                }
            }
        }
    },

    async updateAirport(iata_code, airportData) {
        if (!iata_code || !airportData) {
            throw new Error('IATA code and airport data are required');
        }

        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            const result = await connection.query(
                'UPDATE airports SET name = ?, latitude = ?, longitude = ?, timezone = ? WHERE iata_code = ?',
                [
                    airportData.name || 'Unknown Airport',
                    airportData.latitude,
                    airportData.longitude,
                    airportData.timezone || 'UTC',
                    iata_code
                ]
            );

            console.log('Airport updated successfully:', { iata_code, ...airportData });
            return result;
        } catch (error) {
            console.error('Error updating airport:', error);
            throw new Error('Database error: ' + error.message);
        } finally {
            if (connection) {
                try {
                    connection.release();
                } catch (releaseError) {
                    console.error('Error releasing connection:', releaseError);
                }
            }
        }
    }
};

module.exports = airportService;
