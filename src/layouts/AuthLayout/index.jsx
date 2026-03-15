import { Outlet } from "react-router-dom";
import { Layout } from "antd";

const AuthLayout = () => (
  <Layout className="min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600">
    <Layout.Content className="flex min-h-screen flex-col items-center justify-center p-6">
      <Outlet />
    </Layout.Content>
  </Layout>
);

export default AuthLayout;
