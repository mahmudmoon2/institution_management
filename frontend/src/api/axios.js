import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Request Interceptor (টোকেন পাঠানোর জন্য)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- নতুন: Response Interceptor (401 এরর হ্যান্ডেল করার জন্য) ---
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // টোকেন এক্সপায়ার হলে ক্লিয়ার করে লগইন পেজে পাঠিয়ে দেবে
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_role');
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;