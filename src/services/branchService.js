import axiosInstance from "./axiosInstance";

const branchService = {
  list: (params) => axiosInstance.get("/branches", { params }),
  create: (data) => axiosInstance.post("/branches", data),
  update: (id, data) => axiosInstance.put(`/branches/${id}`, data),
  remove: (id) => axiosInstance.delete(`/branches/${id}`),
  restore: (id) => axiosInstance.put(`/branches/${id}/restore`),
  forceRemove: (id) => axiosInstance.delete(`/branches/${id}/force`),
  trash: (params) => axiosInstance.get("/branches/trash", { params }),
};

export default branchService;
