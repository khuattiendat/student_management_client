import axiosInstance from "./axiosInstance";

const authService = {
  login: (credentials) => axiosInstance.post("/auth/login", credentials),

  logout: () => axiosInstance.post("/auth/logout"),

  getProfile: () => axiosInstance.get("/auth/profile"),

  refreshToken: (refreshToken) =>
    axiosInstance.post("/auth/refresh", { refreshToken }),
};

export default authService;
