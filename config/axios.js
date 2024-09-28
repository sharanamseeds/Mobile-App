import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_BASE_URL } from "./setting";
import i18n from "../i18n";

axios.defaults.baseURL = APP_BASE_URL;

// Function to refresh the token
const refreshToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem("refresh_token"); // Get the refresh token from storage
    const response = await axios.post(`/auth/refresh_token`, { refreshToken: refreshToken }, {headers: {}}); // Replace with your refresh endpoint
    const newAccessToken = response.data?.payload.accessToken;
    
    // Save the new access token
    await AsyncStorage.setItem("token", newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    throw error;
  }
};

axios.interceptors.request.use(
  async function (response) {
    if (response) {
      if (response.data?.payload && res.data.payload?.result?.token) {
        // append your request headers with an authenticated token
        response.headers["Authorization"] = `Bearer ${res.data.payload?.result?.token}`;
        response.headers["Content-Type"] = 'multipart/form-data'
      }
    }
    if (await AsyncStorage.getItem("token")) {
      const token = await AsyncStorage.getItem("token");
      // append your request headers with an authenticated token
      response.headers["Authorization"] = `Bearer ${token}`;
      response.headers["Content-Type"] = 'multipart/form-data'
    }
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh logic
axios.interceptors.response.use(
  (response) => {
    // Return the response if it's successful
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is a 401 and the request is not already retried
    if (error.response && error.response.status === 401 && !originalRequest._retry || error.response && error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried

      try {
        const newAccessToken = await refreshToken();
        axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        axios.defaults.headers.common["Content-Type"] = 'multipart/form-data'
        originalRequest.headers["Content-Type"] = 'multipart/form-data'

        // Retry the original request with the new token
        return axios(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh token and retry request:", refreshError);
        // Optionally, handle logout or redirect to login screen
        return Promise.reject(refreshError);
      }
    }

    // If the error is not a 401 or token refresh failed, reject the promise
    return Promise.reject(error);
  }
);

export default axios;
