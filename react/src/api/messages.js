import instance from './axios';

/**
 * Get list of messages
 * @param {number} limit - Number of messages to return
 * @param {number} offset - Number of messages to skip
 * @returns {Promise} Response with messages list
 */
export const getMessages = async (limit = 50, offset = 0) => {
  const token = localStorage.getItem('authToken');
  const response = await instance.get('/api/messages/', {
    headers: {
      Authorization: `Token ${token}`,
    },
    params: {
      limit,
      offset,
    },
  });
  return response.data;
};

/**
 * Create new message
 * @param {string} content - Message text content
 * @returns {Promise} Response with created message
 */
export const createMessage = async (content) => {
  const token = localStorage.getItem('authToken');
  const response = await instance.post(
    '/api/messages/',
    { content },
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
  return response.data;
};
