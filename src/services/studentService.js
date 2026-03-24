import axiosInstance from "./axiosInstance";

const studentService = {
  list: (params) => axiosInstance.get("/students", { params }),
  byEnrollments: ({ branchId, packageIds, search }) => {
    const query = new URLSearchParams();

    if (branchId !== undefined && branchId !== null && branchId !== "") {
      query.append("branchId", String(branchId));
    }

    const normalizedPackageIds = Array.isArray(packageIds)
      ? packageIds
      : packageIds !== undefined && packageIds !== null && packageIds !== ""
        ? [packageIds]
        : [];

    normalizedPackageIds.forEach((id) => {
      query.append("packageIds", String(id));
    });

    if (search) {
      query.append("search", String(search));
    }

    return axiosInstance.get(`/students/by-enrollments?${query.toString()}`);
  },
  detail: (id) => axiosInstance.get(`/students/${id}`),
  create: (data) => axiosInstance.post("/students", data),
  update: (id, data) => axiosInstance.put(`/students/${id}`, data),
  renewCourse: (id, data) =>
    axiosInstance.post(`/students/${id}/renew-course`, data),
  attendances: (id, params) =>
    axiosInstance.get(`/students/${id}/attendances`, { params }),
  remove: (id) => axiosInstance.delete(`/students/${id}`),
  restore: (id) => axiosInstance.put(`/students/${id}/restore`),
  forceRemove: (id) => axiosInstance.delete(`/students/${id}/force`),
  trash: (params) => axiosInstance.get("/students/trash", { params }),
};

export default studentService;
