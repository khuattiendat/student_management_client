import { useState } from "react";
import { Select, Table, Button, Typography, message } from "antd";
import {
  ExportOutlined,
  ImportOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import ExcelJS from "exceljs";
import dayjs from "dayjs";
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
const isPaidOptions = [
  { label: "Tất cả trạng thái thanh toán", value: "" },
  { label: "Đã thanh toán", value: 1 },
  { label: "Chưa thanh toán", value: 0 },
];
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

const EXPORT_LIMIT = 1000000;

const normalizeText = (value) =>
  value === null || value === undefined ? "" : String(value);

const joinNames = (items = [], selector = (item) => item?.name) =>
  items
    .map((item) => normalizeText(selector(item)).trim())
    .filter(Boolean)
    .join(" | ");

const buildStudentExportRows = (students = []) =>
  students.map((student, index) => ({
    stt: index + 1,
    id: normalizeText(student?.id),
    name: normalizeText(student?.name),
    phone: normalizeText(student?.phone),
    birthday: student?.birthday
      ? dayjs(student.birthday).format("DD/MM/YYYY")
      : "",
    branch: normalizeText(student?.branch?.name),
    addressDetail: normalizeText(student?.addressDetail),
    wardName: normalizeText(student?.wardName),
    districtName: normalizeText(student?.districtName),
    provinceName: normalizeText(student?.provinceName),
    parents: joinNames(student?.parents, (parent) => parent?.name),
    parentPhones: joinNames(student?.parents, (parent) => parent?.phone),
    parentEmails: joinNames(student?.parents, (parent) => parent?.email),
    parentZaloNames: joinNames(student?.parents, (parent) => parent?.zaloName),
    classNames: joinNames(
      student?.classStudents,
      (item) => item?.classEntity?.name,
    ),
    packageNames: joinNames(student?.packages, (item) => item?.name),
    learnedSessions: student?.learnedSessions ?? 0,
    remainingSessions: student?.remainingSessions ?? 0,
    isCalled: student?.isCalled ? "Đã gọi" : "Chưa gọi",
    isTexted: student?.isTexted ? "Đã nhắn tin" : "Chưa nhắn tin",
  }));

const downloadExcelBuffer = async (workbook, fileName) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

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
    isPaid,
    setIsPaid,
  } = useStudentList();

  const userRole = useAuthStore((s) => s.user?.role);
  const canManage = userRole === ROLES.ADMIN;
  const [exporting, setExporting] = useState(false);

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
    // if (!canManage) return;
    setEditing(null);
    setModalOpen(true);
  };
  const openViewCycles = () => {
    // if (!canManage) return;
    setOpenCyclesModal(true);
  };

  const openEdit = (record) => {
    // if (!canManage) return;
    setEditing(record);
    setModalOpen(true);
  };

  const openRenew = (record) => {
    // if (!canManage) return;
    setRenewingStudent(record);
    setRenewModalOpen(true);
  };

  const openDetail = (record) => {
    setDetailStudent(record);
    setDetailOpen(true);
  };

  const handleExportStudents = async () => {
    try {
      setExporting(true);

      const response = await studentService.list({
        page: 1,
        limit: EXPORT_LIMIT,
      });

      const students = response?.data?.items ?? [];

      if (!students.length) {
        message.warning("Không có học viên nào để xuất file Excel");
        return;
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Student Management";
      workbook.created = new Date();
      workbook.modified = new Date();
      workbook.properties.date1904 = false;

      const worksheet = workbook.addWorksheet("HocVien", {
        views: [{ state: "frozen", ySplit: 3 }],
        pageSetup: {
          orientation: "landscape",
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
        },
      });

      const columns = [
        { header: "STT", key: "stt", width: 8 },
        { header: "Mã học viên", key: "id", width: 16 },
        { header: "Họ tên", key: "name", width: 24 },
        { header: "Số điện thoại", key: "phone", width: 18 },
        { header: "Ngày sinh", key: "birthday", width: 14 },
        { header: "Cơ sở", key: "branch", width: 22 },
        { header: "Địa chỉ chi tiết", key: "addressDetail", width: 24 },
        { header: "Phường/Xã", key: "wardName", width: 18 },
        { header: "Quận/Huyện", key: "districtName", width: 18 },
        { header: "Tỉnh/Thành", key: "provinceName", width: 18 },
        { header: "Tên phụ huynh", key: "parents", width: 24 },
        { header: "SĐT phụ huynh", key: "parentPhones", width: 20 },
        { header: "Email phụ huynh", key: "parentEmails", width: 28 },
        { header: "Zalo phụ huynh", key: "parentZaloNames", width: 24 },
        { header: "Lớp học", key: "classNames", width: 24 },
        { header: "Gói học", key: "packageNames", width: 24 },
        { header: "Số buổi đã học", key: "learnedSessions", width: 16 },
        { header: "Buổi còn lại", key: "remainingSessions", width: 14 },
        { header: "Đã gọi", key: "isCalled", width: 12 },
        { header: "Đã nhắn tin", key: "isTexted", width: 14 },
      ];

      const headerRowIndex = 3;
      const dataRows = buildStudentExportRows(students);

      worksheet.columns = columns;
      worksheet.mergeCells(1, 1, 1, columns.length);
      worksheet.getCell(1, 1).value = "DANH SÁCH HỌC VIÊN";
      worksheet.getCell(1, 1).font = {
        bold: true,
        size: 16,
        color: { argb: "FFFFFFFF" },
      };
      worksheet.getCell(1, 1).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getCell(1, 1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F4E78" },
      };

      worksheet.mergeCells(2, 1, 2, columns.length);
      worksheet.getCell(2, 1).value =
        `Tổng ${students.length} học viên | Xuất lúc ${dayjs().format("HH:mm DD/MM/YYYY")}`;
      worksheet.getCell(2, 1).font = {
        italic: true,
        color: { argb: "FF475569" },
      };
      worksheet.getCell(2, 1).alignment = {
        horizontal: "left",
        vertical: "middle",
      };

      const headerRow = worksheet.getRow(headerRowIndex);
      headerRow.values = columns.map((column) => column.header);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      headerRow.height = 24;
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF2563EB" },
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FFD1D5DB" } },
          left: { style: "thin", color: { argb: "FFD1D5DB" } },
          bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
          right: { style: "thin", color: { argb: "FFD1D5DB" } },
        };
      });

      dataRows.forEach((row, index) => {
        const excelRow = worksheet.addRow(row);
        excelRow.height = 22;
        excelRow.alignment = { vertical: "middle", wrapText: true };

        excelRow.eachCell((cell, columnNumber) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFE5E7EB" } },
            left: { style: "thin", color: { argb: "FFE5E7EB" } },
            bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
            right: { style: "thin", color: { argb: "FFE5E7EB" } },
          };

          cell.alignment = {
            vertical: "middle",
            wrapText: true,
            horizontal:
              columnNumber === 1 || columnNumber >= 17 ? "center" : "left",
          };

          if (index % 2 === 1) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF8FAFC" },
            };
          }
        });
      });

      worksheet.autoFilter = {
        from: `A${headerRowIndex}`,
        to: `${String.fromCharCode(64 + columns.length)}${headerRowIndex}`,
      };

      await downloadExcelBuffer(
        workbook,
        `danh-sach-hoc-vien-${dayjs().format("YYYYMMDD-HHmmss")}.xlsx`,
      );

      message.success("Xuất file Excel thành công");
    } catch (err) {
      message.error(err?.message || "Xuất file Excel thất bại");
    } finally {
      setExporting(false);
    }
  };

  const handleSaved = ({ created }) => {
    if (created) {
      if (page === 1) fetchData();
      else setPage(1);
    } else {
      fetchData();
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
    setIsPaid(null);
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
        <div className="flex gap-3 flex-wrap">
          <Button
            className="bg-green-600! text-white!"
            icon={<ExportOutlined />}
            onClick={handleExportStudents}
            loading={exporting}
          >
            Export Excel
          </Button>
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
          {/* isPaid */}
          <div className="w-full sm:w-56">
            <Select
              value={isPaid ?? ""}
              options={isPaidOptions}
              onChange={(value) => {
                setPage(1);
                setIsPaid(value);
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
        packageOptions={packageOptions}
        onUpdated={(updatedStudent) => {
          if (updatedStudent) {
            setDetailStudent(updatedStudent);
          }
          fetchData();
        }}
      />
    </>
  );
};

export default ListStudent;
