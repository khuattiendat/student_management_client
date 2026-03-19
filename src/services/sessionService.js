import axiosInstance from "./axiosInstance";

const sessionService = {
  list: (params) => axiosInstance.get("/sessions", { params }),
  detail: (id) => axiosInstance.get(`/sessions/${id}`),
  create: (data) => axiosInstance.post("/sessions", data),
  update: (id, data) => axiosInstance.put(`/sessions/${id}`, data),
  remove: (id) => axiosInstance.delete(`/sessions/${id}`),
  takeAttendance: (id, data) =>
    axiosInstance.post(`/sessions/${id}/attendance`, data),
  getAttendance: (id) => axiosInstance.get(`/sessions/${id}/attendance`),
  updateAttendance: (id, data) =>
    axiosInstance.put(`/sessions/${id}/attendance`, data),
  importExcel: (formData) =>
    axiosInstance.post("/sessions/import-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

export default sessionService;
