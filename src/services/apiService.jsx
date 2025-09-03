// src/services/apiService.js
import axios from 'axios';

// Configure Axios defaults
// axios.defaults.baseURL = 'https://brwa-exchange.com/api';
// for local:
axios.defaults.baseURL = 'http://127.0.0.1:8000/api';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.timeout = 30000; // 30 second timeout
axios.defaults.withCredentials = true;

// Create an Axios instance with custom config
const apiClient = axios.create({
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    },
});

// Request interceptor for Safari compatibility
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add timestamp to prevent caching issues in Safari
        if (config.method === 'get') {
            config.params = {
                ...config.params,
                _t: Date.now()
            };
        }

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);
// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refresh = localStorage.getItem("refresh");
                // const res = await axios.post("https://brwa-exchange.com/api/token/refresh/", { refresh });
                const res = await axios.post("http://127.0.0.1:8000/api/token/refresh/", { refresh });

                localStorage.setItem("access", res.data.access);
                apiClient.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;

                return apiClient(originalRequest); // ✅ retry with new token
            } catch {
                localStorage.clear();
                window.location.href = "/login";
            }
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
    token: {
        post: (data) => apiClient.post('/token/', data),
        postrefresh: (data) => apiClient.post(`/token/refresh`, data),
    },

    // Partners
    partners: {
        getAll: (params = {}) => apiClient.get('/partners', { params }),
        getById: (id) => apiClient.get(`/partners/${id}/`),
        getReport: (id) => apiClient.get(`/partners/${id}/report/`),
        create: (data) => apiClient.post('/partners/', data),
        update: (id, data) => apiClient.put(`/partners/${id}/`, data),
        delete: (id) => apiClient.delete(`/partners/${id}/`),
    },

    // Crypto Transactions
    cryptoTransactions: {
        getAll: (params = {}) => apiClient.get('/crypto-transactions/', { params }),
        getById: (id) => apiClient.get(`/crypto-transactions/${id}/`),
        create: (data) => apiClient.post('/crypto-transactions/', data),
        update: (id, data) => apiClient.put(`/crypto-transactions/${id}/`, data),
        delete: (id) => apiClient.delete(`/crypto-transactions/${id}/`),
    },
    debt: {
        getAll: (params = {}) => apiClient.get('/debts/', { params }),
        getById: (id) => apiClient.get(`/debts/${id}/`),
        create: (data) => apiClient.post('/debts/', data),
        update: (id, data) => apiClient.put(`/debts/${id}/`, data),
        delete: (id) => apiClient.delete(`/debts/${id}/`),
    },
    debtrepayment: {
        getAll: (params = {}) => apiClient.get('/debt-repayments/', { params }),
        getById: (id) => apiClient.get(`/debt-repayments/${id}/`),
        create: (data) => apiClient.post('/debt-repayments/', data),
        update: (id, data) => apiClient.put(`/debt-repayments/${id}/`, data),
        delete: (id) => apiClient.delete(`/debt-repayments/${id}/`),
    },

    // Transfer Exchanges
    transferExchanges: {
        getAll: (params = {}) => apiClient.get('/transfer-exchanges', { params }),
        getById: (id) => apiClient.get(`/transfer-exchanges/${id}/`),
        create: (data) => apiClient.post('/transfer-exchanges/', data),
        update: (id, data) => apiClient.put(`/transfer-exchanges/${id}/`, data),
        delete: (id) => apiClient.delete(`/transfer-exchanges/${id}/`),
    },
    bonuses: {
        getDaily: () => apiClient.get('/bonuses/today/'),
        getMonthly: () => apiClient.get('/bonuses/month/'),
        // Add more bonus-related endpoints as needed
    },

    // Incoming Money
    incomingMoney: {
        getAll: (params = {}) => apiClient.get('/incoming-money', { params }),
        getById: (id) => apiClient.get(`/incoming-money/${id}/`),
        create: (data) => apiClient.post('/incoming-money/', data),
        update: (id, data) => apiClient.put(`/incoming-money/${id}/`, data),
        delete: (id) => apiClient.delete(`/incoming-money/${id}/`),
    },
    safePartnersApi: {
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