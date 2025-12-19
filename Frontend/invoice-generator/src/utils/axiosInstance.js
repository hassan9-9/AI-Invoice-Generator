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
    console.log(
      "🚀 API Request to:",
      config.url,
      "Token exists:",
      !!accessToken
    );
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// // Response Interceptor
// axiosInstance.interceptors.response.use(
//     (response) => {
//         return response;
//     },
//     (error) => {
//         // Handle common errors globally
//         if (error.response) {
//             if (error.response.status === 500) {
//                 console.error("Server Error. Please try again later.");
//             }
//             // else if (error.response.status === 401) {
//             //     console.error("Unauthorized. Please login again.");
//             //     // Optional: Redirect to login page or refresh token
//             //     localStorage.removeItem("token");
//             //     window.location.href = "/login";
//             // }
//             else if (error.response.status === 404) {
//                 console.error("Resource not found.");
//             } else if (error.response.status === 400) {
//                 console.error("Bad request. Please check your input.");
//             }
//         } else if (error.code === "ECONNABORTED") {
//             console.error("Request timeout. Please try again.");
//         } else if (error.request) {
//             console.error("Network error. Please check your connection.");
//         } else {
//             console.error("An unexpected error occurred.");
//         }
//         return Promise.reject(error);
//     }
// );

// // Response Interceptor - FIXED VERSION
// axiosInstance.interceptors.response.use(
//     (response) => {
//         return response;
//     },
//     (error) => {
//         // Handle common errors globally
//         if (error.response) {
//             if (error.response.status === 500) {
//                 console.error("Server Error. Please try again later.");
//             } else if (error.response.status === 401) {
//                 console.error("Unauthorized. Please login again.");

//                 // Only logout if we have a token (meaning it expired/was invalid)
//                 const currentToken = localStorage.getItem("token");
//                 if (currentToken) {
//                     console.log("Token exists but request returned 401. Logging out...");
//                     localStorage.removeItem("token");
//                     // Use setTimeout to avoid React state updates during render
//                     setTimeout(() => {
//                         window.location.href = "/login";
//                     }, 0);
//                 }
//                 // If no token, don't redirect - let the component handle it
//             } else if (error.response.status === 404) {
//                 console.error("Resource not found.");
//             } else if (error.response.status === 400) {
//                 console.error("Bad request. Please check your input.");
//             }
//         } else if (error.code === "ECONNABORTED") {
//             console.error("Request timeout. Please try again.");
//         } else if (error.request) {
//             console.error("Network error. Please check your connection.");
//         } else {
//             console.error("An unexpected error occurred.");
//         }
//         return Promise.reject(error);
//     }
// );

// Response Interceptor - FINAL VERSION

// Response Interceptor - FIXED VERSION
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const currentToken = localStorage.getItem("token");
      console.log(
        "🔐 401 Interceptor - Token exists:",
        !!currentToken,
        "URL:",
        error.config.url
      );

      // Don't auto-logout - let the AuthContext handle it
      console.log("🔐 401 detected - rejecting error for component handling");
      return Promise.reject(error);
    }

    // Handle other errors
    if (error.response) {
      switch (error.response.status) {
        case 500:
          console.error("Server Error. Please try again later.");
          break;
        case 404:
          console.error("Resource not found.");
          break;
        case 400:
          console.error("Bad request. Please check your input.");
          break;
        default:
          break;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
