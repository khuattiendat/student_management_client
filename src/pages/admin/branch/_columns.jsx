import { Button, Popconfirm, Space } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

export const buildColumns = ({ page, limit, onEdit, onDelete }) => [
  {
    title: "STT",
    width: 60,
    align: "center",
    render: (_, __, index) => (page - 1) * limit + index + 1,
  },
  {
    title: "Tên cơ sở",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Địa chỉ",
    dataIndex: "address",
    key: "address",
    render: (val) => val || "—",
  },
  {
    title: "Số điện thoại",
    dataIndex: "phone",
    key: "phone",
    render: (val) => val || "—",
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
          description={`Bạn có chắc muốn xóa cơ sở "${record.name}"?`}
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
