import {
  UserOutlined,
  DesktopOutlined,
  NotificationOutlined,
} from "@ant-design/icons";

export const headerNavItems = [
  { key: "nav1", label: "nav 1" },
  { key: "nav2", label: "nav 2" },
  { key: "nav3", label: "nav 3" },
];

export const sidebarMenuItems = [
  {
    key: "subnav1",
    icon: <UserOutlined />,
    label: "subnav 1",
    children: [
      { key: "/dashboard", label: "option1" },
      { key: "/students", label: "option2" },
      { key: "/courses", label: "option3" },
      { key: "/grades", label: "option4" },
    ],
  },
  {
    key: "subnav2",
    icon: <DesktopOutlined />,
    label: "subnav 2",
    children: [
      { key: "/classrooms", label: "option5" },
      { key: "/schedules", label: "option6" },
    ],
  },
  {
    key: "subnav3",
    icon: <NotificationOutlined />,
    label: "subnav 3",
    children: [
      { key: "/notifications", label: "option7" },
      { key: "/reports", label: "option8" },
    ],
  },
];
