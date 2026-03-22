import { useEffect, useMemo } from "react";
import { App, Modal, Table, Tag, Typography } from "antd";
import useSWR from "swr";
import studentService from "../../../services/studentService";
import { comboTypeLabels } from "../package/_columns";
import {
  certificateOptions,
  generalProgramOptions,
  typeOptions,
} from "../package/packageFormOptions";

const { Text } = Typography;

const typeLabelMap = Object.fromEntries(
  typeOptions.map((item) => [item.value, item.label]),
);

const curriculumLabelMap = Object.fromEntries(
  generalProgramOptions.map((item) => [item.value, item.label]),
);

const certificateLabelMap = Object.fromEntries(
  certificateOptions.map((item) => [item.value, item.label]),
);

const normalizeEnrollmentRows = (detail = {}) => {
  const enrollments = Array.isArray(detail?.enrollments)
    ? detail.enrollments
    : Array.isArray(detail?.studentPackages)
      ? detail.studentPackages
      : Array.isArray(detail?.packageEnrollments)
        ? detail.packageEnrollments
        : [];

  const remainingByPackage = Array.isArray(detail?.remainingByPackage)
    ? detail.remainingByPackage
    : Array.isArray(detail?.remainingSessionsByPackage)
      ? detail.remainingSessionsByPackage
      : [];

  const packageMap = new Map(
    (detail?.packages ?? []).map((pkg) => [pkg.id, pkg]),
  );

  const rawRows =
    enrollments.length > 0
      ? enrollments
      : remainingByPackage.length > 0
        ? remainingByPackage
        : [];

  return rawRows.map((item, index) => {
    const fallbackPackage = packageMap.get(item?.packageId);
    const packageData = item?.package ?? fallbackPackage;
    const packageInfo = packageData?.info ?? {};

    return {
      id: item?.id ?? `${item?.packageId || packageData?.id || index}`,
      packageId: item?.packageId ?? packageData?.id,
      packageName: packageData?.name || item?.packageName || "—",
      packageType: packageData?.type,
      curriculum: packageInfo?.curriculum,
      certificateType: packageInfo?.certificateType,
      comboType: packageInfo?.comboType,
      totalSessions: packageData?.totalSessions,
      remainingSessions: Number(item?.remainingSessions ?? 0),
      createdAt: item?.createdAt,
      updatedAt: item?.updatedAt,
    };
  });
};

const StudentRemainingSessionsModal = ({ open, onClose, student }) => {
  const { message } = App.useApp();

  const swrKey = open && student?.id ? ["student-remaining", student.id] : null;

  const { data, isLoading, error } = useSWR(
    swrKey,
    async () => {
      const response = await studentService.detail(student.id);
      return response?.data ?? {};
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    },
  );

  useEffect(() => {
    if (error) {
      message.error(error?.message || "Không thể tải dữ liệu buổi còn lại");
    }
  }, [error, message]);

  const rows = useMemo(() => normalizeEnrollmentRows(data), [data]);

  const columns = [
    {
      title: "STT",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Gói học",
      dataIndex: "packageName",
      key: "packageName",
      render: (value) => value || "—",
    },
    {
      title: "Loại gói",
      dataIndex: "packageType",
      key: "packageType",
      render: (value) => typeLabelMap[value] || "—",
    },
    {
      title: "Phân loại",
      key: "category",
      render: (_, record) => {
        if (record.packageType === "general") {
          if (!record.curriculum) return "—";
          if (record.curriculum === "english") {
            return (
              <Tag color="blue">{curriculumLabelMap[record.curriculum]}</Tag>
            );
          }
          if (record.curriculum === "chinese") {
            return (
              <Tag color="volcano">{curriculumLabelMap[record.curriculum]}</Tag>
            );
          }
          return (
            <Tag>
              {curriculumLabelMap[record.curriculum] || record.curriculum}
            </Tag>
          );
        }

        if (record.packageType === "certificate") {
          if (!record.certificateType) return "—";
          return (
            <Tag color="purple">
              {certificateLabelMap[record.certificateType] ||
                record.certificateType}
            </Tag>
          );
        }

        return "—";
      },
    },
    {
      title: "Combo",
      dataIndex: "comboType",
      key: "comboType",
      render: (value) => comboTypeLabels[value] || "—",
    },
    {
      title: "Tổng buổi",
      dataIndex: "totalSessions",
      key: "totalSessions",
      align: "right",
      render: (value) => value ?? "—",
    },
    {
      title: "Buổi còn lại",
      dataIndex: "remainingSessions",
      key: "remainingSessions",
      align: "right",
      render: (value) => <Text strong>{value ?? 0}</Text>,
    },
  ];

  return (
    <Modal
      title={`Buổi còn lại${student?.name ? ` - ${student.name}` : ""}`}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={900}
      destroyOnClose
    >
      <Table
        rowKey="id"
        dataSource={rows}
        columns={columns}
        loading={isLoading}
        bordered
        size="middle"
        pagination={false}
        locale={{ emptyText: "Không có dữ liệu buổi còn lại" }}
      />
    </Modal>
  );
};

export default StudentRemainingSessionsModal;
