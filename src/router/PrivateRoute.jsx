import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";

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

  return <Outlet />;
};

export default PrivateRoute;
