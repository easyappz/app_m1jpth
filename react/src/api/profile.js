import instance from './axios';

/**
 * Get current user profile
 * @returns {Promise} User profile data
 */
export const getProfile = async () => {
  const token = localStorage.getItem('authToken');
  
  const response = await instance.get('/api/profile/', {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  
  return response.data;
};

/**
 * Update current user profile
 * @param {Object} data - Profile data to update
 * @param {string} [data.username] - New username (min 3, max 150 characters)
 * @param {string} [data.email] - New email address
 * @returns {Promise} Updated user profile data
 */
export const updateProfile = async (data) => {
  const token = localStorage.getItem('authToken');
  
  const response = await instance.put('/api/profile/', data, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  
  return response.data;
};
