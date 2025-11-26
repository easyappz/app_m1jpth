import instance from './axios';

export const getProfile = async () => {
  const token = localStorage.getItem('authToken');
  const response = await instance.get('/api/profile/', {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return response.data;
};

export const updateProfile = async (data) => {
  const token = localStorage.getItem('authToken');
  const response = await instance.put('/api/profile/', data, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return response.data;
};

export const logout = async () => {
  const token = localStorage.getItem('authToken');
  const response = await instance.post('/api/auth/logout/', {}, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return response.data;
};
