import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const routePlannerService = {
  planRoute: async (routeData) => {
    try {
      const response = await api.post('/route-planner/plan', routeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getRouteExplanation: async (routeId) => {
    try {
      const response = await api.get(`/route-planner/explanation/${routeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export const airportService = {
  searchAirports: async (query) => {
    try {
      const response = await api.get('/airports/search', { params: { query } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getAirportDetails: async (iataCode) => {
    try {
      const response = await api.get(`/airports/${iataCode}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export const weatherService = {
  getWeatherInfo: async (latitude, longitude) => {
    try {
      const response = await api.get('/weather', {
        params: { latitude, longitude },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default api;
