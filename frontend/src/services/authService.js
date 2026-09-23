import api from './api';

/**
 * Authentication service handling Login and Register API calls.
 */
export const authService = {
  /**
   * User login
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} API response data
   */
  async login(credentials) {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  /**
   * User registration
   * @param {Object} userData - { name, email, password, role }
   * @returns {Promise<Object>} API response data
   */
  async register(userData) {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  /**
   * Formats API errors into user-friendly messages
   * @param {Error} error - Axios error object
   * @returns {string} User-friendly error message
   */
  handleError(error) {
    if (!error.response) {
      return 'Unable to connect to the server. Please check your network or try again later.';
    }

    const { status, data } = error.response;

    // Check if backend provided a clean error message
    if (data && typeof data === 'object' && data.message && typeof data.message === 'string') {
      return data.message;
    }

    if (data && typeof data === 'string') {
      return data;
    }

    switch (status) {
      case 400:
        return 'Invalid request. Please check your details.';
      case 401:
        return 'Invalid email or password.';
      case 403:
        return 'Access forbidden. You do not have permission.';
      case 404:
        return 'Authentication service endpoint not found.';
      case 409:
        return 'An account with this email already exists.';
      case 500:
      default:
        return 'Server error. Please try again later.';
    }
  },
};

export default authService;
