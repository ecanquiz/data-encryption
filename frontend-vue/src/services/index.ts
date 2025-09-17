import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost:8000/api'
});

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
