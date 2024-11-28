const axios = require('axios');

class WeatherService {
    constructor() {
        this.apiKey = process.env.WEATHER_API_KEY;
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    }

    async getWeatherForLocation(lat, lon) {
        try {
            const response = await axios.get(`${this.baseUrl}/weather`, {
                params: {
                    lat,
                    lon,
                    appid: this.apiKey,
                    units: 'metric'
                }
            });

            return {
                temperature: response.data.main.temp,
                pressure: response.data.main.pressure,
                humidity: response.data.main.humidity,
                wind_speed: response.data.wind.speed,
                visibility: response.data.visibility / 1000, // Convert to km
                conditions: response.data.weather[0].main,
                description: response.data.weather[0].description
            };
        } catch (error) {
            console.error('Error fetching weather data:', error);
            return null;
        }
    }

    async getWeatherForecast(lat, lon) {
        try {
            const response = await axios.get(`${this.baseUrl}/forecast`, {
                params: {
                    lat,
                    lon,
                    appid: this.apiKey,
                    units: 'metric'
                }
            });

            return response.data.list.map(item => ({
                timestamp: new Date(item.dt * 1000),
                temperature: item.main.temp,
                pressure: item.main.pressure,
                humidity: item.main.humidity,
                wind_speed: item.wind.speed,
                visibility: item.visibility / 1000,
                conditions: item.weather[0].main,
                description: item.weather[0].description
            }));
        } catch (error) {
            console.error('Error fetching weather forecast:', error);
            return null;
        }
    }

    evaluateWeatherRisks(weather) {
        const risks = [];

        if (weather.wind_speed > 35) {
            risks.push({
                type: 'HIGH_WINDS',
                severity: 'HIGH',
                description: 'Wind speeds exceed safe operating conditions'
            });
        } else if (weather.wind_speed > 25) {
            risks.push({
                type: 'HIGH_WINDS',
                severity: 'MEDIUM',
                description: 'Wind speeds may cause turbulence'
            });
        }

        if (weather.visibility < 3) {
            risks.push({
                type: 'LOW_VISIBILITY',
                severity: 'HIGH',
                description: 'Visibility below safe operating minimum'
            });
        } else if (weather.visibility < 5) {
            risks.push({
                type: 'LOW_VISIBILITY',
                severity: 'MEDIUM',
                description: 'Reduced visibility may affect operations'
            });
        }

        return risks;
    }
}

module.exports = new WeatherService();
