import {
  BankOutlined,
  TeamOutlined,
  DashboardFilled,
  ReadOutlined,
  BookOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

export const buildSidebarMenuItems = (branches = []) => [
  {
    key: "/dashboard",
    icon: <DashboardFilled />,
    label: "Tổng quan hệ thống",
  },
  {
    key: "/branches",
    icon: <BankOutlined />,
    label: "Quản lý cơ sở",
  },
  {
    key: "/teachers",
    icon: <TeamOutlined />,
    label: "Quản lý giáo viên",
  },
  {
    key: "/classes",
    icon: <ReadOutlined />,
    label: "Quản lý lớp học",
  },
  {
    key: "/packages",
    icon: <BookOutlined />,
    label: "Quản lý gói học",
  },
  {
    key: "sessions-group",
    icon: <CalendarOutlined />,
    label: "Quản lý lịch học",
    children: (branches ?? []).map((branch) => ({
      key: `sessions-branch-${branch.id}`,
      label: branch.name,
      children: (branch.classes ?? []).map((classItem) => ({
        key: `/sessions/${classItem.id}`,
        label: classItem.name,
      })),
    })),
  },
];
