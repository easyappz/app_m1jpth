import instance from './axios';

/**
 * Register a new user
 * @param {string} username - User's username (min 3, max 150 characters)
 * @param {string} email - User's email address
 * @param {string} password - User's password (min 8 characters)
 * @returns {Promise} Response with user data and token
 */
export const register = async (username, email, password) => {
  const response = await instance.post('/api/auth/register/', {
    username,
    email,
    password,
  });
  
  // Save token to localStorage if registration successful
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
  }
  
  return response.data;
};

/**
 * Login user
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise} Response with user data and token
 */
export const login = async (username, password) => {
  const response = await instance.post('/api/auth/login/', {
    username,
    password,
  });
  
  // Save token to localStorage if login successful
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
  }
  
  return response.data;
};

/**
 * Logout current user
 * @returns {Promise} Response with logout confirmation
 */
export const logout = async () => {
  const token = localStorage.getItem('authToken');
  
  const response = await instance.post(
    '/api/auth/logout/',
    {},
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
  
  // Remove token from localStorage after successful logout
  localStorage.removeItem('authToken');
  
  return response.data;
};
