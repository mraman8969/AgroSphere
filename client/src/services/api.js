import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

// Main Spring Boot Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// AI Service Direct Axios instance (useful for independent testing during development)
export const aiApi = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 15000,
});

export const checkSpringBackendHealth = async () => {
  try {
    const res = await api.get('/health');
    return res.data;
  } catch (err) {
    return { status: 'DOWN', error: err.message };
  }
};

export const checkAiServiceHealth = async () => {
  try {
    const res = await aiApi.get('/health');
    return res.data;
  } catch (err) {
    return { status: 'DOWN', error: err.message };
  }
};
