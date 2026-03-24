import axiosInstance from "./axiosInstance";

const sessionService = {
  list: (params) => axiosInstance.get("/sessions", { params }),
  calendar: (params) => axiosInstance.get("/sessions/calendar", { params }),
  detail: (id) => axiosInstance.get(`/sessions/${id}`),
  create: (data) => axiosInstance.post("/sessions", data),
  update: (id, data) => axiosInstance.put(`/sessions/${id}`, data),
  remove: ({ id, params }) =>
    axiosInstance.delete(`/sessions/${id}`, { params }),
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
