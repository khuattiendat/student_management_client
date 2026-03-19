import { Button, Popconfirm, Space, Tag, Tooltip, Typography } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

export const buildColumns = ({
  page,
  limit,
  onEdit,
  onRenew,
  onDelete,
  onViewAttendances,
  canManage,
}) => [
  {
    title: "STT",
    width: 60,
    align: "center",
    render: (_, __, index) => (page - 1) * limit + index + 1,
  },
  {
    title: "Học viên",
    dataIndex: "name",
    width: 240,
    key: "name",
    render: (_, record) => (
      <div className="flex flex-col">
        <Text strong>{record.name}</Text>
        <Text type="secondary">{record.phone || "—"}</Text>
      </div>
    ),
  },
  {
    title: "Ngày sinh",
    dataIndex: "birthday",
    key: "birthday",
    render: (value) => (value ? dayjs(value).format("DD/MM/YYYY") : "—"),
  },
  {
    title: "Cơ sở",
    dataIndex: "branch",
    width: 200,
    key: "branch",
    render: (branch) => branch?.name || "—",
  },
  {
    title: "Phụ huynh",
    dataIndex: "parents",
    key: "parents",
    render: (parents = []) =>
      parents.length ? (
        <div className="flex flex-col gap-1">
          {parents.map((parent) => (
            <Text key={parent.id || `${parent.name}-${parent.phone}`}>
              {parent.name} ({parent.phone || "—"})
            </Text>
          ))}
        </div>
      ) : (
        "—"
      ),
  },
  {
    title: "Gói học",
    dataIndex: "packages",
    width: 400,
    key: "packages",
    render: (packages = []) =>
      packages.length ? (
        <div className="flex flex-wrap gap-1">
          {packages.map((item) => (
            <Tag key={item.id}>{item.name}</Tag>
          ))}
        </div>
      ) : (
        "—"
      ),
  },
  {
    title: "Số buổi đã học",
    dataIndex: "learnedSessions",
    key: "learnedSessions",
    render: (value, record) => (
      <Button
        type="link"
        className="px-0!"
        onClick={() => onViewAttendances(record)}
      >
        {value ?? 0}
      </Button>
    ),
  },
  {
    title: "Buổi còn lại",
    dataIndex: "remainingSessions",
    key: "remainingSessions",
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
    width: 140,
    align: "center",
    render: (_, record) => (
      <Space>
        {canManage ? (
          <>
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
              />
            </Tooltip>
            <Tooltip title="Gia hạn khóa học">
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => onRenew(record)}
              />
            </Tooltip>
            <Popconfirm
              title="Xác nhận xóa"
              description={`Bạn có chắc muốn xóa học viên "${record.name}"?`}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => onDelete(record.id)}
            >
              <Tooltip title="Xóa">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </>
        ) : (
          "—"
        )}
      </Space>
    ),
  },
];
