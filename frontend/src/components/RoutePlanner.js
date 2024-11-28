import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Typography, 
    TextField, 
    Button, 
    Grid, 
    Paper, 
    Autocomplete,
    CircularProgress,
    Alert
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const RoutePlanner = () => {
    const [origin, setOrigin] = useState(null);
    const [destination, setDestination] = useState(null);
    const [airports, setAirports] = useState([]);
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingAirports, setLoadingAirports] = useState(true);

    useEffect(() => {
        fetchAirports();
    }, []);

    const fetchAirports = async () => {
        try {
            setLoadingAirports(true);
            setError(null);
            console.log('Obteniendo aeropuertos del backend...');
            
            const response = await axios.get(`${API_BASE_URL}/airports`, {
                timeout: 5000,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Respuesta del backend:', response.data);
            
            if (response.data.success && Array.isArray(response.data.data)) {
                console.log(`Se cargaron ${response.data.data.length} aeropuertos`);
                if (response.data.data.length === 0) {
                    setError('No hay aeropuertos disponibles en la base de datos');
                } else {
                    setAirports(response.data.data);
                }
            } else {
                console.error('Formato de respuesta inválido:', response.data);
                setError(response.data.error || 'Respuesta inválida del servidor');
            }
        } catch (error) {
            console.error('Error al obtener aeropuertos:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            let errorMessage = 'No se pudieron cargar los aeropuertos. ';
            
            if (error.response) {
                errorMessage += error.response.data?.error || `Error del servidor (${error.response.status})`;
            } else if (error.request) {
                errorMessage += 'No se recibió respuesta del servidor. Verifique si el backend está en ejecución.';
            } else {
                errorMessage += error.message;
            }
            
            setError(errorMessage);
            setAirports([]);
        } finally {
            setLoadingAirports(false);
        }
    };

    const handlePlanRoute = async () => {
        if (!origin || !destination) {
            setError('Por favor, seleccione ambos aeropuertos de origen y destino');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setRoute(null);
            
            console.log('Planificando ruta:', { 
                origin: origin.iata_code, 
                destination: destination.iata_code 
            });

            const response = await axios.post(`${API_BASE_URL}/route-planner/plan`, {
                originIata: origin.iata_code,
                destinationIata: destination.iata_code
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            console.log('Respuesta de planificación de ruta:', response.data);

            if (response.data.success && response.data.data) {
                setRoute(response.data.data);
            } else {
                setError(response.data.error || 'No se pudo planificar la ruta');
            }
        } catch (error) {
            console.error('Error al planificar la ruta:', error.response || error);
            let errorMessage = 'No se pudo planificar la ruta. ';
            
            if (error.response?.data?.error) {
                errorMessage += error.response.data.error;
            } else if (error.response) {
                errorMessage += `Error del servidor (${error.response.status})`;
            } else if (error.request) {
                errorMessage += 'No se recibió respuesta del servidor. Verifique si el backend está en ejecución.';
            } else {
                errorMessage += error.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const renderRouteDetails = (route) => {
        return (
            <div>
                <Typography variant="h6" gutterBottom>Detalles de la Ruta</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper elevation={1} sx={{ p: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Información Básica
                            </Typography>
                            <Typography>
                                Origen: {route.origin.name} ({route.origin.iata_code})
                            </Typography>
                            <Typography>
                                Destino: {route.destination.name} ({route.destination.iata_code})
                            </Typography>
                            <Typography>
                                Distancia: {route.distance.toLocaleString()} {route.units.distance}
                            </Typography>
                            <Typography>
                                Tiempo Base: {route.baseTime.toLocaleString()} {route.units.duration}
                            </Typography>
                            <Typography>
                                Duración Total: {route.duration.toLocaleString()} {route.units.duration}
                            </Typography>
                            <Typography>
                                Impacto del Clima: {route.weatherImpact}%
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper elevation={1} sx={{ p: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Horarios Estimados
                            </Typography>
                            <Typography>
                                Salida: {new Date(route.departureTime).toLocaleString()}
                            </Typography>
                            <Typography>
                                Llegada: {new Date(route.arrivalTime).toLocaleString()}
                            </Typography>
                        </Paper>
                    </Grid>

                    {route.weatherRisks && route.weatherRisks.length > 0 && (
                        <Grid item xs={12}>
                            <Paper elevation={1} sx={{ p: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Condiciones Meteorológicas
                                </Typography>
                                <Grid container spacing={2}>
                                    {route.weatherRisks.map((risk, index) => (
                                        <Grid item xs={12} sm={6} md={4} key={index}>
                                            <Paper 
                                                elevation={0} 
                                                sx={{ 
                                                    p: 1, 
                                                    bgcolor: risk.severity === 'HIGH' ? '#fff3f0' : 
                                                            risk.severity === 'MODERATE' ? '#fff7e6' : '#f6ffed'
                                                }}
                                            >
                                                <Typography variant="subtitle2" color="textSecondary">
                                                    {risk.type === 'WIND_SPEED' ? '💨 Viento' :
                                                     risk.type === 'VISIBILITY' ? '👁️ Visibilidad' :
                                                     risk.type === 'ALTITUDE' ? '🏔️ Altitud' : risk.type}
                                                </Typography>
                                                <Typography>
                                                    {risk.description}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Severidad: {risk.severity}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        </Grid>
                    )}

                    {route.reasoning && route.reasoning.length > 0 && (
                        <Grid item xs={12}>
                            <Paper elevation={1} sx={{ p: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Análisis de Optimización
                                </Typography>
                                <Grid container spacing={2}>
                                    {route.reasoning.map((reason, index) => (
                                        <Grid item xs={12} sm={6} key={index}>
                                            <Paper 
                                                elevation={0} 
                                                sx={{ 
                                                    p: 1, 
                                                    bgcolor: reason.impact > 0 ? '#fff3f0' : '#f6ffed'
                                                }}
                                            >
                                                <Typography variant="subtitle2">
                                                    {reason.description}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    {reason.details}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        </Grid>
                    )}

                    {route.fuelStops && route.fuelStops.length > 0 && (
                        <Grid item xs={12}>
                            <Paper elevation={1} sx={{ p: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Paradas de Combustible
                                </Typography>
                                {route.fuelStops.map((stop, index) => (
                                    <Paper 
                                        key={index}
                                        elevation={0}
                                        sx={{ p: 1, mb: 1, bgcolor: '#f0f5ff' }}
                                    >
                                        <Typography>
                                            {stop.airport} ({stop.iata})
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Distancia desde origen: {stop.distanceFromOrigin} km
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Distancia hasta destino: {stop.distanceToDestination} km
                                        </Typography>
                                        <Typography variant="body2" color="success.main">
                                            Tiempo ahorrado: {stop.timeSaved} horas
                                        </Typography>
                                    </Paper>
                                ))}
                            </Paper>
                        </Grid>
                    )}

                    {route.altitudeOptimization && route.altitudeOptimization.timeSaved > 0 && (
                        <Grid item xs={12}>
                            <Paper elevation={1} sx={{ p: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Optimización de Altitud
                                </Typography>
                                <Typography>
                                    Altitud óptima de crucero: {route.altitudeOptimization.altitude.toLocaleString()} pies
                                </Typography>
                                <Typography variant="body2" color="success.main">
                                    Tiempo ahorrado: {route.altitudeOptimization.timeSaved} horas
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </div>
        );
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Planificador de Rutas
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12} md={5}>
                        <Autocomplete
                            options={airports}
                            getOptionLabel={(airport) => `${airport.name} (${airport.iata_code})`}
                            loading={loadingAirports}
                            value={origin}
                            onChange={(event, newValue) => {
                                console.log('Aeropuerto de origen seleccionado:', newValue);
                                setOrigin(newValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Aeropuerto de Origen"
                                    required
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loadingAirports ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <Autocomplete
                            options={airports}
                            getOptionLabel={(airport) => `${airport.name} (${airport.iata_code})`}
                            loading={loadingAirports}
                            value={destination}
                            onChange={(event, newValue) => {
                                console.log('Aeropuerto de destino seleccionado:', newValue);
                                setDestination(newValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Aeropuerto de Destino"
                                    required
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loadingAirports ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={2}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handlePlanRoute}
                            disabled={loading || !origin || !destination}
                            fullWidth
                            sx={{ height: '56px' }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Planificar Ruta'}
                        </Button>
                    </Grid>
                </Grid>

                {route && (
                    <Paper elevation={2} sx={{ mt: 3, p: 2 }}>
                        {renderRouteDetails(route)}
                    </Paper>
                )}
            </Paper>
        </Container>
    );
};

export default RoutePlanner;
