import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { ROLES } from "../utils/constants";

const PrivateRoute = ({ allowedRoles }) => {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);
  const userRole = useAuthStore((s) => s.user?.role);

  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
    return <Navigate to="/forbidden" replace />;
  }

  if (
    userRole === ROLES.TEACHER &&
    location.pathname === "/" &&
    location.pathname !== "giao-vien/danh-sach-lop-hoc"
  ) {
    return <Navigate to="/giao-vien/danh-sach-lop-hoc" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
