import axiosInstance from "./axiosInstance";

const packageService = {
  list: (params) => axiosInstance.get("/packages", { params }),
  create: (data) => axiosInstance.post("/packages", data),
  update: (id, data) => axiosInstance.put(`/packages/${id}`, data),
  remove: (id) => axiosInstance.delete(`/packages/${id}`),
};

export default packageService;
