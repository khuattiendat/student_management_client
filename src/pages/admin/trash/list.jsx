import { useEffect, useState } from "react";
import {
  App,
  Button,
  Divider,
  Popconfirm,
  Space,
  Table,
  Typography,
} from "antd";
import { DeleteOutlined, RollbackOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import useSWR from "swr";
import classService from "../../../services/classService";

const { Title } = Typography;

const ListTrash = () => {
  const { message } = App.useApp();
  const [pageClass, setPageClass] = useState(1);
  const [limitClass, setLimitClass] = useState(10);

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    ["classes-trash", pageClass, limitClass],
    async () => {
      const response = await classService.trash({
        page: pageClass,
        limit: limitClass,
      });
      return response?.data ?? { items: [], pagination: { total: 0 } };
    },
    {
      keepPreviousData: true,
    },
  );

  useEffect(() => {
    if (error) {
      message.error(error?.message || "Không thể tải dữ liệu thùng rác");
    }
  }, [error, message]);

  const items = data?.items ?? [];
  const total = data?.pagination?.total ?? 0;
  const loading = isLoading || isValidating;

  const handleRestore = async (record) => {
    try {
      await classService.restore(record.id);
      message.success(`Đã khôi phục "${record.name}"`);
      const isLastItemOnPage = items.length === 1;
      if (isLastItemOnPage && pageClass > 1) {
        setPageClass(pageClass - 1);
        return;
      }
      mutate();
    } catch (err) {
      message.error(err?.message || "Khôi phục thất bại");
    }
  };

  const handlePermanentDelete = async (record) => {
    try {
      await classService.forceRemove(record.id);
      message.success(`Đã xóa vĩnh viễn "${record.name}"`);
      const isLastItemOnPage = items.length === 1;
      if (isLastItemOnPage && pageClass > 1) {
        setPageClass(pageClass - 1);
        return;
      }
      mutate();
    } catch (err) {
      message.error(err?.message || "Xóa vĩnh viễn thất bại");
    }
  };

  const columns = [
    {
      title: "STT",
      width: 60,
      align: "center",
      render: (_, __, index) => (pageClass - 1) * limitClass + index + 1,
    },
    {
      title: "Tên",
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
            onConfirm={() => handleRestore(record)}
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
            onConfirm={() => handlePermanentDelete(record)}
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              Xóa vĩnh viễn
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Title level={2} className="mb-0!">
          Thùng rác
        </Title>
      </div>
      <Divider />

      <div className="mb-4 flex items-center justify-between">
        <Title level={2} className="mb-0!">
          Lớp học đã xóa
        </Title>
      </div>

      <Table
        rowKey="id"
        dataSource={items}
        columns={columns}
        loading={loading}
        bordered
        size="middle"
        pagination={{
          current: pageClass,
          pageSize: limitClass,
          total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (value) => `Tổng ${value} bản ghi`,
          onChange: (nextPage, nextLimit) => {
            setPageClass(nextPage);
            setLimitClass(nextLimit);
          },
        }}
      />
    </>
  );
};

export default ListTrash;
