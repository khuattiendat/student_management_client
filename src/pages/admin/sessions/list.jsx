import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import useSWR from "swr";
import {
  App,
  Button,
  Card,
  DatePicker,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import classService from "../../../services/classService";
import sessionService from "../../../services/sessionService";

const { Title, Text } = Typography;

const ATTENDANCE_STATUS_SUGGESTIONS = [
  { value: "present", label: "Có mặt" },
  { value: "absent", label: "Vắng" },
  { value: "late", label: "Muộn" },
];

const statusTagConfig = {
  present: { color: "green", icon: <CheckCircleOutlined />, text: "Có mặt" },
  absent: { color: "red", icon: <CloseCircleOutlined />, text: "Vắng" },
  late: { color: "orange", icon: <ClockCircleOutlined />, text: "Đi muộn" },
  excused: { color: "blue", icon: <ClockCircleOutlined />, text: "Có phép" },
};

const getWeekStart = (value) => {
  const date = dayjs(value).startOf("day");
  const day = date.day();
  const diff = day === 0 ? -6 : 1 - day;
  return date.add(diff, "day");
};

const SessionList = () => {
  const { message } = App.useApp();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");
  const [sessionDate, setSessionDate] = useState(null);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [hasExistingAttendance, setHasExistingAttendance] = useState(false);
  const hasAutoJumpedToCurrentWeekRef = useRef(false);

  const { classId } = useParams();
  const numericClassId = Number(classId);

  const { data: classDetailData, isLoading: classLoading } = useSWR(
    Number.isInteger(numericClassId) && numericClassId > 0
      ? ["class-detail-for-sessions", numericClassId]
      : null,
    async () => {
      const response = await classService.detail(numericClassId);
      return response?.data;
    },
  );

  const {
    data: sessionListData,
    isLoading: sessionsLoading,
    isValidating: sessionsValidating,
  } = useSWR(
    ["sessions", numericClassId, search, sessionDate?.format("YYYY-MM-DD")],
    async () => {
      const response = await sessionService.list({
        classId: numericClassId,
        search: search || undefined,
        sessionDate: sessionDate ? sessionDate.format("YYYY-MM-DD") : undefined,
      });

      return response?.data ?? { items: [], pagination: { total: 0 } };
    },
    {
      keepPreviousData: true,
    },
  );

  const classStudents = classDetailData?.students ?? [];
  const sessions = useMemo(
    () => sessionListData?.items ?? [],
    [sessionListData],
  );
  const tableLoading = sessionsLoading || sessionsValidating;

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const dateA = dayjs(a?.sessionDate).valueOf();
      const dateB = dayjs(b?.sessionDate).valueOf();

      if (dateA !== dateB) {
        return dateB - dateA;
      }

      return String(b?.startTime || "").localeCompare(
        String(a?.startTime || ""),
      );
    });
  }, [sessions]);

  const currentWeekStartText = useMemo(
    () => getWeekStart(dayjs()).format("YYYY-MM-DD"),
    [],
  );

  const anchorIndex = useMemo(
    () =>
      sortedSessions.findIndex(
        (item) =>
          dayjs(item?.sessionDate).format("YYYY-MM-DD") ===
          currentWeekStartText,
      ),
    [currentWeekStartText, sortedSessions],
  );

  const paginationData = useMemo(() => {
    if (sortedSessions.length === 0) {
      return { page1Items: [], remainingItems: [], totalPages: 1 };
    }

    if (anchorIndex > 0) {
      const page1Items = sortedSessions.slice(0, anchorIndex);
      const remainingItems = sortedSessions.slice(anchorIndex);
      const totalPages =
        1 + Math.max(1, Math.ceil(remainingItems.length / limit));

      return {
        page1Items,
        remainingItems,
        totalPages,
      };
    }

    return {
      page1Items: [],
      remainingItems: sortedSessions,
      totalPages: Math.max(1, Math.ceil(sortedSessions.length / limit)),
    };
  }, [anchorIndex, limit, sortedSessions]);

  const totalPages = paginationData.totalPages;
  const totalSessions = sortedSessions.length;

  useEffect(() => {
    if (totalPages === 0) {
      if (page !== 1) setPage(1);
      return;
    }

    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, setPage, totalPages]);

  useEffect(() => {
    if (search || sessionDate || hasAutoJumpedToCurrentWeekRef.current) {
      return;
    }

    if (sortedSessions.length === 0) {
      return;
    }

    if (anchorIndex > 0) {
      setPage(2);
    } else {
      setPage(1);
    }

    hasAutoJumpedToCurrentWeekRef.current = true;
  }, [anchorIndex, search, sessionDate, setPage, sortedSessions]);

  useEffect(() => {
    if (!search && !sessionDate) return;
    hasAutoJumpedToCurrentWeekRef.current = true;
  }, [search, sessionDate]);

  const currentPageSessions = useMemo(() => {
    if (totalSessions === 0) {
      return [];
    }

    if (anchorIndex > 0) {
      if (page === 1) {
        return paginationData.page1Items;
      }

      const startIndex = (page - 2) * limit;
      return paginationData.remainingItems.slice(
        startIndex,
        startIndex + limit,
      );
    }

    const startIndex = (page - 1) * limit;
    return paginationData.remainingItems.slice(startIndex, startIndex + limit);
  }, [anchorIndex, limit, page, paginationData, totalSessions]);

  const getGlobalIndex = (indexInPage) => {
    if (anchorIndex > 0) {
      if (page === 1) {
        return indexInPage + 1;
      }

      return (
        paginationData.page1Items.length + (page - 2) * limit + indexInPage + 1
      );
    }

    return (page - 1) * limit + indexInPage + 1;
  };

  const openAttendanceModal = async (sessionRecord) => {
    setSelectedSession(sessionRecord);
    setAttendanceOpen(true);

    try {
      setAttendanceLoading(true);
      const response = await sessionService.getAttendance(sessionRecord.id);
      const attendanceDetail = response?.data;
      const rows = (attendanceDetail?.items ?? []).map((item) => ({
        key: item.studentId,
        studentId: item.studentId,
        name: item?.student?.name,
        phone: item?.student?.phone,
        status: item?.status ?? "",
        rate: item?.rate ?? 5,
      }));

      setHasExistingAttendance((attendanceDetail?.totalTaken ?? 0) > 0);
      setAttendanceRows(rows);
    } catch (err) {
      message.error(err?.message || "Không thể tải dữ liệu điểm danh");
      const fallbackRows = classStudents.map((student) => ({
        key: student.id,
        studentId: student.id,
        name: student.name,
        phone: student.phone,
        status: "",
        rate: 5,
      }));
      setHasExistingAttendance(false);
      setAttendanceRows(fallbackRows);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const updateAttendanceRow = (studentId, field, value) => {
    setAttendanceRows((prev) =>
      prev.map((row) =>
        row.studentId === studentId ? { ...row, [field]: value } : row,
      ),
    );
  };

  const submitAttendance = async () => {
    if (!selectedSession?.id) return;

    const hasInvalidStatus = attendanceRows.some(
      (row) => !String(row.status || "").trim(),
    );

    if (hasInvalidStatus) {
      message.error("Vui lòng nhập trạng thái điểm danh cho tất cả học sinh");
      return;
    }

    const payload = {
      attendances: attendanceRows.map((row) => ({
        studentId: row.studentId,
        status: String(row.status).trim(),
        ...(row.rate === null || row.rate === undefined
          ? {}
          : { rate: row.rate }),
      })),
    };

    try {
      setAttendanceSaving(true);
      if (hasExistingAttendance) {
        await sessionService.updateAttendance(selectedSession.id, payload);
      } else {
        await sessionService.takeAttendance(selectedSession.id, payload);
      }

      message.success(
        hasExistingAttendance
          ? "Cập nhật điểm danh thành công"
          : "Điểm danh thành công",
      );
      setAttendanceOpen(false);
      setSelectedSession(null);
      setAttendanceRows([]);
      setHasExistingAttendance(false);
    } catch (err) {
      message.error(err?.message || "Điểm danh thất bại");
    } finally {
      setAttendanceSaving(false);
    }
  };

  const sessionColumns = [
    {
      title: "STT",
      width: 60,
      align: "center",
      render: (_, __, index) => getGlobalIndex(index),
    },
    {
      title: "Ngày học",
      dataIndex: "sessionDate",
      key: "sessionDate",
      render: (value) => (value ? dayjs(value).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Giờ học",
      key: "time",
      render: (_, record) =>
        `${record.startTime || "--:--"} - ${record.endTime || "--:--"}`,
    },
    {
      title: "Lớp",
      dataIndex: ["classEntity", "name"],
      key: "className",
      render: (value) => value || classDetailData?.name || "—",
    },
    {
      title: "Điểm danh",
      key: "attendance",
      width: 140,
      align: "center",
      render: (_, record) => (
        <Button type="primary" onClick={() => openAttendanceModal(record)}>
          Điểm danh
        </Button>
      ),
    },
  ];

  const classStudentColumns = [
    {
      title: "STT",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Họ tên",
      dataIndex: "name",
      key: "name",
      render: (value) => value || "—",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (value) => value || "—",
    },
  ];

  const attendanceColumns = [
    {
      title: "Học sinh",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (value) => value || "—",
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, row) => (
        <Select
          options={ATTENDANCE_STATUS_SUGGESTIONS}
          value={row.status}
          onChange={(value) =>
            updateAttendanceRow(row.studentId, "status", value || "")
          }
          placeholder="Chọn trạng thái"
          className="w-44"
          showSearch
          optionFilterProp="label"
        />
      ),
    },
    {
      title: "Điểm đánh giá",
      key: "rate",
      render: (_, row) => (
        <InputNumber
          min={0}
          step={1}
          max={5}
          value={row.rate}
          onChange={(value) =>
            updateAttendanceRow(row.studentId, "rate", value ?? 5)
          }
          placeholder="0"
          className="w-28"
        />
      ),
    },
    {
      title: "Hiển thị",
      key: "preview",
      render: (_, row) => {
        const normalizedStatus = String(row.status || "").toLowerCase();
        const statusConfig = statusTagConfig[normalizedStatus];
        if (!statusConfig) {
          return <Tag>{row.status || "—"}</Tag>;
        }

        return (
          <Tag color={statusConfig.color} icon={statusConfig.icon}>
            {statusConfig.text}
          </Tag>
        );
      },
    },
  ];

  const attendanceModalTitle = useMemo(() => {
    if (!selectedSession) {
      return "Điểm danh";
    }

    const dateText = selectedSession.sessionDate
      ? dayjs(selectedSession.sessionDate).format("DD/MM/YYYY")
      : "—";

    return `Điểm danh buổi ${dateText} (${selectedSession.startTime || "--:--"} - ${selectedSession.endTime || "--:--"})`;
  }, [selectedSession]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={2} className="mb-0!">
          Danh sách buổi học
        </Title>
      </div>

      <Card>
        <Space wrap>
          <Input
            allowClear
            value={search}
            placeholder="Tìm theo ngày học hoặc giờ học"
            className="w-72"
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
          />
          <DatePicker
            value={sessionDate}
            format="DD/MM/YYYY"
            placeholder="Lọc theo ngày học"
            onChange={(value) => {
              setPage(1);
              setSessionDate(value);
            }}
          />
        </Space>
      </Card>

      <Card
        title="Thông tin lớp học"
        loading={classLoading}
        extra={<Text type="secondary">Mã lớp: {classId}</Text>}
      >
        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Text>
            <strong>Tên lớp:</strong> {classDetailData?.name || "—"}
          </Text>
          <Text>
            <strong>Giáo viên:</strong> {classDetailData?.teacher?.name || "—"}
          </Text>
        </div>

        <Table
          rowKey="id"
          dataSource={classStudents}
          columns={classStudentColumns}
          pagination={false}
          bordered
          size="small"
          locale={{ emptyText: "Lớp học chưa có học sinh" }}
        />
      </Card>

      <Table
        rowKey="id"
        dataSource={currentPageSessions}
        columns={sessionColumns}
        loading={tableLoading}
        pagination={false}
        bordered
        size="middle"
      />

      <div className="flex justify-end">
        <Pagination
          current={page}
          total={totalPages}
          pageSize={1}
          showSizeChanger={false}
          onChange={(nextPage) => setPage(nextPage)}
          showTotal={() => `Tổng ${totalSessions} buổi học`}
        />
      </div>

      <Modal
        title={attendanceModalTitle}
        open={attendanceOpen}
        onCancel={() => {
          setAttendanceOpen(false);
          setSelectedSession(null);
          setAttendanceRows([]);
          setHasExistingAttendance(false);
        }}
        onOk={submitAttendance}
        okText={hasExistingAttendance ? "Cập nhật điểm danh" : "Lưu điểm danh"}
        cancelText="Hủy"
        confirmLoading={attendanceSaving}
        width={1100}
      >
        <Table
          rowKey="studentId"
          dataSource={attendanceRows}
          columns={attendanceColumns}
          loading={attendanceLoading}
          pagination={false}
          bordered
          size="small"
          locale={{ emptyText: "Lớp học chưa có học sinh để điểm danh" }}
        />
      </Modal>
    </div>
  );
};

export default SessionList;
