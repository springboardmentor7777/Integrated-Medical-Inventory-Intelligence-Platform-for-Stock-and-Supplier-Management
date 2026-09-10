import api from './api';

export const authService = {

  async login(credentials) {
    const response = await api.post('/api/auth/login', credentials);
    this.saveSession(response.data);
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  saveSession(authData) {
    localStorage.setItem('medistock_token', authData.token);

    // Safely extract properties whether authData flatly contains user attributes OR holds a nested user object
    const userObj = authData.user || authData;

    localStorage.setItem(
        'medistock_user',
        JSON.stringify({
          id: userObj.id || userObj.userId || null,
          name: userObj.name || userObj.fullName || userObj.username || 'User',
          email: userObj.email || '',
          role: userObj.role || 'GUEST',
        })
    );
  },

  getToken() {
    return localStorage.getItem('medistock_token');
  },

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('medistock_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(this.getToken() && this.getCurrentUser());
  },

  logout() {
    localStorage.removeItem('medistock_token');
    localStorage.removeItem('medistock_user');
  },

  handleError(error) {
    if (!error.response) {
      return 'Unable to connect to the server. Please check your network or try again later.';
    }

    const { status, data } = error.response;
    if (data && typeof data === 'object' && data.message && typeof data.message === 'string') {
      return data.message;
    }
    if (data && typeof data === 'string') return data;

    switch (status) {
      case 400: return 'Invalid request. Please check your details.';
      case 401: return 'Invalid email or password.';
      case 403: return 'Access forbidden. You do not have permission.';
      case 404: return 'Requested resource was not found.';
      case 409: return 'A record with these details already exists.';
      default: return 'Server error. Please try again later.';
    }
  },
};

export default authService;