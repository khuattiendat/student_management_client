import axiosInstance from "./axiosInstance";

const teacherService = {
  list: (params) =>
    axiosInstance.get("/users", {
      params: {
        ...params,
        role: "teacher",
      },
    }),

  create: (data) =>
    axiosInstance.post("/users", {
      ...data,
      role: "teacher",
    }),

  update: (id, data) =>
    axiosInstance.put(`/users/${id}`, {
      ...data,
      role: "teacher",
    }),

  remove: (id) => axiosInstance.delete(`/users/${id}`),
};

export default teacherService;
