import { useEffect, useMemo, useState } from "react";
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
  const [classFilter, setClassFilter] = useState();
  const [statusFilter, setStatusFilter] = useState();

  // 👉 SWR key
  const swrKey =
    open && student?.id
      ? ["attendances", student.id, page, limit, classFilter, statusFilter]
      : null;

  // 👉 Fetcher
  const fetcher = async () => {
    const params = {
      page,
      limit,
      ...(classFilter && { classId: classFilter }),
      ...(statusFilter && { status: statusFilter }),
    };

    const res = await studentService.attendances(student.id, params);
    return res?.data ?? res;
  };

  const { data, isLoading, error } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  const items = data?.items ?? [];
  const total = data?.pagination?.total ?? 0;
  const studentClass = data?.studentClass ?? [];

  // 👉 Error handler
  useEffect(() => {
    if (error) {
      message.error(error?.message || "Không thể tải lịch sử điểm danh");
    }
  }, [error]);

  // 👉 Reset khi đóng modal
  useEffect(() => {
    if (!open) {
      setPage(1);
      setLimit(10);
      setClassFilter(undefined);
      setStatusFilter(undefined);
    }
  }, [open]);

  // 👉 Columns (memo)
  const columns = useMemo(
    () => [
      {
        title: "STT",
        width: 60,
        align: "center",
        render: (_, __, index) => (page - 1) * limit + index + 1,
      },
      {
        title: "Ngày học",
        dataIndex: ["session", "sessionDate"],
        render: (value) => (value ? dayjs(value).format("DD/MM/YYYY") : "—"),
      },
      {
        title: "Khung giờ",
        render: (_, record) => {
          const start = record?.session?.startTime?.slice(0, 5);
          const end = record?.session?.endTime?.slice(0, 5);
          return start && end ? `${start} - ${end}` : "—";
        },
      },
      {
        title: "Lớp học",
        dataIndex: ["session", "classEntity", "name"],
        render: (value) => value || "—",
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        render: (status) => {
          const config = statusConfig[String(status || "").toLowerCase()];
          return config ? (
            <Tag color={config.color}>{config.label}</Tag>
          ) : (
            <Tag>{status || "—"}</Tag>
          );
        },
      },
      {
        title: "Điểm đánh giá",
        dataIndex: "rate",
        render: (value) => value ?? "—",
      },
    ],
    [page, limit],
  );

  return (
    <Modal
      title={`Lịch sử điểm danh${student?.name ? ` - ${student.name}` : ""}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      destroyOnClose
    >
      {/* Filters */}
      <Space className="mb-4 gap-4" wrap>
        <Select
          placeholder="Lọc theo lớp học"
          style={{ width: 200 }}
          allowClear
          value={classFilter}
          onChange={(value) => {
            setClassFilter(value);
            setPage(1);
          }}
          options={studentClass.map((cls) => ({
            label: cls.name,
            value: cls.id,
          }))}
        />

        <Select
          placeholder="Lọc theo trạng thái"
          style={{ width: 200 }}
          allowClear
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
          options={[
            { label: "Có mặt", value: "present" },
            { label: "Vắng", value: "absent" },
            { label: "Đi muộn", value: "late" },
          ]}
        />
      </Space>

      {/* Table */}
      <Table
        rowKey="id"
        dataSource={items}
        columns={columns}
        loading={isLoading}
        bordered
        size="middle"
        scroll={{ x: "max-content" }}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (value) => `Tổng ${value} bản ghi điểm danh`,
          onChange: (p, l) => {
            setPage(p);
            setLimit(l);
          },
        }}
      />
    </Modal>
  );
};

export default StudentAttendanceModal;
