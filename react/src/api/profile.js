import instance from './axios';

export const getProfile = async () => {
  const response = await instance.get('/api/profile/');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await instance.put('/api/profile/', data);
  return response.data;
};

export const logout = async () => {
  const response = await instance.post('/api/auth/logout/');
  return response.data;
};
