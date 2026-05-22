const API_URL = 'http://localhost:5000/api';

const api = {
  async request(endpoint, method = 'GET', body = null, token = null) {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  },

  auth: {
    signup(userData) {
      return api.request('/auth/signup', 'POST', userData);
    },
    login(credentials) {
      return api.request('/auth/login', 'POST', credentials);
    },
    getMe(token) {
      return api.request('/auth/me', 'GET', null, token);
    },
  },

  addresses: {
    getAll(token) {
      return api.request('/addresses', 'GET', null, token);
    },
    add(addressData, token) {
      return api.request('/addresses', 'POST', addressData, token);
    },
    delete(id, token) {
      return api.request(`/addresses/${id}`, 'DELETE', null, token);
    },
  },
};

// Export for use in other scripts
window.api = api;
