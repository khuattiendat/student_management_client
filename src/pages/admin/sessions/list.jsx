import { memo, useCallback, useEffect, useMemo, useState } from "react";
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
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  HomeOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import classService from "../../../services/classService";
import sessionService from "../../../services/sessionService";
import { getWeek } from "../../calendar/util";
import useAuthStore from "../../../store/authStore";
import BackButton from "../../../components/common/BackButton";
import { ROLES } from "../../../utils/constants";
import ModalAddSession from "./modal/ModalAddSesstion";
import { ATTENDANCE_STATUS_SUGGESTIONS } from "./const";
import { statusTagConfig } from "../student/statusConfig";

const { Title, Text } = Typography;

const AttendanceNoteInput = memo(function AttendanceNoteInput({
  studentId,
  value,
  onCommit,
}) {
  const [localValue, setLocalValue] = useState(() => value || "");

  const commit = () => {
    onCommit(studentId, localValue);
  };

  return (
    <Input
      value={localValue}
      onChange={(event) => setLocalValue(event.target.value)}
      onBlur={commit}
      onPressEnter={commit}
      placeholder="Nhập ghi chú"
      className="w-full"
      allowClear
    />
  );
});

const SessionList = () => {
  const userRole = useAuthStore((s) => s.user?.role);
  const canManager = [ROLES.ADMIN, ROLES.TEACHER].includes(userRole);
  const isAdmin = userRole === ROLES.ADMIN;
  const { message } = App.useApp();
  const [page, setPage] = useState(1);
  const limit = 10;
  const [sessionDate, setSessionDate] = useState(null);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [hasExistingAttendance, setHasExistingAttendance] = useState(false);
  const [openCodeModal, setOpenCodeModal] = useState(false);
  const [code, setCode] = useState("");
  const [openAddSessionModal, setOpenAddSessionModal] = useState(false);
  const { classId } = useParams();
  const numericClassId = Number(classId);
  const [offset, setOffset] = useState(0);

  const days = useMemo(() => getWeek(offset), [offset]);
  const startDate = days[0].format("YYYY-MM-DD");
  const [isEditing, setIsEditing] = useState(false);

  const prevWeek = () => {
    setPage(1);
    setSessionDate(null);
    setOffset((value) => value - 1);
  };
  const nextWeek = () => {
    setPage(1);
    setSessionDate(null);
    setOffset((value) => value + 1);
  };
  const goToday = () => {
    setPage(1);
    setSessionDate(null);
    setOffset(0);
  };

  const {
    data: classDetailData,
    isLoading: classLoading,
    error: classError,
  } = useSWR(
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
    error: sessionsError,
    mutate: mutateSessionList,
  } = useSWR(
    [
      "sessions",
      numericClassId,
      sessionDate?.format("YYYY-MM-DD"),
      startDate,
      page,
      limit,
    ],
    async () => {
      const response = await sessionService.list({
        classId: numericClassId,
        page,
        limit,
        startDate,
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
  const totalSessions = sessionListData?.pagination?.total ?? 0;
  const tableLoading = sessionsLoading || sessionsValidating;

  const getAttendanceWindowState = (sessionDateValue) => {
    const today = dayjs().startOf("day");
    const sessionDay = dayjs(sessionDateValue).startOf("day");

    if (!sessionDay.isValid()) {
      return { canTakeAttendance: false };
    }

    const diffInDays = sessionDay.diff(today, "day");

    return {
      canTakeAttendance: diffInDays === 0 || isAdmin,
    };
  };

  const openAttendanceModal = async (sessionRecord) => {
    const { canTakeAttendance } = getAttendanceWindowState(
      sessionRecord?.sessionDate,
    );

    if (!canTakeAttendance) {
      message.warning("Chỉ cho phép điểm danh trong ngày");
      return;
    }

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
        birthday: item?.student?.birthday
          ? dayjs(item.student.birthday).format("DD/MM/YYYY")
          : null,
        phone: item?.student?.phone,
        status: item?.status ?? "",
        rate: item?.rate ?? 5,
        note: item?.note ?? "",
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
        note: "",
      }));
      setHasExistingAttendance(false);
      setAttendanceRows(fallbackRows);
    } finally {
      setAttendanceLoading(false);
    }
  };
  const handleDeleteSession = async (sessionId, code) => {
    try {
      await sessionService.remove({ id: sessionId, params: { code } });
      message.success("Xóa buổi học thành công");
      setCode("");
      setOpenCodeModal(false);
      if (sessions.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        mutateSessionList();
      }
    } catch (err) {
      message.error(err?.error?.message || "Xóa buổi học thất bại");
    }
  };

  const updateAttendanceRow = useCallback((studentId, field, value) => {
    setAttendanceRows((prev) =>
      prev.map((row) => {
        if (row.studentId !== studentId) return row;
        if (row[field] === value) return row;
        return { ...row, [field]: value };
      }),
    );
  }, []);

  const updateAttendanceNote = useCallback(
    (studentId, note) => {
      updateAttendanceRow(studentId, "note", note);
    },
    [updateAttendanceRow],
  );

  const submitAttendance = async () => {
    if (!selectedSession?.id) return;

    const { canTakeAttendance } = getAttendanceWindowState(
      selectedSession?.sessionDate,
    );

    if (!canTakeAttendance) {
      message.warning("Chỉ cho phép điểm danh trong ngày");
      return;
    }

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
        note: String(row.note || "").trim(),
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
      mutateSessionList();

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
      render: (_, __, index) => (page - 1) * limit + index + 1,
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
      title: "Trạng thái điểm danh",
      key: "attendances",
      render: (_, record) => {
        const attendances = record.attendances ?? [];

        if (attendances.length === 0) {
          return <Tag color="default">Chưa điểm danh</Tag>;
        }

        const countMap = attendances.reduce((acc, a) => {
          const key = String(a.status).toLowerCase();
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        return (
          <Space size="small" wrap>
            {Object.entries(countMap).map(([status, count]) => {
              const config = statusTagConfig[status];

              if (!config) return null;

              const IconComponent = config.icon;
              return (
                <Tag key={status} color={config.color} icon={<IconComponent />}>
                  {config.text}: {count}
                </Tag>
              );
            })}
          </Space>
        );
      },
    },
    {
      title: "Điểm danh",
      key: "attendance",
      width: 140,
      align: "center",
      render: (_, record) => {
        const { canTakeAttendance } = getAttendanceWindowState(
          record.sessionDate,
        );

        return (
          <Space>
            <Button
              type="primary"
              onClick={() => openAttendanceModal(record)}
              disabled={!canTakeAttendance}
              title={
                canTakeAttendance
                  ? "Điểm danh"
                  : "Chỉ cho phép điểm danh trong ngày"
              }
            >
              Điểm danh
            </Button>
            <Popconfirm
              title="Xác nhận xóa"
              description={`Bạn có chắc muốn xóa buổi học này"?`}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => {
                if (userRole === ROLES.ADMIN) {
                  setCode("");
                  handleDeleteSession(record.id, code);
                } else {
                  setSelectedSession(record);
                  setOpenCodeModal(true);
                }
              }}
            >
              <Button
                disabled={!canManager}
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Space>
        );
      },
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
      render: (_, record) => (
        <div>
          {record.name || "—"} {record?.birthday}{" "}
        </div>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (value) => value || "—",
    },
    {
      title: "note",
      key: "note",
      width: 260,
      render: (_, row) => (
        <AttendanceNoteInput
          studentId={row.studentId}
          value={row.note || ""}
          onCommit={updateAttendanceNote}
        />
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 350,
      render: (_, row) => (
        <Select
          options={ATTENDANCE_STATUS_SUGGESTIONS}
          value={row.status}
          onChange={(value) =>
            updateAttendanceRow(row.studentId, "status", value || "")
          }
          placeholder="Chọn trạng thái"
          className="w-full"
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

        const IconComponent = statusConfig.icon;
        return (
          <Tag color={statusConfig.color} icon={<IconComponent />}>
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

  useEffect(() => {
    setPage(1);
  }, [sessionDate]);

  const handleSubmitNewSession = async (newSessionData) => {
    try {
      if (isEditing) {
        await sessionService.update(newSessionData.sessionId, newSessionData);
        message.success("Tạo buổi bù thành công");
        setIsEditing(false);
        setOpenAddSessionModal(false);
        mutateSessionList();
        return;
      }
      await sessionService.create(newSessionData);
      message.success("Thêm buổi học mới thành công");
      setOpenAddSessionModal(false);
      mutateSessionList();
    } catch (err) {
      setIsEditing(false);
      setOpenAddSessionModal(false);
      message.error(err?.error?.message || "Thêm buổi học mới thất bại");
    }
  };

  if (classError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Title level={2} className="mb-0!">
            Danh sách buổi học
          </Title>
        </div>

        <Card>
          <Text type="danger">
            Không thể tải thông tin lớp học: {classError.message}
          </Text>
        </Card>
      </div>
    );
  }

  if (sessionsError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Title level={2} className="mb-0!">
            Danh sách buổi học
          </Title>
        </div>

        <Card>
          <Text type="danger">
            Không thể tải danh sách buổi học: {sessionsError.message}
          </Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BackButton />
      <div className="flex items-center justify-between">
        <Title level={2} className="mb-0!">
          Danh sách buổi học
        </Title>
      </div>

      <Card
        title="Thông tin lớp học"
        loading={classLoading}
        extra={<Text type="secondary">Mã lớp: {classId}</Text>}
        className="my-3!"
      >
        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Text>
            <strong>Tên lớp:</strong> {classDetailData?.name || "—"}
          </Text>
          <Text>
            <strong>Giáo viên:</strong> {classDetailData?.teacher?.name || "—"}
          </Text>
          <Text>
            <strong>Phòng học:</strong> {classDetailData?.roomName || "—"}
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
          scroll={{ x: "max-content" }}
        />
      </Card>
      <div className="flex items-center gap-2 justify-between flex-wrap">
        <div>
          <DatePicker
            value={sessionDate}
            format="DD/MM/YYYY"
            placeholder="Lọc theo ngày học"
            onChange={(value) => {
              setPage(1);
              setSessionDate(value);
            }}
            className="w-48"
          />
        </div>
        <div className="flex gap-2">
          {/* <Button
            type="primary"
            onClick={() => {
              setIsEditing(true);
              setOpenAddSessionModal(true);
            }}
          >
            Tạo buổi bù
          </Button> */}
          {canManager && (
            <Button type="primary" onClick={() => setOpenAddSessionModal(true)}>
              Thêm buổi học
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            icon={<LeftOutlined />}
            onClick={prevWeek}
            type="primary"
            className="bg-yellow-400!"
          >
            Tuần trước
          </Button>
          <Button icon={<HomeOutlined />} onClick={goToday}>
            Tuần này
          </Button>
          <Button
            icon={<RightOutlined />}
            onClick={nextWeek}
            type="primary"
            iconPosition="end"
            className="bg-green-400!"
          >
            Tuần sau
          </Button>
        </div>
      </div>

      <Table
        rowKey="id"
        dataSource={sessions}
        columns={sessionColumns}
        loading={tableLoading}
        pagination={false}
        bordered
        size="middle"
        scroll={{ x: "max-content" }}
      />

      <div className="flex justify-end">
        <Pagination
          current={page}
          total={totalSessions}
          pageSize={limit}
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
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setAttendanceOpen(false);
              setSelectedSession(null);
              setAttendanceRows([]);
              setHasExistingAttendance(false);
            }}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={submitAttendance}
            loading={attendanceSaving}
            disabled={attendanceLoading || !canManager}
          >
            {hasExistingAttendance ? "Cập nhật điểm danh" : "Lưu điểm danh"}
          </Button>,
        ]}
        width={1100}
        destroyOnHidden
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
          scroll={{ x: "max-content" }}
        />
      </Modal>

      <Modal
        title="Xác nhận mã code"
        open={openCodeModal}
        centered
        destroyOnHidden
        onCancel={() => {
          setOpenCodeModal(false);
          setCode("");
          setSelectedSession(null);
        }}
        onOk={() => {
          if (!code || !String(code).trim()) {
            message.error("Vui lòng nhập mã code để xác nhận xóa");
            return;
          }
          handleDeleteSession(selectedSession.id, code);
        }}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <InputNumber
          autoFocus
          placeholder="Nhập mã code để xác nhận xóa"
          value={code}
          onChange={(value) => setCode(value)}
          className="w-full!"
          required
        />
      </Modal>
      {openAddSessionModal && (
        <ModalAddSession
          classId={classId}
          open={openAddSessionModal}
          onClose={() => {
            setIsEditing(false);
            setOpenAddSessionModal(false);
          }}
          onSubmit={handleSubmitNewSession}
          isEdit={isEditing}
        />
      )}
    </div>
  );
};

export default SessionList;
