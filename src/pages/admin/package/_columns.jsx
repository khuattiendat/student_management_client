import { Button, Popconfirm, Space, Tag } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

const typeColors = {
  combo: "blue",
  course: "purple",
};

const typeLabels = {
  combo: "Combo buổi",
  course: "Khóa học",
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
    title: "Số buổi / Thời hạn",
    key: "detail",
    render: (_, record) => {
      if (record.type === "combo") {
        return `${record.totalSessions} buổi`;
      }
      if (record.startDate && record.endDate) {
        const start = new Date(record.startDate).toLocaleDateString("vi-VN");
        const end = new Date(record.endDate).toLocaleDateString("vi-VN");
        return `${start} – ${end}`;
      }
      return "—";
    },
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
