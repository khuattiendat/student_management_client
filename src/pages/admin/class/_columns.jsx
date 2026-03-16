import { Button, Popconfirm, Space, Tag } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

const statusColors = {
  active: "green",
  inactive: "red",
};

const statusLabels = {
  active: "Hoạt động",
  inactive: "Ngừng hoạt động",
};

export const buildColumns = ({ page, limit, onEdit, onDelete }) => [
  {
    title: "ID",
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
    render: (_, record) => (
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
      </Space>
    ),
  },
];
