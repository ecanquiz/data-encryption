import axios from 'axios';
import { setupEncryptionInterceptor } from '../utils/encryption-interceptor';

// Crear instancia base de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Configurar interceptores
const { encryptRequest, decryptResponse } = setupEncryptionInterceptor();

// Interceptor de request (encriptar)
api.interceptors.request.use(encryptRequest, (error) => Promise.reject(error));

// Interceptor de response (desencriptar)
api.interceptors.response.use(decryptResponse, (error) => Promise.reject(error));

// Servicios automáticos
export const TaskService = {
  getTasks: () => api.get('/tasks'),
  getTask: (id: string) => api.get(`/tasks/${id}`),
  createTask: (task: any) => api.post('/tasks', task),
  updateTask: (id: string, task: any) => api.put(`/tasks/${id}`, task),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`)
};

export default api;