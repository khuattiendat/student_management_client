import {
  Avatar,
  Button,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { DeleteOutlined, EditOutlined, UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { PiPasswordThin } from "react-icons/pi";

const { Text } = Typography;

const statusColors = {
  active: "green",
  inactive: "red",
};
const statusLabels = {
  active: "Hoạt động",
  inactive: "Ngừng hoạt động",
};

export const buildColumns = ({
  page,
  limit,
  onEdit,
  onDelete,
  onResetPassword,
}) => [
  {
    title: "STT",
    width: 60,
    align: "center",
    render: (_, __, index) => (page - 1) * limit + index + 1,
  },
  {
    title: "Họ tên",
    dataIndex: "name",
    key: "name",
    render: (_, record) => (
      <Space size="middle">
        <div className="flex flex-col">
          <Text strong>{record.name}</Text>
        </div>
      </Space>
    ),
  },
  {
    title: "Tên đăng nhập",
    dataIndex: "userName",
    key: "userName",
    responsive: ["lg"],
  },
  {
    title: "Loại nhân sự",
    dataIndex: "role",
    key: "role",
    render: (role) => {
      const roleLabels = {
        teacher: "Giáo viên",
        receptionist: "Nhân viên lễ tân",
      };
      const statusColors = {
        teacher: "blue",
        receptionist: "orange",
      };
      return <Tag color={statusColors[role]}>{roleLabels[role] || "—"}</Tag>;
    },
  },
  {
    title: "Số điện thoại",
    dataIndex: "phone",
    key: "phone",
    render: (value) => value || "—",
  },
  {
    title: "Cơ sở",
    dataIndex: "branches",
    key: "branches",
    render: (branches = []) =>
      branches.length ? (
        <div className="flex flex-wrap gap-1">
          {branches.map((branch) => (
            <Tag key={branch.id} className="rounded-full px-2 py-1">
              {branch.name}
            </Tag>
          ))}
        </div>
      ) : (
        "—"
      ),
  },
  {
    title: "Lớp",
    dataIndex: "classes",
    key: "classes",
    width: 200,
    render: (classes = []) =>
      classes.length ? (
        <div className="flex flex-wrap gap-1">
          {classes.map((classItem) => (
            <Link to={`/sessions/${classItem.id}`} key={classItem.id}>
              <Tag
                key={classItem.id}
                className="rounded-full px-2 py-1 hover:bg-blue-100! hover:text-blue-600! transition"
              >
                {classItem.name}
              </Tag>
            </Link>
          ))}
        </div>
      ) : (
        "—"
      ),
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status) => (
      <Tag color={statusColors[status] ?? "default"}>
        {statusLabels[status] || "—"}
      </Tag>
    ),
  },
  {
    title: "Ngày tạo",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (value) => new Date(value).toLocaleDateString("vi-VN"),
  },
  {
    title: "Hành động",
    key: "action",
    width: 120,
    align: "center",
    render: (_, record) => (
      <Space>
        <Tooltip title="Chỉnh sửa">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
        </Tooltip>
        <Popconfirm
          title="Xác nhận xóa"
          description={`Bạn có chắc muốn xóa giáo viên "${record.name}"?`}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          onConfirm={() => onDelete(record.id)}
        >
          <Tooltip title="Xóa">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
        <Tooltip title="Đặt lại mật khẩu">
          <Button
            type="text"
            icon={<PiPasswordThin />}
            onClick={() => onResetPassword(record)}
          />
        </Tooltip>
      </Space>
    ),
  },
];
