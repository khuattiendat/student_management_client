import { Button, Popconfirm, Space, Tag } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

const statusColors = {
  active: "green",
  inactive: "red",
};

const statusLabels = {
  active: "Hoạt động",
  inactive: "Ngừng hoạt động",
  completed: "Đã hoàn thành",
};

const typeColors = {
  general: "purple",
  certificate: "blue",
  school_subject: "gold",
};

const typeLabels = {
  general: "Phổ thông",
  certificate: "Chứng chỉ",
  school_subject: "Các môn trên trường",
};

export const buildColumns = ({
  page,
  limit,
  onEdit,
  onDelete,
  onViewPackages,
  canManage,
}) => [
  {
    title: "STT",
    width: 60,
    align: "center",
    render: (_, __, index) => (page - 1) * limit + index + 1,
  },
  {
    title: "Tên lớp",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Cơ sở",
    dataIndex: "branch",
    key: "branch",
    render: (branch) => branch?.name || "—",
  },
  {
    title: "Giáo viên",
    dataIndex: "teacher",
    key: "teacher",
    render: (teacher) => teacher?.name || "—",
  },
  {
    title: "Gói học",
    dataIndex: "packages",
    key: "packages",
    render: (packages = [], record) => {
      if (canManage) {
        const totalPackages = Array.isArray(packages) ? packages.length : 0;

        if (totalPackages === 0) {
          return "—";
        }

        return (
          <Button
            type="link"
            className="p-0"
            onClick={() => onViewPackages(record)}
          >
            {totalPackages} gói
          </Button>
        );
      } else {
        return "—";
      }
    },
  },
  {
    title: "Loại",
    dataIndex: "type",
    key: "type",
    render: (type) => (
      <Tag color={typeColors[type] ?? "default"}>{typeLabels[type] || "—"}</Tag>
    ),
  },
  {
    title: "Ngày khai giảng",
    dataIndex: "startDate",
    key: "startDate",
    render: (value) => (value ? dayjs(value).format("DD/MM/YYYY") : "—"),
  },
  {
    title: "Sĩ số",
    dataIndex: "students",
    key: "students",
    render: (students = []) => students.length,
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
    render: (val) => new Date(val).toLocaleDateString("vi-VN"),
  },
  {
    title: "Hành động",
    key: "action",
    width: 120,
    align: "center",
    render: (_, record) =>
      canManage ? (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
          <Popconfirm
            title="Xác nhận xóa"
            description={`Bạn có chắc muốn xóa lớp "${record.name}"?`}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
          <Button type="link">
            <Link to={`/sessions/${record.id}`}>Điểm danh</Link>
          </Button>
        </Space>
      ) : (
        <Button type="link">
          <Link to={`/sessions/${record.id}`}>Điểm danh</Link>
        </Button>
      ),
  },
];
