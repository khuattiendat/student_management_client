import axiosInstance from "./axiosInstance";

const studentService = {
  list: (params) => axiosInstance.get("/students", { params }),
  detail: (id) => axiosInstance.get(`/students/${id}`),
  create: (data) => axiosInstance.post("/students", data),
  update: (id, data) => axiosInstance.put(`/students/${id}`, data),
  renewCourse: (id, data) =>
    axiosInstance.post(`/students/${id}/renew-course`, data),
  attendances: (id, params) =>
    axiosInstance.get(`/students/${id}/attendances`, { params }),
  remove: (id) => axiosInstance.delete(`/students/${id}`),
};

export default studentService;
