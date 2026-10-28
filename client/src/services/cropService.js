import { api, aiApi } from './api';

export const getCropAndFertilizerRecommendation = async (soilParams) => {
  try {
    const res = await api.post('/crop/recommend', soilParams, {
      timeout: 15000,
    });
    return res.data;
  } catch (err) {
    console.warn('Spring Boot gateway unreachable, calling direct FastAPI service:', err.message);
    const res = await aiApi.post('/api/v1/crop/recommend', soilParams, {
      timeout: 15000,
    });
    return res.data;
  }
};

export const getSupportedCrops = async () => {
  try {
    const res = await api.get('/crop/supported');
    return res.data;
  } catch (err) {
    const res = await aiApi.get('/api/v1/crop/supported');
    return res.data;
  }
};
