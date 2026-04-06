import { useState, useEffect, useMemo } from "react";
import { Layout, Menu, Avatar, Popover, Space, Typography } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import { NuqsAdapter } from "nuqs/adapters/react-router";
import useSWR from "swr";
import useAuthStore from "../../store/authStore";
import useBranchStore from "../../store/branchStore";
import {
  buildSidebarMenuItems,
  buildSidebarMenuItemsTeacher,
} from "./menuConfig";
import { MdPassword } from "react-icons/md";
import authService from "../../services/authService";
import ModalChangePassword from "../../components/modal/ModalChangePassword";
import ModalInfo from "../../components/modal/ModalInfo";
import { ROLES } from "../../utils/constants";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [modalInfo, setModalInfo] = useState(false);
  const [modalChangePwd, setModalChangePwd] = useState(false);

  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.user?.role);
  const logout = useAuthStore((s) => s.logout);
  const setUser = useAuthStore((s) => s.setUser);
  const setBranches = useBranchStore((s) => s.setBranches);
  const clearBranches = useBranchStore((s) => s.clearBranches);

  const { data } = useSWR("admin-layout-data", async () => {
    const [profileData] = await Promise.all([authService.getProfile()]);
    return {
      profile: profileData?.data ?? null,
    };
  });

  useEffect(() => {
    if (data?.profile) {
      setUser(data.profile);
    }
    setBranches(data?.branches ?? []);
  }, [data, setUser, setBranches]);

  const sidebarMenuItems = useMemo(() => buildSidebarMenuItems(), []);
  const sidebarMenuItemsTeacher = useMemo(
    () => buildSidebarMenuItemsTeacher(),
    [],
  );
  const userMenuItems = [
    { key: "profile", icon: <UserOutlined />, label: "Hồ sơ" },
    { type: "divider" },
    { key: "reset-password", icon: <MdPassword />, label: "Đổi mật khẩu" },
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
      clearBranches();
      navigate("/login");
    }
    if (key === "profile") setModalInfo(true);
    if (key === "reset-password") setModalChangePwd(true);
  };

  return (
    <Layout className="min-h-screen bg-gray-100">
      <Header className="sticky top-0 z-[999] flex items-center gap-3 bg-[#001529] px-5 shadow-md justify-between">
        <div className="flex items-center gap-4 h-full">
          <div
            onClick={() => setCollapsed(!collapsed)}
            className="shrink-0 cursor-pointer text-lg text-white/75"
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
        </div>
        <div className="h-full relative py-1">
          <img
            src="/logo.png"
            alt=""
            className="bg-transparent w-full h-full object-contain rounded-xl"
          />
        </div>
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
          style={{
            position: "sticky",
            top: 64,
            height: "calc(100vh - 64px)",
            overflowY: "auto",
            zIndex: 10,
          }}
          className="transition-all left-0 pt-4 border-r border-gray-100 bg-white shadow-[2px_0_8px_rgba(0,0,0,0.04)]"
        >
          <Menu
            mode="inline"
            items={
              role == ROLES.ADMIN ? sidebarMenuItems : sidebarMenuItemsTeacher
            }
            onClick={({ key }) => navigate(key)}
            className="border-r-0 pt-2 select-none [&_.ant-menu-item]:!mx-2 [&_.ant-menu-item]:!my-1 [&_.ant-menu-item]:rounded-lg [&_.ant-menu-item]:transition-all [&_.ant-menu-item]:duration-200 [&_.ant-menu-item:hover]:!bg-blue-50 [&_.ant-menu-item-selected]:!bg-blue-100 [&_.ant-menu-item-selected]:!text-blue-600 [&_.ant-menu-divider]:!my-3"
          />
        </Sider>

        <Layout className="bg-gray-100 px-6 py-5">
          <Content className="min-h-[360px] rounded-lg bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <NuqsAdapter>
              <Outlet />
            </NuqsAdapter>
          </Content>
        </Layout>
      </Layout>
      <ModalChangePassword
        open={modalChangePwd}
        close={() => setModalChangePwd(false)}
      />
      <ModalInfo open={modalInfo} close={() => setModalInfo(false)} />
    </Layout>
  );
};

export default AdminLayout;
