import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import useAuthStore from "../store/authStore";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken, setTokens } = useAuthStore.getState();
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {
            refreshToken,
          },
        );

        setTokens(
          data.data?.accessToken ?? data.accessToken,
          data.data?.refreshToken ?? data.refreshToken,
        );

        originalRequest.headers.Authorization = `Bearer ${
          data.data?.accessToken ?? data.accessToken
        }`;
        return axiosInstance(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        window.location.replace("/login");
        return Promise.reject(error);
      }
    }

    return Promise.reject(error?.response?.data || error);
  },
);

export default axiosInstance;
