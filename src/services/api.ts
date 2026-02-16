
import axios from 'axios';

// Create axios instance pointing to our local backend
const api = axios.create({
    baseURL: 'http://localhost:3001/api', // Local backend URL
    timeout: 10000,
});

export const birthdayService = {
    getAll: async () => {
        const response = await api.get('/birthdays');
        return response.data;
    },
    save: async (data: any[]) => {
        const response = await api.post('/birthdays', data);
        return response.data;
    },
};

export const salesService = {
    getAll: async () => {
        const response = await api.get('/sales');
        return response.data;
    },
    save: async (data: any[]) => {
        const response = await api.post('/sales', data);
        return response.data;
    },
};

export default api;
