import axiosInstance from "./axiosInstance";

const teacherCodeService = {
  list: (params) => axiosInstance.get("/teacher-code", { params }),
  detail: (id) => axiosInstance.get(`/teacher-code/${id}`),
  create: (data) => axiosInstance.post("/teacher-code", data),
  update: (id, data) => axiosInstance.put(`/teacher-code/${id}`, data),
  remove: (id) => axiosInstance.delete(`/teacher-code/${id}`),
};

export default teacherCodeService;
