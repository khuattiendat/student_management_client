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
  toggleIsCalled: (id, isCalled) =>
    axiosInstance.put(`/students/${id}/is-called`, { isCalled }),
  toggleIsTexted: (id, isTexted) =>
    axiosInstance.put(`/students/${id}/is-texted`, { isTexted }),
  updateCycleStartDate: (id, cycleStartDate) =>
    axiosInstance.put(`/students/${id}/cycle-start-date`, { cycleStartDate }),
  getCycles: (params) => {
    const { classId, studentIds } = params;
    const query = new URLSearchParams();
    if (classId !== undefined && classId !== null && classId !== "") {
      query.append("classId", String(classId));
    }

    const normalizedPackageIds = Array.isArray(studentIds)
      ? studentIds
      : studentIds !== undefined && studentIds !== null && studentIds !== ""
        ? [studentIds]
        : [];

    normalizedPackageIds.forEach((id) => {
      query.append("studentIds", String(id));
    });

    return axiosInstance.get(`/students/cycles?${query.toString()}`);
  },
};

export default studentService;
