
import axios from "axios";
import { authRepository } from "./authRepository";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://e-commerce-backend-2-h21c.onrender.com",
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("jwt");

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest) {
            
            if (!originalRequest._retry) {
                originalRequest._retry = true;

                authRepository.logout();
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
