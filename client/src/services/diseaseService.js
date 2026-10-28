import { api, aiApi } from './api';

export const detectCropDisease = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);

  // Try Spring Boot gateway first, fallback to direct FastAPI service
  try {
    const res = await api.post('/disease/detect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 20000,
    });
    return res.data;
  } catch (err) {
    console.warn('Spring Boot gateway unreachable, falling back to direct FastAPI service:', err.message);
    const res = await aiApi.post('/api/v1/disease/detect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 20000,
    });
    return res.data;
  }
};

export const getSupportedDiseaseClasses = async () => {
  try {
    const res = await api.get('/disease/classes');
    return res.data;
  } catch (err) {
    const res = await aiApi.get('/api/v1/disease/classes');
    return res.data;
  }
};
