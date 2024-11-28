const LearningSystem = require('./LearningSystem');
const airportService = require('../services/airportService');

class RoutePlanner {
    constructor() {
        this.airports = {};
        this.earthRadius = 6371; // Radio de la Tierra en kilómetros
        this.averageSpeed = 926; // Velocidad promedio en km/h (500 nudos)
        this.initialized = false;
        this.initializationPromise = null;
        this.recentOptimizations = [];
    }

    async initialize() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        if (!this.initialized) {
            this.initializationPromise = (async () => {
                try {
                    console.log('Inicializando el Planificador de Rutas...');
                    const airports = await airportService.getAllAirports();
                    
                    if (!airports || !Array.isArray(airports) || airports.length === 0) {
                        throw new Error('No hay aeropuertos disponibles en la base de datos');
                    }
                    
                    this.airports = airports.reduce((acc, airport) => {
                        if (airport && airport.iata_code && airport.latitude && airport.longitude) {
                            acc[airport.iata_code] = airport;
                        }
                        return acc;
                    }, {});

                    if (Object.keys(this.airports).length === 0) {
                        throw new Error('No se encontraron aeropuertos válidos en la base de datos');
                    }

                    this.initialized = true;
                    console.log('Planificador de Rutas inicializado exitosamente con', Object.keys(this.airports).length, 'aeropuertos');
                    return true;
                } catch (error) {
                    console.error('Error al inicializar el Planificador de Rutas:', error);
                    this.initialized = false;
                    throw error;
                } finally {
                    this.initializationPromise = null;
                }
            })();

            return this.initializationPromise;
        }
        return true;
    }

    calculateDistance(origin, destination) {
        const lat1 = this.toRadians(origin.latitude);
        const lon1 = this.toRadians(origin.longitude);
        const lat2 = this.toRadians(destination.latitude);
        const lon2 = this.toRadians(destination.longitude);

        const dlon = lon2 - lon1;
        const dlat = lat2 - lat1;

        const a = Math.sin(dlat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon/2)**2;
        const c = 2 * Math.asin(Math.sqrt(a));
        
        return this.earthRadius * c;
    }

    calculateDuration(distance, weatherFactor = 1) {
        return (distance / this.averageSpeed) * weatherFactor;
    }

    toRadians(degrees) {
        return degrees * (Math.PI/180);
    }

    async generateWeatherRisks(origin, destination, distance) {
        // Generar riesgos basados en la distancia y ubicación
        const risks = [];
        
        // Riesgo de viento basado en la diferencia de latitud
        const latDiff = Math.abs(origin.latitude - destination.latitude);
        if (latDiff > 10) {
            risks.push({
                type: 'WIND_SPEED',
                value: 45 + (latDiff * 0.5),
                severity: latDiff > 20 ? 'HIGH' : 'MODERATE',
                description: `${latDiff > 20 ? 'Fuertes' : 'Moderadas'} condiciones de viento debido a la diferencia de latitud`,
                impact: latDiff > 20 ? 0.15 : 0.08
            });
        }

        // Riesgo de visibilidad basado en la distancia
        if (distance > 3000) {
            risks.push({
                type: 'VISIBILITY',
                value: Math.max(5, 10 - (distance/1000)),
                severity: distance > 5000 ? 'MODERATE' : 'LOW',
                description: 'Visibilidad reducida en vuelos de larga distancia',
                impact: distance > 5000 ? 0.1 : 0.05
            });
        }

        // Riesgo de altitud basado en la diferencia de longitud
        const lonDiff = Math.abs(origin.longitude - destination.longitude);
        if (lonDiff > 15) {
            risks.push({
                type: 'ALTITUDE',
                value: 35000 + (lonDiff * 100),
                severity: lonDiff > 30 ? 'HIGH' : 'MODERATE',
                description: 'Ajustes de altitud requeridos para ruta óptima',
                impact: lonDiff > 30 ? -0.1 : -0.05
            });
        }

        return risks;
    }

    async planRoute(originIata, destinationIata) {
        try {
            if (!originIata || !destinationIata) {
                return {
                    success: false,
                    error: 'Los códigos IATA de origen y destino son requeridos',
                    data: null
                };
            }

            // Asegurar que el sistema está inicializado
            await this.initialize();
            
            console.log('Planificando ruta desde', originIata, 'hasta', destinationIata);
            console.log('Aeropuertos disponibles:', Object.keys(this.airports).length);
            
            const origin = this.airports[originIata];
            const destination = this.airports[destinationIata];

            if (!origin || !destination) {
                console.error('Aeropuertos inválidos:', { 
                    originExists: !!origin, 
                    destinationExists: !!destination,
                    originIata,
                    destinationIata,
                    availableAirports: Object.keys(this.airports)
                });
                return {
                    success: false,
                    error: `Aeropuerto no encontrado: ${!origin ? originIata : destinationIata}`,
                    data: null
                };
            }

            const distance = this.calculateDistance(origin, destination);
            const weatherRisks = await this.generateWeatherRisks(origin, destination, distance);
            
            // Análisis de optimización de ruta
            const routeOptimization = {
                distance,
                baseTime: this.calculateDuration(distance),
                weatherImpact: 0,
                fuelStops: [],
                altitudeOptimization: null,
                totalDuration: 0,
                reasoning: []
            };

            // Evaluar paradas de combustible para rutas largas
            if (distance > 5000) {
                const potentialStops = await this.analyzePotentialFuelStops(origin, destination);
                if (potentialStops.length > 0) {
                    const bestStop = potentialStops[0];
                    routeOptimization.fuelStops.push(bestStop);
                    routeOptimization.reasoning.push({
                        factor: 'FUEL_STOP',
                        description: `Parada de combustible óptima en ${bestStop.airport} (${bestStop.iata})`,
                        impact: -bestStop.timeSaved,
                        details: `Reduce el tiempo total de vuelo en ${bestStop.timeSaved.toFixed(1)} horas`
                    });
                }
            }

            // Analizar impacto del clima
            let weatherFactor = 1;
            for (const risk of weatherRisks) {
                const impact = risk.impact || 0;
                weatherFactor += impact;
                routeOptimization.weatherImpact += impact;
                
                routeOptimization.reasoning.push({
                    factor: risk.type,
                    description: risk.description,
                    impact: impact,
                    details: `${impact > 0 ? 'Aumenta' : 'Reduce'} el tiempo de vuelo en ${Math.abs(impact * 100).toFixed(1)}%`
                });
            }

            // Optimización de altitud
            const altitudeOpt = this.optimizeAltitude(distance, weatherRisks);
            if (altitudeOpt.timeSaved > 0) {
                routeOptimization.altitudeOptimization = altitudeOpt;
                routeOptimization.reasoning.push({
                    factor: 'ALTITUDE',
                    description: `Altitud de crucero óptima de ${altitudeOpt.altitude.toLocaleString()} pies`,
                    impact: -altitudeOpt.timeSaved,
                    details: `Reduce el tiempo de vuelo en ${altitudeOpt.timeSaved.toFixed(1)} horas`
                });
            }

            // Calcular duración total
            routeOptimization.totalDuration = this.calculateDuration(distance, weatherFactor);
            if (routeOptimization.fuelStops.length > 0) {
                routeOptimization.totalDuration += routeOptimization.fuelStops.reduce(
                    (total, stop) => total - stop.timeSaved, 0
                );
            }
            if (routeOptimization.altitudeOptimization) {
                routeOptimization.totalDuration -= routeOptimization.altitudeOptimization.timeSaved;
            }

            // Agregar a optimizaciones recientes
            const routeData = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                origin: originIata,
                destination: destinationIata,
                distance: parseFloat(distance.toFixed(1)),
                duration: parseFloat(routeOptimization.totalDuration.toFixed(1)),
                optimizations: routeOptimization.reasoning.map(r => ({
                    type: r.factor,
                    description: r.description,
                    impact: parseFloat((r.impact * 100).toFixed(1))
                }))
            };

            this.recentOptimizations.unshift(routeData);
            if (this.recentOptimizations.length > 10) {
                this.recentOptimizations.pop();
            }

            return {
                success: true,
                data: {
                    origin,
                    destination,
                    distance: parseFloat(distance.toFixed(1)),
                    duration: parseFloat(routeOptimization.totalDuration.toFixed(1)),
                    baseTime: parseFloat(routeOptimization.baseTime.toFixed(1)),
                    weatherImpact: parseFloat((routeOptimization.weatherImpact * 100).toFixed(1)),
                    units: { 
                        distance: 'km', 
                        duration: 'hours',
                        weatherImpact: '%'
                    },
                    departureTime: new Date().toISOString(),
                    arrivalTime: new Date(Date.now() + (routeOptimization.totalDuration * 3600000)).toISOString(),
                    weatherRisks,
                    fuelStops: routeOptimization.fuelStops,
                    altitudeOptimization: routeOptimization.altitudeOptimization,
                    reasoning: routeOptimization.reasoning,
                    optimizationId: routeData.id
                }
            };
        } catch (error) {
            console.error('Error al planificar la ruta:', error);
            return {
                success: false,
                error: error.message || 'Error al planificar la ruta',
                data: null
            };
        }
    }

    async analyzePotentialFuelStops(origin, destination) {
        const directDistance = this.calculateDistance(origin, destination);
        const maxRange = 5500; // km
        
        if (directDistance <= maxRange) {
            return [];
        }

        // Encontrar aeropuertos potenciales para paradas de combustible
        const potentialStops = Object.values(this.airports).filter(airport => {
            if (airport.iata_code === origin.iata_code || airport.iata_code === destination.iata_code) {
                return false;
            }

            const distToOrigin = this.calculateDistance(origin, airport);
            const distToDestination = this.calculateDistance(airport, destination);

            return distToOrigin <= maxRange && distToDestination <= maxRange;
        });

        // Calcular eficiencia de cada parada
        return potentialStops.map(airport => {
            const distToOrigin = this.calculateDistance(origin, airport);
            const distToDestination = this.calculateDistance(airport, destination);
            const totalDistance = distToOrigin + distToDestination;
            
            // Tiempo con y sin parada
            const directTime = this.calculateDuration(directDistance);
            const stopTime = this.calculateDuration(distToOrigin) + 
                           1.5 + // 1.5 horas para reabastecimiento
                           this.calculateDuration(distToDestination);
            
            return {
                airport: airport.name,
                iata: airport.iata_code,
                distanceFromOrigin: parseFloat(distToOrigin.toFixed(1)),
                distanceToDestination: parseFloat(distToDestination.toFixed(1)),
                totalDistance: parseFloat(totalDistance.toFixed(1)),
                totalDuration: parseFloat(stopTime.toFixed(1)),
                timeSaved: parseFloat((directTime - stopTime).toFixed(1))
            };
        })
        .filter(stop => stop.timeSaved > 0)
        .sort((a, b) => b.timeSaved - a.timeSaved)
        .slice(0, 3);
    }

    optimizeAltitude(distance, weatherRisks) {
        const baseAltitude = 35000;
        let optimalAltitude = baseAltitude;
        let timeSaved = 0;

        // Ajustar altitud basado en la distancia
        if (distance > 3000) {
            optimalAltitude = Math.min(43000, baseAltitude + (distance / 100));
            timeSaved += 0.2;
        }

        // Ajustar por condiciones climáticas
        const windRisk = weatherRisks.find(r => r.type === 'WIND_SPEED');
        if (windRisk && windRisk.value > 40) {
            optimalAltitude = Math.min(45000, optimalAltitude + 2000);
            timeSaved += 0.1;
        }

        return {
            altitude: Math.round(optimalAltitude),
            timeSaved: parseFloat(timeSaved.toFixed(1))
        };
    }

    getRecentOptimizations() {
        return this.recentOptimizations;
    }
}

// Exportar una única instancia del RoutePlanner
module.exports = new RoutePlanner();
