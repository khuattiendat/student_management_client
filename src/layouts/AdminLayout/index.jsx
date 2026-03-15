import { useState, useMemo } from "react";
import {
  Layout,
  Menu,
  Breadcrumb,
  Avatar,
  Popover,
  Space,
  Typography,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { headerNavItems, sidebarMenuItems } from "./menuConfig";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const buildBreadcrumbs = (pathname) => {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs = [{ title: <Link to="/">Home</Link> }];
  let accPath = "";

  parts.forEach((part, i) => {
    accPath += `/${part}`;
    const label = part.charAt(0).toUpperCase() + part.slice(1);
    if (i === parts.length - 1) {
      crumbs.push({ title: label });
    } else {
      crumbs.push({ title: <Link to={accPath}>{label}</Link> });
    }
  });

  return crumbs;
};

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedHeaderKey, setSelectedHeaderKey] = useState("nav2");

  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const selectedSideKeys = useMemo(
    () => [location.pathname],
    [location.pathname],
  );

  const defaultOpenKeys = useMemo(() => {
    const found = sidebarMenuItems.find((group) =>
      group.children?.some((child) => child.key === location.pathname),
    );
    return found ? [found.key] : ["subnav1"];
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const breadcrumbItems = useMemo(
    () => buildBreadcrumbs(location.pathname),
    [location.pathname],
  );

  const userMenuItems = [
    { key: "profile", icon: <UserOutlined />, label: "Hồ sơ" },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
    },
  ];

  const handleUserMenu = ({ key }) => {
    if (key === "logout") {
      logout();
      navigate("/login");
    }
    if (key === "profile") navigate("/profile");
    if (key === "settings") navigate("/settings");
  };

  return (
    <Layout className="min-h-screen bg-gray-100">
      <Header className="sticky top-0 z-[999] flex items-center gap-3 bg-[#001529] px-5 shadow-md">
        <div
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0 cursor-pointer text-lg text-white/75"
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>

        <div className="flex h-9 w-[120px] shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/10">
          <Text strong className="text-xs tracking-wide !text-white uppercase">
            {user?.role}
          </Text>
        </div>

        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedHeaderKey]}
          items={headerNavItems}
          onSelect={({ key }) => setSelectedHeaderKey(key)}
          className="min-w-0 flex-1 border-b-0 bg-transparent"
        />

        <Popover
          trigger="click"
          content={
            <Menu
              items={userMenuItems}
              onClick={handleUserMenu}
              selectable={false}
              className="min-w-[160px]"
            />
          }
        >
          <Space className="cursor-pointer">
            <Avatar size="small" icon={<UserOutlined />} />
            <Text className="!text-[13px] !text-white/85 uppercase">
              {user?.name || "Admin"}
            </Text>
          </Space>
        </Popover>
      </Header>

      <Layout className="bg-gray-100">
        <Sider
          collapsed={collapsed}
          collapsedWidth={64}
          width={220}
          className="sticky left-0 top-16 h-[calc(100vh-64px)] overflow-auto border-r border-gray-100 bg-white shadow-[2px_0_8px_rgba(0,0,0,0.04)]"
        >
          <Menu
            mode="inline"
            selectedKeys={selectedSideKeys}
            defaultOpenKeys={defaultOpenKeys}
            items={sidebarMenuItems}
            onClick={({ key }) => navigate(key)}
            className="border-r-0 pt-2"
          />
        </Sider>

        <Layout className="bg-gray-100 px-6 py-5">
          <Breadcrumb items={breadcrumbItems} className="mb-4" />
          <Content className="min-h-[360px] rounded-lg bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
