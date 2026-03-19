import { Button, Popconfirm, Space, Tag } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

const typeColors = {
  certificate: "blue",
  general: "purple",
};

const typeLabels = {
  certificate: "Gói chứng chỉ",
  general: "Gói phổ thông",
};

const formatPrice = (value) =>
  Number(value).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export const buildColumns = ({ page, limit, onEdit, onDelete }) => [
  {
    title: "STT",
    width: 60,
    align: "center",
    render: (_, __, index) => (page - 1) * limit + index + 1,
  },
  {
    title: "Tên gói",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Loại",
    dataIndex: "type",
    key: "type",
    render: (type) => (
      <Tag color={typeColors[type] ?? "default"}>
        {typeLabels[type] || type}
      </Tag>
    ),
  },
  {
    title: "Giá",
    dataIndex: "price",
    key: "price",
    render: (value) => formatPrice(value),
  },
  {
    title: "Số buổi",
    key: "totalSessions",
    dataIndex: "totalSessions",
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
          description={`Bạn có chắc muốn xóa gói "${record.name}"?`}
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
