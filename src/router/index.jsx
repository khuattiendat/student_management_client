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
import ListBranch from "../pages/admin/branch/list";
import ListTeacher from "../pages/admin/teacher/list";
import ListClass from "../pages/admin/class/list";
import ListPackage from "../pages/admin/package/list";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PrivateRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          {
            path: "dashboard",
            element: <PrivateRoute allowedRoles={[ROLES.ADMIN]} />,
            children: [{ index: true, element: <Dashboard /> }],
          },
          {
            path: "branches",
            element: <PrivateRoute allowedRoles={[ROLES.ADMIN]} />,
            children: [{ index: true, element: <ListBranch /> }],
          },
          {
            path: "teachers",
            element: <PrivateRoute allowedRoles={[ROLES.ADMIN]} />,
            children: [{ index: true, element: <ListTeacher /> }],
          },
          {
            path: "classes",
            element: <PrivateRoute allowedRoles={[ROLES.ADMIN]} />,
            children: [{ index: true, element: <ListClass /> }],
          },
          {
            path: "packages",
            element: <PrivateRoute allowedRoles={[ROLES.ADMIN]} />,
            children: [{ index: true, element: <ListPackage /> }],
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
