import { useState } from "react";
import {
  Select,
  Space,
  Table,
  Button,
  Typography,
  message,
  Modal,
  Tag,
} from "antd";
import dayjs from "dayjs";
import {
  DownOutlined,
  ImportOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import useSWR from "swr";
import InputSearch from "../../../components/common/InputSearch";
import branchService from "../../../services/branchService";
import packageService from "../../../services/packageService";
import useAuthStore from "../../../store/authStore";
import { ROLES } from "../../../utils/constants";
import { useStudentList } from "./useStudentList";
import { buildColumns } from "./_columns";
import StudentFormModal from "./StudentFormModal";
import RenewCourseModal from "./RenewCourseModal";
import StudentAttendanceModal from "./StudentAttendanceModal";
import StudentRemainingSessionsModal from "./StudentRemainingSessionsModal";
import CyclesModal from "./CyclesModal";
import classService from "../../../services/classService";
import studentService from "../../../services/studentService";
import DetailModal from "./DetailModal";
import Heading from "../../../components/common/Heading";

const { Title } = Typography;
const calledOptions = [
  { label: "Thông báo gọi điện", value: "" },
  { label: "Đã gọi", value: 1 },
  { label: "Chưa gọi", value: 0 },
];
const textedOptions = [
  { label: "Thông báo nhắn tin", value: "" },
  { label: "Đã nhắn tin", value: 1 },
  { label: "Chưa nhắn tin", value: 0 },
];

const ListStudent = () => {
  const {
    items,
    total,
    loading,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    branchId,
    setBranchId,
    classId,
    setClassId,
    isCalled,
    setIsCalled,
    isTexted,
    setIsTexted,
    fetchData,
    handleDelete,
    mutate,
  } = useStudentList();

  const userRole = useAuthStore((s) => s.user?.role);
  const canManage = userRole === ROLES.ADMIN;

  const { data: branchOptions = [] } = useSWR(
    ["student-branch-options"],
    async () => {
      const response = await branchService.list({ page: 1, limit: 1000 });
      return (response?.data?.items ?? []).map((branch) => ({
        label: branch.name,
        value: branch.id,
      }));
    },
    {
      revalidateOnFocus: false,
    },
  );

  const { data: packageOptions = [] } = useSWR(
    ["student-package-options"],
    async () => {
      const response = await packageService.list({ page: 1, limit: 1000 });
      return (response?.data?.items ?? []).map((item) => ({
        label: item.name,
        value: item.id,
        name: item.name,
        type: item.type,
        totalSessions: item.totalSessions,
        price: item.price,
        info: item.info,
      }));
    },
  );
  const { data: classOptions = [] } = useSWR(
    ["student-class-options", branchId],
    async () => {
      const response = await classService.list({
        page: 1,
        limit: 1000,
        branchId: branchId || undefined,
      });
      return (response?.data?.items ?? []).map((item) => ({
        label: `${item.name} (${item.branch?.name || "N/A"})`,
        value: item.id,
        branchId: item.branch?.id ?? null,
      }));
    },
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [renewingStudent, setRenewingStudent] = useState(null);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceStudent, setAttendanceStudent] = useState(null);
  const [remainingModalOpen, setRemainingModalOpen] = useState(false);
  const [remainingStudent, setRemainingStudent] = useState(null);
  //
  const [openCyclesModal, setOpenCyclesModal] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailStudent, setDetailStudent] = useState(null);

  const handleSearch = (keyword) => {
    setPage(1);
    setSearch(keyword || null);
  };

  const openCreate = () => {
    if (!canManage) return;
    setEditing(null);
    setModalOpen(true);
  };
  const openViewCycles = () => {
    if (!canManage) return;
    setOpenCyclesModal(true);
  };

  const openEdit = (record) => {
    if (!canManage) return;
    setEditing(record);
    setModalOpen(true);
  };

  const openRenew = (record) => {
    if (!canManage) return;
    setRenewingStudent(record);
    setRenewModalOpen(true);
  };

  const openDetail = (record) => {
    setDetailStudent(record);
    setDetailOpen(true);
  };

  const handleSaved = ({ created }) => {
    if (created) {
      if (page === 1) fetchData();
      else setPage(1);
    } else {
      fetchData();
    }
  };
  const handleUpdateCycleStartDate = async (studentId, value) => {
    const cycleStartDate = value ? dayjs(value).format("YYYY-MM-DD") : null;
    try {
      await studentService.updateCycleStartDate(studentId, cycleStartDate);
      mutate((prev) => {
        if (!prev) return prev;
        const nextItems = (prev.items || []).map((student) =>
          student.id === studentId ? { ...student, cycleStartDate } : student,
        );
        return { ...prev, items: nextItems };
      }, false);
      setDetailStudent((prev) =>
        prev?.id === studentId ? { ...prev, cycleStartDate } : prev,
      );
      message.success("Cập nhật ngày bắt đầu chu kỳ thành công");
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Cập nhật ngày bắt đầu chu kỳ thất bại",
      );
    }
  };
  const handleUpdateNotifications = async (id, type, value) => {
    // Optimistic UI update: update SWR cache without refetching list API
    mutate((prev) => {
      if (!prev) return prev;
      const nextItems = (prev.items || []).map((student) =>
        student.id === id ? { ...student, [type]: value } : student,
      );
      return { ...prev, items: nextItems };
    }, false);

    try {
      if (type === "isCalled") {
        await studentService.toggleIsCalled(id, value);
      } else if (type === "isTexted") {
        await studentService.toggleIsTexted(id, value);
      }
    } catch (err) {
      // Revert optimistic update on error
      mutate();
      message.error(err?.message || "Cập nhật trạng thái thất bại");
    }
  };

  const openAttendance = (record) => {
    setAttendanceStudent(record);
    setAttendanceModalOpen(true);
  };

  const openRemainingSessions = (record) => {
    setRemainingStudent(record);
    setRemainingModalOpen(true);
  };

  const handleApplyCycles = async ({ classId, studentIds }) => {
    try {
      const params = {};
      if (classId) {
        params.classId = classId;
      }
      if (studentIds && studentIds.length > 0) {
        params.studentIds = studentIds.map((id) => String(id));
      }
      const response = await studentService.getCycles(params);
      console.log("getCycles response", response);
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Lấy dữ liệu chu kỳ học thất bại",
      );
    }
  };

  const columns = buildColumns({
    page,
    limit,
    onEdit: openEdit,
    onRenew: openRenew,
    onDelete: handleDelete,
    onViewAttendances: openAttendance,
    onViewRemainingSessions: openRemainingSessions,
    onViewDetail: openDetail,
    onUpdateNotifications: handleUpdateNotifications,
    onUpdateCycleStartDate: handleUpdateCycleStartDate,
    canManage,
  });

  return (
    <>
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <Heading title="Danh sách học viên" />
        {canManage ? (
          <div className="flex gap-3 flex-wrap">
            <Button
              type="dashed"
              className="bg-red-600! text-white!"
              icon={<ImportOutlined />}
              onClick={openViewCycles}
            >
              Xem chu kỳ học
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Thêm mới
            </Button>
          </div>
        ) : null}
      </div>

      <div className="mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-4">
          {/* Search */}
          <div className="w-full md:max-w-xs">
            <InputSearch
              value={search ?? ""}
              onSearch={handleSearch}
              placeholder="Tìm theo tên hoặc số điện thoại..."
              className="w-full"
            />
          </div>

          {/* Branch */}
          <div className="w-full sm:w-56">
            <Select
              value={branchId ?? ""}
              options={[{ label: "Tất cả cơ sở", value: "" }, ...branchOptions]}
              onChange={(value) => {
                setPage(1);
                setBranchId(value || null);
              }}
              className="w-full"
              showSearch
              optionFilterProp="label"
            />
          </div>

          {/* Class */}
          <div className="w-full sm:w-72 md:w-80">
            <Select
              value={classId ?? ""}
              options={[
                { label: "Tất cả lớp học", value: "" },
                ...classOptions,
              ]}
              onChange={(value) => {
                setPage(1);
                setClassId(value || null);
              }}
              className="w-full"
              showSearch
              optionFilterProp="label"
            />
          </div>

          {/* Called */}
          <div className="w-full sm:w-56">
            <Select
              value={isCalled ?? ""}
              options={calledOptions}
              onChange={(value) => {
                setPage(1);
                setIsCalled(value);
              }}
              className="w-full"
            />
          </div>

          {/* Texted */}
          <div className="w-full sm:w-56">
            <Select
              value={isTexted ?? ""}
              options={textedOptions}
              onChange={(value) => {
                setPage(1);
                setIsTexted(value);
              }}
              className="w-full"
            />
          </div>

          {/* Reset */}
          <div className="w-full sm:w-auto">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearch(null);
                setBranchId(null);
                setClassId(null);
                setIsCalled(null);
                setIsTexted(null);
                setPage(1);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg font-medium bg-gray-100! hover:bg-gray-200!"
            >
              Đặt lại
            </Button>
          </div>
        </div>
      </div>

      <Table
        rowKey="id"
        dataSource={items}
        columns={columns}
        loading={loading}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: true,
          showTotal: (value) => `Tổng ${value} học viên`,
          pageSizeOptions: ["10", "20", "50"],
          onChange: (nextPage, nextLimit) => {
            setPage(nextPage);
            setLimit(nextLimit);
          },
        }}
        bordered
        size="middle"
        scroll={{ x: "max-content" }}
      />

      <StudentFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSaved={handleSaved}
        branchOptions={branchOptions}
        packageOptions={packageOptions}
      />

      <RenewCourseModal
        open={renewModalOpen}
        onClose={() => {
          setRenewModalOpen(false);
          setRenewingStudent(null);
        }}
        student={renewingStudent}
        packageOptions={packageOptions}
        onSaved={fetchData}
      />

      <StudentAttendanceModal
        open={attendanceModalOpen}
        onClose={() => {
          setAttendanceModalOpen(false);
          setAttendanceStudent(null);
        }}
        student={attendanceStudent}
      />

      <StudentRemainingSessionsModal
        open={remainingModalOpen}
        onClose={() => {
          setRemainingModalOpen(false);
          setRemainingStudent(null);
        }}
        student={remainingStudent}
      />
      <CyclesModal
        open={openCyclesModal}
        branchOptions={branchOptions}
        classOptions={classOptions}
        initialBranchId={branchId}
        initialClassId={classId}
        onClose={() => setOpenCyclesModal(false)}
        onApply={handleApplyCycles}
      />
      <DetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        detailStudent={detailStudent}
      />
    </>
  );
};

export default ListStudent;
