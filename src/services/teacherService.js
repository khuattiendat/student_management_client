import axiosInstance from "./axiosInstance";

const teacherService = {
  list: (params) => axiosInstance.get("/users", { params }),

  create: (data) => axiosInstance.post("/users", data),

  update: (id, data) => axiosInstance.put(`/users/${id}`, data),

  remove: (id) => axiosInstance.delete(`/users/${id}`),
};

export default teacherService;
