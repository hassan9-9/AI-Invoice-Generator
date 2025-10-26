import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 80000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle common errors globally
        if (error.response) {
            if (error.response.status === 500) {
                console.error("Server Error. Please try again later.");
            } else if (error.response.status === 401) {
                console.error("Unauthorized. Please login again.");
                // Optional: Redirect to login page or refresh token
                localStorage.removeItem("token");
                window.location.href = "/login";
            } else if (error.response.status === 404) {
                console.error("Resource not found.");
            } else if (error.response.status === 400) {
                console.error("Bad request. Please check your input.");
            }
        } else if (error.code === "ECONNABORTED") {
            console.error("Request timeout. Please try again.");
        } else if (error.request) {
            console.error("Network error. Please check your connection.");
        } else {
            console.error("An unexpected error occurred.");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;