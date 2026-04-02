import axiosInstance from "./axiosInstance";

const authService = {
  login: (credentials) => axiosInstance.post("/auth/login", credentials),

  logout: () => axiosInstance.post("/auth/logout"),

  getProfile: () => axiosInstance.get("/auth/profile"),

  updateProfile: (data) => axiosInstance.put("/auth/update-profile", data),

  refreshToken: (refreshToken) =>
    axiosInstance.post("/auth/refresh", { refreshToken }),

  changePassword: (data) => axiosInstance.post("/auth/change-password", data),
  changePasswordAdmin: (data) =>
    axiosInstance.put("/auth/admin/change-password", data),
  register: (data) => axiosInstance.post("/auth/register", data),
};

export default authService;
