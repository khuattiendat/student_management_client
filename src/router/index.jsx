import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AuthLayout from "../layouts/AuthLayout";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/admin/Dashboard";
import Forbidden from "../pages/Forbidden";
import NotFound from "../pages/NotFound";
import { ROLES } from "../utils/constants";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PrivateRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          {
            path: "admin",
            element: <PrivateRoute allowedRoles={[ROLES.ADMIN]} />,
            children: [{ index: true, element: <Dashboard /> }],
          },
          {
            path: "students",
            element: (
              <PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.TEACHER]} />
            ),
            children: [{ index: true, element: <Dashboard /> }],
          },
        ],
      },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: "login", element: <Login /> }],
      },
    ],
  },
  { path: "/forbidden", element: <Forbidden /> },
  { path: "*", element: <NotFound /> },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
