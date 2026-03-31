import { Button, Popconfirm, Space, Tag, Tooltip, Typography } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

export const buildColumns = ({ page, limit, onDelete, teacherNameById }) => [
  {
    title: "STT",
    width: 60,
    align: "center",
    render: (_, __, index) => (page - 1) * limit + index + 1,
  },
  {
    title: "Mã giáo viên",
    dataIndex: "code",
    key: "code",
    width: 180,
    render: (value) => <Text strong>{value || "—"}</Text>,
  },
  {
    title: "Giáo viên",
    dataIndex: "teacherId",
    key: "teacherId",
    render: (value) => teacherNameById.get(value) || `#${value}`,
  },
  {
    title: "Hết hạn",
    dataIndex: "expiresAt",
    key: "expiresAt",
    render: (value) => {
      if (!value) return "—";
      const expired = dayjs(value).isBefore(dayjs(), "hour");
      return (
        <Tag color={expired ? "red" : "green"}>
          {dayjs(value).format("DD/MM/YYYY HH:mm")}
        </Tag>
      );
    },
  },
  {
    title: "Sử dụng",
    dataIndex: "isUsed",
    key: "isUsed",
    width: 100,
    align: "center",
    render: (value) => (
      <Tag color={value ? "blue" : "default"}>
        {value ? "Đã dùng" : "Chưa dùng"}
      </Tag>
    ),
  },
  {
    title: "Ngày tạo",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (value) => (value ? dayjs(value).format("DD/MM/YYYY") : "—"),
  },
  {
    title: "Hành động",
    key: "action",
    width: 120,
    align: "center",
    render: (_, record) => (
      <Space>
        <Popconfirm
          title="Xác nhận xóa"
          description={`Bạn có chắc muốn xóa mã "${record.code}"?`}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          onConfirm={() => onDelete(record.id)}
        >
          <Tooltip title="Xóa">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
      </Space>
    ),
  },
];
