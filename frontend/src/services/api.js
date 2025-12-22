import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const scheduleAPI = {
  getAll: () => api.get('/schedules'),
  getById: (id) => api.get(`/schedules/${id}`),
  create: (data) => api.post('/schedules', data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`),
  getByDateRange: (startDate, endDate) => api.get(`/schedules/range/${startDate}/${endDate}`),
  getByWeek: (date) => api.get(`/schedules/week/${date}`),
  getByInstructor: (instructorId) => api.get(`/schedules/instructor/${instructorId}`)
};


export default api;
