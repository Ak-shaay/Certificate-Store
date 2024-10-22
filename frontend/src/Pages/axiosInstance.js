import axios from "axios";
import { domain } from "../Context/config";

const baseURL = `http://${domain}:8080`;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include credentials (like cookies) with requests
});

const setAccessToken = (token) => {
  localStorage.setItem("token", token);
};

const setRefreshToken = (token) => {
  localStorage.setItem("refreshToken", token);
};

const getAccessToken = () => {
  return localStorage.getItem("token");
};

const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};

const removeTokens = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};

const setAuthHeader = (accessToken) => {
  axiosInstance.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${accessToken}`;
};

// Request interceptor for adding JWT token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh and other global responses
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.log("Inside axios Interceptor: ", error);
    const originalRequest = error.config;

    // Handle token expiration and auto-refresh logic here
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const { newToken, refreshToken } = await getNewToken();
        console.log("Token refresh", refreshToken);
        setAccessToken(newToken);
        setRefreshToken(refreshToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (error) {
        removeTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    } else if (error.response.status === 403) {
      removeTokens();
      // sessionTimeout();
      window.location.href = "/login";
    } else if (error.request) {
      // Network error (no response was received)
      console.error("Network error:", error.request);
    } else {
      // Other errors
      console.error("Error:", error.message);
    }

    return Promise.reject(error);
  }
);
// let alertTimeout;

// const sessionTimeout = () => {
//   clearTimeout(alertTimeout); // Clear any existing timeout
//   alertTimeout = setTimeout(() => {
//     // alert("Session Timed Out!!! Login to continue");
//     window.location.href = "/login";
//   }, 100);
// };
const getNewToken = async () => {
  try {
    const storedToken = getRefreshToken();
    const decodedToken = storedToken
      ? JSON.parse(atob(storedToken.split(".")[1]))
      : null;
    const username = decodedToken ? decodedToken.username : "";

    // Example of how you might refresh the token
    const response = await axios.post(`${baseURL}/refreshToken`, {
      refreshToken: decodedToken.refreshToken,
      username: username,
    });

    return response.data.token; // Replace with the actual token received from refresh token endpoint
  } catch (error) {
    throw new Error("Failed to refresh token: ", error);
  }
};

export default {
  axiosInstance,
  getAccessToken,
  getRefreshToken,
  removeTokens,
  setAccessToken,
  setRefreshToken,
  setAuthHeader,
};
