import axiosInstance from "./axiosInstance";

const classService = {
  list: (params) => axiosInstance.get("/classes", { params }),
  detail: (id) => axiosInstance.get(`/classes/${id}`),
  create: (data) => axiosInstance.post("/classes", data),
  update: (id, data) => axiosInstance.put(`/classes/${id}`, data),
  remove: (id) => axiosInstance.delete(`/classes/${id}`),
  restore: (id) => axiosInstance.put(`/classes/${id}/restore`),
  forceRemove: (id) => axiosInstance.delete(`/classes/${id}/force`),
  trash: (params) => axiosInstance.get("/classes/trash", { params }),
};

export default classService;
