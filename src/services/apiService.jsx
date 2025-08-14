// src/services/apiService.js
import axios from 'axios';

// Configure Axios defaults
axios.defaults.baseURL = 'http://127.0.0.1:8000/api';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

// Create an Axios instance with custom config
const apiClient = axios.create({
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // You can add auth token here if needed
        // const token = localStorage.getItem('token');
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('API Error: No response received');
        } else {
            console.error('API Error:', error.message);
        }
        return Promise.reject(error);
    }
);

// API endpoints configuration
export const api = {
    // Safe Types
    safeTypes: {
        getAll: () => apiClient.get('/safe-types'),
        getById: (id) => apiClient.get(`/safe-types/${id}`),
        create: (data) => apiClient.post('/safe-types', data),
        update: (id, data) => apiClient.put(`/safe-types/${id}`, data),
        delete: (id) => apiClient.delete(`/safe-types/${id}`),
    },
    
    // Partners
    partners: {
        getAll: (params = {}) => apiClient.get('/partners', { params }),
        getById: (id) => apiClient.get(`/partners/${id}`),
        create: (data) => apiClient.post('/partners', data),
        update: (id, data) => apiClient.put(`/partners/${id}`, data),
        delete: (id) => apiClient.delete(`/partners/${id}`),
    },
    
    // Crypto Transactions
    cryptoTransactions: {
        getAll: (params = {}) => apiClient.get('/crypto-transactions/', { params }),
        getById: (id) => apiClient.get(`/crypto-transactions/${id}/`),
        create: (data) => apiClient.post('/crypto-transactions/', data),
        update: (id, data) => apiClient.put(`/crypto-transactions/${id}/`, data),
        delete: (id) => apiClient.delete(`/crypto-transactions/${id}/`),
    },
    
    // Transfer Exchanges
    transferExchanges: {
        getAll: (params = {}) => apiClient.get('/transfer-exchanges', { params }),
        getById: (id) => apiClient.get(`/transfer-exchanges/${id}/`),
        create: (data) => apiClient.post('/transfer-exchanges/', data),
        update: (id, data) => apiClient.put(`/transfer-exchanges/${id}/`, data),
        delete: (id) => apiClient.delete(`/transfer-exchanges/${id}/`),
    },
    
    // Incoming Money
    incomingMoney: {
        getAll: (params = {}) => apiClient.get('/incoming-money', { params }),
        getById: (id) => apiClient.get(`/incoming-money/${id}/`),
        create: (data) => apiClient.post('/incoming-money/', data),
        update: (id, data) => apiClient.put(`/incoming-money/${id}/`, data),
        delete: (id) => apiClient.delete(`/incoming-money/${id}/`),
    },
    safePartnersApi:  {
        getAll: () => apiClient.get('/safe-partners'),
        getById: (id) => apiClient.get(`/safe-partners/${id}/`),
        create: (data) => apiClient.post('/safe-partners/', data),
        update: (id, data) => apiClient.put(`/safe-partners/${id}/`, data),
        delete: (id) => apiClient.delete(`/safe-partners/${id}/`),
    },
    
    // Outgoing Money
    outgoingMoney: {
        getAll: (params = {}) => apiClient.get('/outgoing-money', { params }),
        getById: (id) => apiClient.get(`/outgoing-money/${id}/`),
        create: (data) => apiClient.post('/outgoing-money/', data),
        update: (id, data) => apiClient.put(`/outgoing-money/${id}/`, data),
        delete: (id) => apiClient.delete(`/outgoing-money/${id}/`),
    },
    
    // Safe Transactions
    safeTransactions: {
        getAll: (params = {}) => apiClient.get('/safe-transactions', { params }),
        getById: (id) => apiClient.get(`/safe-transactions/${id}/`),
        create: (data) => apiClient.post('/safe-transactions/', data),
        update: (id, data) => apiClient.put(`/safe-transactions/${id}/`, data),
        delete: (id) => apiClient.delete(`/safe-transactions/${id}/`),
    },
    
    // Additional utility methods
    testConnection: async () => {
        try {
            const response = await apiClient.get('/safe-types');
            console.log('API Connection Successful:', response.status);
            return true;
        } catch (error) {
            console.error('API Connection Failed:', error);
            return false;
        }
    },
    
    // Add any custom endpoints or methods here
};

export default api;
// SafeTypes specific API calls
export const safeTypesApi = {
    getAll: () => apiClient.get('/safe-types'),
    getById: (id) => apiClient.get(`/safe-types/${id}/`),
    create: (data) => apiClient.post('/safe-types/', data),
    update: (id, data) => apiClient.put(`/safe-types/${id}/`, data),
    delete: (id) => apiClient.delete(`/safe-types/${id}/`),
};
export const safePartnersApi = {
  getAll: () => apiClient.get('/safe-partners'),
  getById: (id) => apiClient.get(`/safe-partners/${id}/`),
  create: (data) => apiClient.post('/safe-partners/', data),
  update: (id, data) => apiClient.put(`/safe-partners/${id}/`, data),
  delete: (id) => apiClient.delete(`/safe-partners/${id}/`),
};


// Optional: Add a test function to verify connection
export const testApiConnection = async () => {
    try {
        const response = await apiClient.get('/safe-types');
        console.log('API Connection Successful:', response.status);
        return true;
    } catch (error) {
        console.error('API Connection Failed:', error);
        return false;
    }
};