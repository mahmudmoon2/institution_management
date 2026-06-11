import { create } from 'zustand';
import api from '../api/axios';

export const useAuthStore = create((set) => ({
    token: localStorage.getItem('access_token') || null,
    userRole: localStorage.getItem('user_role') || null,
    isLoading: false,
    error: null,
    
    login: async (username, password, role) => {
        set({ isLoading: true, error: null });
        try {
            // Django SimpleJWT ডিফল্টভাবে 'username' এবং 'password' রিসিভ করে
            const response = await api.post('/login/', { username, password });
            const { access, refresh } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            localStorage.setItem('user_role', role);

            set({ token: access, userRole: role, isLoading: false });
            return true;
        } catch (error) {
            set({ 
                error: error.response?.data?.detail || 'Invalid credentials. Please try again.',
                isLoading: false 
            });
            return false;
        }
    },
    
    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        set({ token: null, userRole: null });
    }
}));