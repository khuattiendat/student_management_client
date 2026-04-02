import { Button, Empty, Modal, Tag, Typography } from "antd";
import dayjs from "dayjs";

const { Paragraph, Text, Title } = Typography;

const STATUS_META = {
  present: { label: "Có mặt", color: "green" },
  late: { label: "Đi muộn", color: "orange" },
  excused_absent: { label: "Vắng có phép", color: "blue" },
  unexcused_absent: { label: "Vắng không phép", color: "red" },
  late_cancel_absent: { label: "Báo nghỉ sát giờ", color: "volcano" },
  predicted: { label: "Dự đoán", color: "geekblue" },
  unmarked: { label: "Chưa điểm danh", color: "default" },
};

const TRACKED_STATUSES = [
  "present",
  "late",
  "excused_absent",
  "unexcused_absent",
  "late_cancel_absent",
];

const formatDate = (value) => {
  if (!value) return "-";
  const d = dayjs(value);
  return d.isValid() ? d.format("YYYY-MM-DD") : "-";
};

const normalizeStatus = (status) => {
  const normalized = String(status || "").toLowerCase();
  return STATUS_META[normalized] ? normalized : "unmarked";
};

const getSessionStartDateTime = (session) => {
  const sessionDate = dayjs(session?.sessionDate);
  if (!sessionDate.isValid()) return null;

  const startTime = String(session?.startTime || "");
  const [h = "0", m = "0", s = "0"] = startTime.split(":");

  return sessionDate
    .hour(Number(h) || 0)
    .minute(Number(m) || 0)
    .second(Number(s) || 0)
    .millisecond(0);
};

const buildStudentReport = (student, schedule = []) => {
  const attendanceBySessionId = new Map(
    (student?.attendances ?? []).map((item) => [
      item.sessionId ?? item.session?.id,
      item,
    ]),
  );

  const timeline = [...schedule]
    .sort(
      (a, b) => dayjs(a.sessionDate).valueOf() - dayjs(b.sessionDate).valueOf(),
    )
    .map((session) => {
      const attendance = attendanceBySessionId.get(session.id);
      const sessionStart = getSessionStartDateTime(session);
      const isFutureSession =
        !attendance && !!sessionStart && sessionStart.isAfter(dayjs());
      const status = isFutureSession
        ? "predicted"
        : normalizeStatus(attendance?.status);

      return {
        id: session.id,
        sessionDate: session.sessionDate,
        startTime: session.startTime,
        endTime: session.endTime,
        status,
      };
    });

  const totalByStatus = TRACKED_STATUSES.reduce(
    (acc, status) => ({ ...acc, [status]: 0 }),
    {},
  );

  timeline.forEach((item) => {
    if (Object.prototype.hasOwnProperty.call(totalByStatus, item.status)) {
      totalByStatus[item.status] += 1;
    }
  });

  const totalUnmarked = timeline.filter(
    (item) => item.status === "unmarked",
  ).length;
  const totalPredicted = timeline.filter(
    (item) => item.status === "predicted",
  ).length;
  const totalMarked = timeline.length - totalUnmarked - totalPredicted;

  return {
    studentName: student?.name || "-",
    timeline,
    totalByStatus,
    totalMarked,
    totalUnmarked,
    totalPredicted,
  };
};

const CycleReportModal = ({ open, onClose, data }) => {
  const classInfo = data?.class;
  const schedule = data?.schedule ?? [];
  const students = data?.students ?? [];
  const reports = students.map((student) =>
    buildStudentReport(student, schedule),
  );

  const handleExportReport = () => {
    if (!reports.length) return;

    const lines = [];
    lines.push("Báo cáo điểm danh theo lịch học");
    lines.push(`Lớp: ${classInfo?.name || "-"}`);
    lines.push(`Ngày xuất: ${dayjs().format("YYYY-MM-DD HH:mm:ss")}`);
    lines.push("");

    reports.forEach((report, idx) => {
      lines.push(`Học viên: ${report.studentName}`);
      lines.push("THỐNG KÊ THEO TRẠNG THÁI:");

      TRACKED_STATUSES.forEach((status) => {
        lines.push(
          `- ${STATUS_META[status].label}: ${report.totalByStatus[status]}`,
        );
      });

      lines.push(`- ${STATUS_META.unmarked.label}: ${report.totalUnmarked}`);
      lines.push("");

      lines.push("TOÀN BỘ LỊCH HỌC VÀ ĐIỂM DANH:");
      if (!report.timeline.length) {
        lines.push("- Không có dữ liệu");
      } else {
        report.timeline.forEach((item) => {
          lines.push(
            `- ${formatDate(item.sessionDate)} : ${STATUS_META[item.status].label}`,
          );
        });
      }

      lines.push(`Tổng số buổi theo lịch học: ${report.timeline.length}`);
      lines.push(`Tổng số buổi đã điểm danh: ${report.totalMarked}`);

      if (idx < reports.length - 1) {
        lines.push("");
        lines.push("----------------------------------------");
        lines.push("");
      }
    });

    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const className = (classInfo?.name || "lop").replace(/\s+/g, "_");
    link.href = url;
    link.download = `bao-cao-diem-danh-${className}-${dayjs().format("YYYYMMDD-HHmmss")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      title="Báo cáo điểm danh theo lịch học"
      destroyOnHidden
    >
      {!reports.length ? (
        <Empty description="Không có dữ liệu điểm danh" />
      ) : (
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <div className="mb-4 flex justify-end">
            <Button type="primary" onClick={handleExportReport}>
              Xuất báo cáo
            </Button>
          </div>
          {reports.map((report, idx) => (
            <div
              key={`${report.studentName}-${idx}`}
              className="mb-8 last:mb-0"
            >
              <Title level={5} className="mb-2!">
                Học viên: {report.studentName}
              </Title>
              <Paragraph className="mb-4!">
                Lớp đang xem: <Text strong>{classInfo?.name || "-"}</Text>
              </Paragraph>

              <Title level={5} className="mb-2!">
                THỐNG KÊ THEO TRẠNG THÁI
              </Title>
              <div className="mb-4 flex flex-wrap gap-2">
                {TRACKED_STATUSES.map((status) => (
                  <Tag key={status} color={STATUS_META[status].color}>
                    {STATUS_META[status].label}: {report.totalByStatus[status]}
                  </Tag>
                ))}
                <Tag color={STATUS_META.unmarked.color}>
                  {STATUS_META.unmarked.label}: {report.totalUnmarked}
                </Tag>
              </div>

              <Title level={5} className="mb-2!">
                TOÀN BỘ LỊCH HỌC VÀ ĐIỂM DANH
              </Title>
              <div className="mb-4 flex flex-col gap-1">
                {report.timeline.length ? (
                  report.timeline.map((item) => (
                    <div key={item.id}>
                      <Text>- {formatDate(item.sessionDate)} </Text>
                      <Tag
                        color={STATUS_META[item.status].color}
                        className="ml-2"
                      >
                        {STATUS_META[item.status].label}
                      </Tag>
                    </div>
                  ))
                ) : (
                  <Text type="secondary">Không có dữ liệu</Text>
                )}
              </div>

              <Title level={5} className="mb-2!">
                TỔNG KẾT
              </Title>
              <Paragraph className="mb-1!">
                - Tổng số buổi theo lịch học:{" "}
                <Text strong>{report.timeline.length}</Text>
              </Paragraph>
              <Paragraph className="mb-0!">
                - Tổng số buổi đã điểm danh:{" "}
                <Text strong>{report.totalMarked}</Text>
              </Paragraph>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default CycleReportModal;
