import axios from "axios";
import { domain } from "../Context/config";

const axiosInstance = axios.create({
  baseURL: "http://" + domain + ":8080", //base URL
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const setAccessToken = (token) => {
  localStorage.setItem("token", token);
};

const getAccessToken = () => {
  return localStorage.getItem("token");
};

const removeAccessToken = () => {
  localStorage.removeItem("token");
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

// Response interceptor for handling token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response) {
      // Handle token expiration and auto-refresh logic here
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Example of token refresh logic
          const newToken = await getNewToken();
          setAccessToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (error) {
          // Redirect to login page if refresh fails
          removeAccessToken();
          window.location.href = "/login";
          return Promise.reject(error);
        }
      }
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

const getNewToken = async () => {
  try {
    const storedToken = getAccessToken();
    const decodedToken = storedToken
      ? JSON.parse(atob(storedToken.split(".")[1]))
      : null;
    const username = decodedToken ? decodedToken.username : "";
    console.log("refreshToken: ", storedToken);
    // Example of how you might refresh the token
    const response = await axios.post("/refreshToken", {
      refreshToken: decodedToken.refreshToken,
      username: username,
    });

    return response.data.token; // Replace with the actual token received from refresh token endpoint
  } catch (error) {
    throw new Error("Failed to refresh token");
  }
};
export default {
  axiosInstance,
  getAccessToken,
  removeAccessToken,
  setAccessToken,
  setAuthHeader,
};
