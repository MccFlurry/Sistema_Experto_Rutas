import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    CircularProgress,
    Button
} from '@mui/material';
import axios from 'axios';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [systemMetrics, setSystemMetrics] = useState(null);
    const [recentRoutes, setRecentRoutes] = useState([]);
    const [weatherAnalysis, setWeatherAnalysis] = useState({ currentConditions: [], learningHistory: [] });

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [metricsResponse, routesResponse, weatherResponse] = await Promise.all([
                axios.get('/api/dashboard/system-metrics'),
                axios.get('/api/dashboard/recent-routes'),
                axios.get('/api/dashboard/weather-analysis')
            ]);

            if (metricsResponse.data.success) {
                setSystemMetrics(metricsResponse.data.data);
            } else {
                console.error('Error in metrics response:', metricsResponse.data.error);
                throw new Error(metricsResponse.data.error);
            }

            if (routesResponse.data.success) {
                setRecentRoutes(routesResponse.data.data);
            } else {
                console.error('Error in routes response:', routesResponse.data.error);
                throw new Error(routesResponse.data.error);
            }

            if (weatherResponse.data.success) {
                setWeatherAnalysis(weatherResponse.data.data);
            } else {
                console.error('Error in weather response:', weatherResponse.data.error);
                throw new Error(weatherResponse.data.error);
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.message || 'Error fetching dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Actualizar cada 30 segundos
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="error" gutterBottom>
                    {error}
                </Typography>
                <Button variant="contained" onClick={fetchDashboardData}>
                    Retry
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Grid container spacing={3}>
                {/* Métricas del Sistema */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                System Metrics
                            </Typography>
                            {systemMetrics?.routeMetrics && (
                                <Grid container spacing={2}>
                                    <Grid item xs={3}>
                                        <Typography variant="subtitle2">Total Routes</Typography>
                                        <Typography variant="h4">{systemMetrics.routeMetrics.total_routes}</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="subtitle2">Average Duration</Typography>
                                        <Typography variant="h4">
                                            {Math.round(systemMetrics.routeMetrics.avg_duration)} min
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="subtitle2">Average Distance</Typography>
                                        <Typography variant="h4">
                                            {Math.round(systemMetrics.routeMetrics.avg_distance * 1.852)} km
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography variant="subtitle2">Active Rules</Typography>
                                        <Typography variant="h4">
                                            {systemMetrics.ruleMetrics.length}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Progreso del Aprendizaje */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Learning Progress
                            </Typography>
                            <Grid container spacing={2}>
                                {systemMetrics?.learningStats?.map((stat, index) => (
                                    <Grid item xs={4} key={index}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle2" color="textSecondary">
                                                    {stat.metric_type}
                                                </Typography>
                                                <Typography variant="h6">
                                                    {stat.total_updates} Updates
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Avg Value: {Math.round(stat.avg_value * 100) / 100}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    Last Update: {new Date(stat.last_learning).toLocaleDateString()}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Rutas Recientes */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Recent Optimized Routes
                            </Typography>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Route</TableCell>
                                        <TableCell>Distance</TableCell>
                                        <TableCell>Duration</TableCell>
                                        <TableCell>Learning Iterations</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentRoutes.map((route, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {route.origin_code} → {route.destination_code}
                                            </TableCell>
                                            <TableCell>{Math.round(route.distance)} nm</TableCell>
                                            <TableCell>{route.typical_duration} min</TableCell>
                                            <TableCell>{route.learning_iterations} updates</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Análisis del Clima */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Weather Analysis
                            </Typography>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Condition</TableCell>
                                        <TableCell>Min Value</TableCell>
                                        <TableCell>Max Value</TableCell>
                                        <TableCell>Unit</TableCell>
                                        <TableCell>Learning Count</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {weatherAnalysis.currentConditions?.map((condition, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{condition.condition_type}</TableCell>
                                            <TableCell>{condition.min_value}</TableCell>
                                            <TableCell>{condition.max_value}</TableCell>
                                            <TableCell>{condition.unit}</TableCell>
                                            <TableCell>{condition.learning_count}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Historial de Aprendizaje Climático */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Weather Learning History
                            </Typography>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Condition</TableCell>
                                        <TableCell>Average Value</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {weatherAnalysis.learningHistory?.map((entry, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{entry.metric_type.replace('WEATHER_', '')}</TableCell>
                                            <TableCell>{Math.round(entry.avg_value * 100) / 100}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
