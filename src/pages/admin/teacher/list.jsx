import { useState } from "react";
import { Select, Space, Table, Button, Typography, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import useSWR from "swr";
import InputSearch from "../../../components/common/InputSearch";
import branchService from "../../../services/branchService";
import { useTeacherList } from "./useTeacherList";
import { buildColumns } from "./_columns";
import TeacherFormModal from "./TeacherFormModal";
import Heading from "../../../components/common/Heading";
import ResetPasswordModal from "./ResetPasswordModal";
import authService from "../../../services/authService";

const { Title } = Typography;

const statusOptions = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Hoạt động", value: "active" },
  { label: "Ngừng hoạt động", value: "inactive" },
];
const roleOptions = [
  { label: "Tất cả loại nhân sự", value: "" },
  { label: "Giáo viên", value: "teacher" },
  { label: "Lễ tân", value: "receptionist" },
];

const ListTeacher = () => {
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
    status,
    setStatus,
    branchId,
    setBranchId,
    fetchData,
    handleDelete,
    role,
    setRole,
  } = useTeacherList();

  const { data: branchOptions = [] } = useSWR(
    ["teacher-branch-options"],
    async () => {
      const response = await branchService.list({ page: 1, limit: 1000 });
      return (response?.data?.items ?? []).map((branch) => ({
        label: branch.name,
        value: branch.id,
      }));
    },
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);

  const allBranchOptions = [
    { label: "Tất cả cơ sở", value: "" },
    ...branchOptions,
  ];

  const handleSearch = (keyword) => {
    setPage(1);
    setSearch(keyword || null);
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setModalOpen(true);
  };
  const onResetPassword = (record) => {
    setEditing(record);
    setResetPasswordModalOpen(true);
  };

  const handleSaved = ({ created }) => {
    if (created) {
      if (page === 1) fetchData();
      else setPage(1);
    } else {
      fetchData();
    }
  };
  const handleResetPassword = async (data) => {
    try {
      const payload = {
        teacherId: data.id,
        newPassword: data.newPassword,
      };
      await authService.changePasswordAdmin(payload);
      message.success("Đặt lại mật khẩu thành công");
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Đặt lại mật khẩu thất bại",
      );
    }
  };

  const columns = buildColumns({
    page,
    limit,
    onEdit: openEdit,
    onDelete: handleDelete,
    onResetPassword: onResetPassword,
  });

  return (
    <>
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <Heading title="Danh sách nhân sự" />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm mới
        </Button>
      </div>

      <div className="mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
          {/* Search */}
          <div className="w-full md:max-w-xs">
            <InputSearch
              value={search ?? ""}
              onSearch={handleSearch}
              placeholder="Tìm theo tên hoặc tên đăng nhập..."
              className="w-full"
            />
          </div>

          {/* Status */}
          <div className="w-full md:w-56">
            <Select
              value={status ?? ""}
              options={statusOptions}
              onChange={(value) => {
                setPage(1);
                setStatus(value || null);
              }}
              className="w-full"
            />
          </div>

          {/* Branch */}
          <div className="w-full md:w-56">
            <Select
              value={branchId ?? ""}
              options={allBranchOptions}
              onChange={(value) => {
                setPage(1);
                setBranchId(value || null);
              }}
              className="w-full"
              showSearch
              optionFilterProp="label"
            />
          </div>

          <div className="w-full md:w-56">
            <Select
              value={role ?? ""}
              options={roleOptions}
              onChange={(value) => {
                setPage(1);
                setRole(value || null);
              }}
              className="w-full"
            />
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
          showTotal: (value) => `Tổng ${value} giáo viên`,
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

      <TeacherFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSaved={handleSaved}
        branchOptions={branchOptions}
      />
      {/* Reset Password Modal */}
      <ResetPasswordModal
        open={resetPasswordModalOpen}
        onClose={() => setResetPasswordModalOpen(false)}
        teacher={editing}
        onOk={handleResetPassword}
      />
    </>
  );
};

export default ListTeacher;
