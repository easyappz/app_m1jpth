import axiosInstance from './axios';

export const register = async (userData) => {
  const response = await axiosInstance.post('/api/auth/register/', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await axiosInstance.post('/api/auth/login/', credentials);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post('/api/auth/logout/');
  return response.data;
};