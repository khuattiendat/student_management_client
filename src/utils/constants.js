export const ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
  RECEPTIONIST: "receptionist",
};

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:1401/api";
