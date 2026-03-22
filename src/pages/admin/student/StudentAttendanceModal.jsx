import { useEffect, useState } from "react";
import { App, Modal, Table, Tag, Typography, Select, Space } from "antd";
import dayjs from "dayjs";
import useSWR from "swr";
import studentService from "../../../services/studentService";

const { Text } = Typography;

const statusConfig = {
  present: { color: "green", label: "Có mặt" },
  absent: { color: "red", label: "Vắng" },
  late: { color: "orange", label: "Đi muộn" },
};

const StudentAttendanceModal = ({ open, onClose, student }) => {
  const { message } = App.useApp();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [classes, setClasses] = useState([]);

  // SWR key includes all filter and pagination params
  const swrKey =
    open && student?.id
      ? ["attendances", student.id, page, limit, classFilter, statusFilter]
      : null;

  // SWR fetcher function
  const fetcher = async () => {
    const params = { page, limit };

    if (classFilter) {
      params.classId = classFilter;
    }

    if (statusFilter) {
      params.status = statusFilter;
    }

    const response = await studentService.attendances(student.id, params);
    return response?.data ?? response;
  };

  const { data, isLoading, error } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  const items = data?.items ?? [];
  const total = data?.pagination?.total ?? 0;

  // Handle SWR errors
  useEffect(() => {
    if (error) {
      message.error(error?.message || "Không thể tải lịch sử điểm danh");
    }
  }, [error, message]);

  // Reset states and extract classes when modal opens/closes or data changes
  useEffect(() => {
    if (!open) {
      setPage(1);
      setLimit(10);
      setClassFilter("");
      setStatusFilter("");
      setClasses([]);
    }
  }, [open]);

  // Extract unique classes from attendance items
  useEffect(() => {
    if (items && items.length > 0) {
      const uniqueClasses = new Map();
      items.forEach((item) => {
        const classId = item?.session?.classEntity?.id;
        const className = item?.session?.classEntity?.name;
        if (classId && className) {
          uniqueClasses.set(classId, className);
        }
      });
      setClasses(Array.from(uniqueClasses, ([id, name]) => ({ id, name })));
    }
  }, [items]);

  const columns = [
    {
      title: "STT",
      width: 60,
      align: "center",
      render: (_, __, index) => (page - 1) * limit + index + 1,
    },
    {
      title: "Ngày học",
      dataIndex: ["session", "sessionDate"],
      key: "sessionDate",
      render: (value) => (value ? dayjs(value).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Khung giờ",
      key: "time",
      render: (_, record) => {
        const startTime = record?.session?.startTime?.slice(0, 5);
        const endTime = record?.session?.endTime?.slice(0, 5);
        if (!startTime || !endTime) return "—";
        return `${startTime} - ${endTime}`;
      },
    },
    {
      title: "Lớp học",
      dataIndex: ["session", "classEntity", "name"],
      key: "className",
      render: (value) => value || "—",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const normalizedStatus = String(status || "").toLowerCase();
        const config = statusConfig[normalizedStatus];

        if (!config) {
          return <Tag>{status || "—"}</Tag>;
        }

        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Điểm đánh giá",
      dataIndex: "rate",
      key: "rate",
      render: (value) => value ?? "—",
    },
  ];

  return (
    <Modal
      title={`Lịch sử điểm danh${student?.name ? ` - ${student.name}` : ""}`}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={1000}
      destroyOnClose
    >
      <Space className="mb-4 gap-4" wrap>
        <Select
          placeholder="Lọc theo lớp học"
          style={{ width: 200 }}
          allowClear
          value={classFilter || undefined}
          onChange={(value) => {
            setClassFilter(value || "");
            setPage(1);
          }}
          options={[
            ...classes.map((cls) => ({
              label: cls.name,
              value: cls.id,
            })),
          ]}
        />

        <Select
          placeholder="Lọc theo trạng thái"
          style={{ width: 200 }}
          allowClear
          value={statusFilter || undefined}
          onChange={(value) => {
            setStatusFilter(value || "");
            setPage(1);
          }}
          options={[
            { label: "Có mặt", value: "present" },
            { label: "Vắng", value: "absent" },
            { label: "Đi muộn", value: "late" },
          ]}
        />
      </Space>

      <Table
        rowKey="id"
        dataSource={items}
        columns={columns}
        loading={isLoading}
        bordered
        size="middle"
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (value) => `Tổng ${value} bản ghi điểm danh`,
          onChange: (nextPage, nextLimit) => {
            setPage(nextPage);
            setLimit(nextLimit);
          },
        }}
      />
    </Modal>
  );
};

export default StudentAttendanceModal;
