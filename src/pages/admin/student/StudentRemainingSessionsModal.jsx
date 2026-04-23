import { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Input,
  Modal,
  Popconfirm,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import useSWR from "swr";
import studentService from "../../../services/studentService";
import { comboTypeLabels } from "../package/_columns";
import {
  certificateOptions,
  generalProgramOptions,
  typeOptions,
} from "../package/packageFormOptions";
import {
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import useAuthStore from "../../../store/authStore";
import { ROLES } from "../../../utils/constants";

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
  const userRole = useAuthStore((s) => s.user?.role);
  const isAdmin = userRole === ROLES.ADMIN;
  const { message } = App.useApp();
  const [inputValue, setInputValue] = useState("");

  const swrKey = open && student?.id ? ["student-remaining", student.id] : null;

  const { data, isLoading, error, mutate } = useSWR(
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
  const handleToggleIsPaid = async (record) => {
    try {
      const enrollment = data?.enrollments?.find(
        (enroll) => enroll.packageId === record.packageId,
      );
      if (!enrollment) {
        message.error(
          "Không tìm thấy enrollment tương ứng để cập nhật trạng thái đóng tiền.",
        );
        return;
      }

      await studentService.updateIsPaidEnrollment(
        student.id,
        enrollment.id,
        !enrollment.isPaid,
      );
      message.success("Cập nhật trạng thái đóng tiền thành công");
      mutate();
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          "Cập nhật trạng thái đóng tiền thất bại",
      );
    }
  };
  const handleUpdateRemainingSessions = async (record) => {
    try {
      if (!inputValue || isNaN(inputValue)) {
        message.error("Vui lòng nhập số buổi hợp lệ");
        return;
      }

      const enrollment = data?.enrollments?.find(
        (enroll) => enroll.packageId === record.packageId,
      );
      if (!enrollment) {
        message.error(
          "Không tìm thấy enrollment tương ứng để cập nhật số buổi còn lại.",
        );
        return;
      }
      await studentService.updateRemainingSessions(
        enrollment.id,
        Number(inputValue),
      );
      message.success("Cập nhật số buổi còn lại thành công");
      setInputValue("");
      mutate();
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Cập nhật số buổi còn lại thất bại",
      );
    }
  };
  const handleDeletePackage = async (record) => {
    try {
      const enrollmentId = record?.id;
      if (!enrollmentId) {
        message.error("Không tìm thấy enrollment tương ứng để xóa.");
        return;
      }
      await studentService.deleteEnrollment(enrollmentId);
      message.success("Xóa gói học thành công");
      mutate();
    } catch (error) {
      message.error(error?.response?.data?.message || "Xóa gói học thất bại");
    }
  };
  ``;

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
        if (record.packageType === "school_subject") {
          return <Tag color="gold">Gói môn học</Tag>;
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
    {
      title: "Trạng thái đóng tiền",
      key: "isPaid",
      render: (_, record) => {
        const isPaid = data?.enrollments?.find(
          (enroll) => enroll.packageId === record.packageId,
        )?.isPaid;

        if (isPaid === undefined) return "—";
        return (
          <>
            <Tag color={isPaid ? "green" : "red"}>
              {isPaid ? "Đã đóng" : "Chưa đóng"}
            </Tag>
            <Popconfirm
              title="Xác nhận thay đổi trạng thái đóng tiền"
              description={`Bạn có chắc muốn đánh dấu gói "${record.packageName}" là ${isPaid ? "chưa đóng" : "đã đóng"}?`}
              okText="Xác nhận"
              cancelText="Hủy"
              onConfirm={() => handleToggleIsPaid(record)}
            >
              <Tooltip title="Thay đổi trạng thái đóng tiền">
                <Button type="text" icon={<EditOutlined />} />
              </Tooltip>
            </Popconfirm>
            {isAdmin && (
              <>
                <Popconfirm
                  title="Sửa số buổi còn lại"
                  description={
                    <div>
                      <Input
                        type="number"
                        placeholder="Nhập số buổi"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        autoFocus
                      />
                    </div>
                  }
                  okText="Xác nhận"
                  cancelText="Hủy"
                  onOpenChange={(visible) => {
                    if (visible) {
                      setInputValue(record.remainingSessions.toString());
                    } else {
                      setInputValue("");
                    }
                  }}
                  onConfirm={() => handleUpdateRemainingSessions(record)}
                >
                  <Tooltip title="Chỉnh sửa số buổi còn lại">
                    <Button type="text" icon={<ReloadOutlined />} />
                  </Tooltip>
                </Popconfirm>
                <Popconfirm
                  title="Xóa gói học"
                  description={`Bạn có chắc muốn xóa gói "${record.packageName}"?`}
                  okText="Xác nhận"
                  cancelText="Hủy"
                  onConfirm={() => handleDeletePackage(record)}
                >
                  <Tooltip title="Xóa gói học">
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>
              </>
            )}
          </>
        );
      },
    },
  ];

  return (
    <Modal
      title={`Buổi còn lại${student?.name ? ` - ${student.name}` : ""}`}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={1200}
      destroyOnHidden
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
        scroll={{ x: "max-content" }}
      />
    </Modal>
  );
};

export default StudentRemainingSessionsModal;
