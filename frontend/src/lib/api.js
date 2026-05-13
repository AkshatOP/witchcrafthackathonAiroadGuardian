// API client — all requests go through Vite proxy → localhost:3001
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
});

// GET /potholes — list all with optional filters
export const fetchPotholes = async (params = {}) => {
  const { data } = await api.get('/potholes', { params });
  return data;
};

// GET /potholes/stats
export const fetchStats = async () => {
  const { data } = await api.get('/potholes/stats');
  return data;
};

// GET /potholes/:id
export const fetchPotholeById = async (id) => {
  const { data } = await api.get(`/potholes/${id}`);
  return data;
};

// POST /potholes — upload image + coords
export const reportPothole = async (imageFile, latitude, longitude) => {
  const form = new FormData();
  form.append('image', imageFile);
  form.append('latitude', latitude);
  form.append('longitude', longitude);
  const { data } = await api.post('/potholes', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// PATCH /potholes/:id/status
export const updateStatus = async (id, status) => {
  const { data } = await api.patch(`/potholes/${id}/status`, { status });
  return data;
};

// DELETE /potholes/:id
export const deletePotholeById = async (id) => {
  const { data } = await api.delete(`/potholes/${id}`);
  return data;
};

// GET /routes?fromLat=&fromLng=&toLat=&toLng=
export const fetchRoute = async (fromLat, fromLng, toLat, toLng) => {
  const { data } = await api.get('/routes', {
    params: { fromLat, fromLng, toLat, toLng },
  });
  return data;
};

// Nominatim address autocomplete
export const searchAddress = async (query) => {
  const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: { q: query, format: 'json', limit: 5, countrycodes: 'in', addressdetails: 1 },
    headers: { 'User-Agent': 'AIRoadGuardian/1.0' },
  });
  return data;
};

export default api;
