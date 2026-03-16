import axiosInstance from "./axiosInstance";

const classService = {
  list: (params) => axiosInstance.get("/classes", { params }),
  create: (data) => axiosInstance.post("/classes", data),
  update: (id, data) => axiosInstance.put(`/classes/${id}`, data),
  remove: (id) => axiosInstance.delete(`/classes/${id}`),
};

export default classService;
