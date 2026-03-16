import axiosInstance from "./axiosInstance";

const branchService = {
  list: (params) => axiosInstance.get("/branches", { params }),
  create: (data) => axiosInstance.post("/branches", data),
  update: (id, data) => axiosInstance.put(`/branches/${id}`, data),
  remove: (id) => axiosInstance.delete(`/branches/${id}`),
  getListBranchWithClass: () =>
    axiosInstance.get("/branches/classes/with-classes"),
};

export default branchService;
