import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});


const getAuthHeader = () => {
  const user = 'admin';
  const pass = 'admin@123';
  return {
    Authorization: 'Basic ' + btoa(`${user}:${pass}`), 
  };
};


export const getTasks = (page = 0, size = 10, title = '') => {
  const params = new URLSearchParams({
    page: page,
    size: size, 
  });

  if (title) {
    params.append('title', title);
  }

  return apiClient.get(`/tasks?${params.toString()}`, { headers: getAuthHeader() });
};


export const createTask = (taskData) => {
  return apiClient.post('/tasks', taskData, { headers: getAuthHeader() });
};

export const updateTask = (id, taskData) => {
  return apiClient.put(`/tasks/${id}`, taskData, { headers: getAuthHeader() });
};

export const deleteTask = (id) => {
  return apiClient.delete(`/tasks/${id}`, { headers: getAuthHeader() });
};

export const getLogs = () => {
  return apiClient.get('/logs', { headers: getAuthHeader() });
};