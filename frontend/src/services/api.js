import axios from 'axios';

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',

    // ✅ กัน cache (สำคัญมากสำหรับปัญหา 304)
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Expires: '0',
  },
});

// ===============================
// Schedule API
// ===============================

export const scheduleAPI = {
  // Get all schedules
  getAll: () => api.get('/schedules'),

  // Get schedule by id
  getById: (id) => api.get(`/schedules/${id}`),

  // Create new schedule
  create: (data) => api.post('/schedules', data),

  // Update schedule
  update: (id, data) => api.put(`/schedules/${id}`, data),

  // Delete schedule
  delete: (id) => api.delete(`/schedules/${id}`),

  // Get by date range
  getByDateRange: (startDate, endDate) =>
    api.get(`/schedules/range/${startDate}/${endDate}`),

  // ✅ Get schedules by week (กัน cache ด้วย timestamp)
  getByWeek: (date) =>
    api.get(`/schedules/week/${date}`, {
      params: {
        t: Date.now(), // กัน browser cache
      },
    }),

  // Get by instructor
  getByInstructor: (instructorId) =>
    api.get(`/schedules/instructor/${instructorId}`),
};

export default api;
