import axios from 'axios'
import { setupEncryptionInterceptor } from '../utils/encryption-interceptor';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

const { encryptRequest, decryptResponse } = setupEncryptionInterceptor();

instance.interceptors.request.use(encryptRequest, (error) => Promise.reject(error));

instance.interceptors.response.use(decryptResponse, (error) => Promise.reject(error));


export const getTasks = async () => {
  return await instance.get("/tasks");
}

export const getTask = async <T>(taskId: T) => {
  return await instance.get(`/tasks/${taskId}`);
}

export const insertTask = async <T>(payload: T) => {
  return await instance.post(`/tasks`, payload);
}
  
export const updateTask = async <T,U>(taskId: T, payload: U) => {
  return instance.put(`/tasks/${taskId}`, payload);
}

export const removeTask = async <T>(taskId: T) => {  
  return instance.delete(`/tasks/${taskId}`);
}

export default instance;