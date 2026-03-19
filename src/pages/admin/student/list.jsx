import { useState } from "react";
import { Select, Space, Table, Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
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

const { Title } = Typography;

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
    packageId,
    setPackageId,
    fetchData,
    handleDelete,
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
  );

  const { data: packageOptions = [] } = useSWR(
    ["student-package-options"],
    async () => {
      const response = await packageService.list({ page: 1, limit: 1000 });
      return (response?.data?.items ?? []).map((item) => ({
        label: item.name,
        value: item.id,
      }));
    },
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [renewingStudent, setRenewingStudent] = useState(null);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceStudent, setAttendanceStudent] = useState(null);

  const handleSearch = (keyword) => {
    setPage(1);
    setSearch(keyword || null);
  };

  const openCreate = () => {
    if (!canManage) return;
    setEditing(null);
    setModalOpen(true);
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

  const handleSaved = ({ created }) => {
    if (created) {
      if (page === 1) fetchData();
      else setPage(1);
    } else {
      fetchData();
    }
  };

  const openAttendance = (record) => {
    setAttendanceStudent(record);
    setAttendanceModalOpen(true);
  };

  const columns = buildColumns({
    page,
    limit,
    onEdit: openEdit,
    onRenew: openRenew,
    onDelete: handleDelete,
    onViewAttendances: openAttendance,
    canManage,
  });

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Title level={2} className="mb-0!">
          Danh sách học viên
        </Title>
        {canManage ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Thêm mới
          </Button>
        ) : null}
      </div>

      <div className="mb-4">
        <Space wrap size="middle">
          <InputSearch
            value={search ?? ""}
            onSearch={handleSearch}
            placeholder="Tìm theo tên hoặc số điện thoại..."
            className="max-w-xs"
          />
          <Select
            value={branchId ?? ""}
            options={[{ label: "Tất cả cơ sở", value: "" }, ...branchOptions]}
            onChange={(value) => {
              setPage(1);
              setBranchId(value || null);
            }}
            className="w-56"
            showSearch
            optionFilterProp="label"
          />
          <Select
            value={packageId ?? ""}
            options={[
              { label: "Tất cả gói học", value: "" },
              ...packageOptions,
            ]}
            onChange={(value) => {
              setPage(1);
              setPackageId(value || null);
            }}
            className="w-56"
            showSearch
            optionFilterProp="label"
          />
        </Space>
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
    </>
  );
};

export default ListStudent;
