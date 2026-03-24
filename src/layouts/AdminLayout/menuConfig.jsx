import {
  BankOutlined,
  TeamOutlined,
  DashboardFilled,
  ReadOutlined,
  BookOutlined,
  CalendarOutlined,
  UserOutlined,
  DeleteOutlined,
  InboxOutlined,
  CalendarFilled,
  KeyOutlined,
} from "@ant-design/icons";

export const buildSidebarMenuItems = () => [
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
    key: "/students",
    icon: <UserOutlined />,
    label: "Quản lý học viên",
  },
  {
    key: "/calendar",
    icon: <CalendarFilled />,
    label: "Quản lý lịch học",
  },
  {
    key: "/teacher-codes",
    icon: <KeyOutlined />,
    label: "Quản lý mã",
  },
  {
    key: "/trash",
    icon: <InboxOutlined color="red" />,
    label: "Thùng rác",
  },
];
export const buildSidebarMenuItemsTeacher = () => [
  {
    key: "/giao-vien/danh-sach-lop-hoc",
    icon: <ReadOutlined />,
    label: "Danh sách lớp học",
  },
  {
    key: "/giao-vien/lich-hoc",
    icon: <CalendarFilled />,
    label: "Quản lý lịch học",
  },
];
