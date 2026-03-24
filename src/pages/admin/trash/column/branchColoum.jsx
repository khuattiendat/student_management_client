import { Button, Popconfirm, Space } from "antd";
import { DeleteOutlined, RollbackOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export const buildBranchColumns = ({
  pageBranch,
  limitBranch,
  handleRestoreBranch,
  handlePermanentDeleteBranch,
}) => [
  {
    title: "STT",
    width: 60,
    align: "center",
    render: (_, __, index) => (pageBranch - 1) * limitBranch + index + 1,
  },
  {
    title: "Tên",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Địa chỉ",
    dataIndex: "address",
    key: "address",
    render: (value) => value || "—",
  },
  {
    title: "Số điện thoại",
    dataIndex: "phone",
    key: "phone",
    render: (value) => value || "—",
  },
  {
    title: "Thời gian xóa",
    dataIndex: "deletedAt",
    key: "deletedAt",
    render: (value) =>
      value ? dayjs(value).format("DD/MM/YYYY HH:mm:ss") : "—",
  },
  {
    title: "Hành động",
    key: "action",
    width: 220,
    align: "center",
    render: (_, record) => (
      <Space>
        <Popconfirm
          title="Xác nhận khôi phục"
          description={`Bạn có chắc muốn khôi phục "${record.name}"?`}
          okText="Khôi phục"
          cancelText="Hủy"
          onConfirm={() => handleRestoreBranch(record)}
        >
          <Button type="text" icon={<RollbackOutlined />}>
            Khôi phục
          </Button>
        </Popconfirm>

        <Popconfirm
          title="Xác nhận xóa vĩnh viễn"
          description={`Bạn có chắc muốn xóa vĩnh viễn "${record.name}"?`}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          onConfirm={() => handlePermanentDeleteBranch(record)}
        >
          <Button type="text" danger icon={<DeleteOutlined />}>
            Xóa vĩnh viễn
          </Button>
        </Popconfirm>
      </Space>
    ),
  },
];
