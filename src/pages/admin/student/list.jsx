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
import CycleReportModal from "./CycleReportModal";
import classService from "../../../services/classService";
import studentService from "../../../services/studentService";
import DetailModal from "./DetailModal";
import Heading from "../../../components/common/Heading";
import { typeOptions } from "../package/packageFormOptions";

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
const birthMonthOptions = [
  { label: "Lọc tháng sinh", value: "" },
  { label: "Tháng 1", value: "1" },
  { label: "Tháng 2", value: "2" },
  { label: "Tháng 3", value: "3" },
  { label: "Tháng 4", value: "4" },
  { label: "Tháng 5", value: "5" },
  { label: "Tháng 6", value: "6" },
  { label: "Tháng 7", value: "7" },
  { label: "Tháng 8", value: "8" },
  { label: "Tháng 9", value: "9" },
  { label: "Tháng 10", value: "10" },
  { label: "Tháng 11", value: "11" },
  { label: "Tháng 12", value: "12" },
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
    packageType,
    setPackageType,
    birthMonth,
    setBirthMonth,
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
  const [openCycleReportModal, setOpenCycleReportModal] = useState(false);
  const [cycleReportData, setCycleReportData] = useState(null);
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
  // const handleUpdateCycleStartDate = async (studentId, value) => {
  //   const cycleStartDate = value ? dayjs(value).format("YYYY-MM-DD") : null;
  //   try {
  //     await studentService.updateCycleStartDate(studentId, cycleStartDate);
  //     mutate((prev) => {
  //       if (!prev) return prev;
  //       const nextItems = (prev.items || []).map((student) =>
  //         student.id === studentId ? { ...student, cycleStartDate } : student,
  //       );
  //       return { ...prev, items: nextItems };
  //     }, false);
  //     setDetailStudent((prev) =>
  //       prev?.id === studentId ? { ...prev, cycleStartDate } : prev,
  //     );
  //     message.success("Cập nhật ngày bắt đầu chu kỳ thành công");
  //   } catch (err) {
  //     message.error(
  //       err?.response?.data?.message || "Cập nhật ngày bắt đầu chu kỳ thất bại",
  //     );
  //   }
  // };
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

  const handleApplyCycles = async ({ classId, studentId }) => {
    try {
      const params = { classId };
      if (studentId) {
        params.studentId = studentId;
      }
      const response = await studentService.getCycles(params);

      setCycleReportData(response?.data ?? null);
      setOpenCycleReportModal(true);
      setOpenCyclesModal(false);
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Lấy dữ liệu chu kỳ học thất bại",
      );
    }
  };
  const handleUpdateZaloName = async (parentId, zaloName) => {
    try {
      if (!parentId) return;

      await studentService.updateParentZaloName(parentId, zaloName);
      mutate((prev) => {
        if (!prev) return prev;
        const nextItems = (prev.items || []).map((student) => {
          if (!student.parents) return student;
          const nextParents = student.parents.map((parent) =>
            parent.id === parentId ? { ...parent, zaloName } : parent,
          );
          return { ...student, parents: nextParents };
        });
        return { ...prev, items: nextItems };
      }, false);
      setDetailStudent((prev) => {
        if (!prev || !prev.parents) return prev;
        const nextParents = prev.parents.map((parent) =>
          parent.id === parentId ? { ...parent, zaloName } : parent,
        );
        return { ...prev, parents: nextParents };
      });
      message.success("Cập nhật Zalo phụ huynh thành công");
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Cập nhật Zalo phụ huynh thất bại",
      );
    }
  };
  const handleResetFilters = () => {
    setSearch(null);
    setBranchId(null);
    setClassId(null);
    setIsCalled(null);
    setIsTexted(null);
    setPackageType(null);
    setBirthMonth(null);
    setPage(1);
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
    onUpdateZaloName: handleUpdateZaloName,
    // onUpdateCycleStartDate: handleUpdateCycleStartDate,
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
          <div className="w-full sm:w-56 md:w-80">
            <Select
              options={[
                { label: "Tất cả loại gói", value: "" },
                ...typeOptions,
              ]}
              placeholder="Chọn loại gói"
              value={packageType ?? ""}
              onChange={(value) => {
                setPage(1);
                setPackageType(value || null);
              }}
              showSearch
              optionFilterProp="label"
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-56 md:w-80">
            <Select
              options={birthMonthOptions}
              placeholder="Chọn tháng sinh"
              value={birthMonth ?? ""}
              onChange={(value) => {
                setPage(1);
                setBirthMonth(value || null);
              }}
              showSearch
              optionFilterProp="label"
              className="w-full"
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
              onClick={handleResetFilters}
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
          mutate();
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
      <CycleReportModal
        open={openCycleReportModal}
        data={cycleReportData}
        onClose={() => setOpenCycleReportModal(false)}
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
