import instance from './axios';

/**
 * Get list of messages
 * @param {Object} params - Query parameters
 * @param {number} [params.limit=50] - Number of messages to return (1-100)
 * @param {number} [params.offset=0] - Number of messages to skip
 * @returns {Promise} Paginated list of messages
 */
export const getMessages = async (params = {}) => {
  const token = localStorage.getItem('authToken');
  
  const response = await instance.get('/api/messages/', {
    params: {
      limit: params.limit || 50,
      offset: params.offset || 0,
    },
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  
  return response.data;
};

/**
 * Send a new message
 * @param {string} content - Message content (min 1, max 5000 characters)
 * @returns {Promise} Created message data
 */
export const sendMessage = async (content) => {
  const token = localStorage.getItem('authToken');
  
  const response = await instance.post(
    '/api/messages/',
    {
      content,
    },
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
  
  return response.data;
};
