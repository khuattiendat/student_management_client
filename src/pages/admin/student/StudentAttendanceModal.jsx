import { useEffect, useState } from "react";
import { App, Modal, Table, Tag, Typography } from "antd";
import dayjs from "dayjs";
import studentService from "../../../services/studentService";

const { Text } = Typography;

const statusConfig = {
  present: { color: "green", label: "Có mặt" },
  absent: { color: "red", label: "Vắng" },
  late: { color: "orange", label: "Đi muộn" },
  excused: { color: "blue", label: "Có phép" },
};

const StudentAttendanceModal = ({ open, onClose, student }) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadAttendances = async () => {
      if (!open || !student?.id) return;

      try {
        setLoading(true);
        const response = await studentService.attendances(student.id, {
          page,
          limit,
        });

        const payload = response?.data ?? response;
        setItems(payload?.items ?? []);
        setTotal(payload?.pagination?.total ?? 0);
      } catch (err) {
        message.error(err?.message || "Không thể tải lịch sử điểm danh");
      } finally {
        setLoading(false);
      }
    };

    loadAttendances();
  }, [open, student?.id, page, limit, message]);

  useEffect(() => {
    if (!open) {
      setPage(1);
      setLimit(10);
      setItems([]);
      setTotal(0);
    }
  }, [open]);

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
      title: "Rate",
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
      <Table
        rowKey="id"
        dataSource={items}
        columns={columns}
        loading={loading}
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
