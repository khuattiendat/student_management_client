import { useState } from "react";
import { Select, Space, Table, Button, Typography, Modal } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import useSWR from "swr";
import InputSearch from "../../../components/common/InputSearch";
import branchService from "../../../services/branchService";
import teacherService from "../../../services/teacherService";
import packageService from "../../../services/packageService";
import studentService from "../../../services/studentService";
import useAuthStore from "../../../store/authStore";
import { ROLES } from "../../../utils/constants";
import { useClassList } from "./useClassList";
import { buildColumns } from "./_columns";
import ClassFormModal from "./ClassFormModal";

const { Title } = Typography;

const packageTypeLabels = {
  general: "Phổ thông",
  certificate: "Chứng chỉ",
  school_subject: "Các môn trên trường",
};

const statusOptions = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Hoạt động", value: "active" },
  { label: "Ngừng hoạt động", value: "inactive" },
  { label: "Đã hoàn thành", value: "completed" },
];

const typeOptions = [
  { label: "Tất cả loại lớp", value: "" },
  { label: "Lớp phổ thông", value: "general" },
  { label: "Lớp chứng chỉ", value: "certificate" },
];

const ListClass = () => {
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
    teacherId,
    setTeacherId,
    setPackageId,
    type,
    setType,
    fetchData,
    handleDelete,
  } = useClassList();

  const userRole = useAuthStore((s) => s.user?.role);
  const canManage = userRole === ROLES.ADMIN;

  const { data: branchOptions = [] } = useSWR(
    ["class-branch-options"],
    async () => {
      const response = await branchService.list({ page: 1, limit: 1000 });
      return (response?.data?.items ?? []).map((branch) => ({
        label: branch.name,
        value: branch.id,
      }));
    },
  );

  const { data: teacherOptions = [] } = useSWR(
    canManage ? ["class-teacher-options"] : null,
    async () => {
      const response = await teacherService.list({
        page: 1,
        limit: 1000,
        status: "active",
      });
      return (response?.data?.items ?? []).map((teacher) => ({
        label: teacher.name,
        value: teacher.id,
      }));
    },
  );

  const { data: packageOptions = [] } = useSWR(
    ["class-package-options"],
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

  const { data: studentOptions = [] } = useSWR(
    canManage ? ["class-student-options"] : null,
    async () => {
      const response = await studentService.list({ page: 1, limit: 1000 });
      return (response?.data?.items ?? []).map((student) => ({
        label: `${student.name}${student.phone ? ` - ${student.phone}` : ""}`,
        value: student.id,
        name: student.name,
        phone: student.phone,
        branchName: student?.branch?.name,
      }));
    },
  );

  const allBranchOptions = [
    { label: "Tất cả cơ sở", value: "" },
    ...branchOptions,
  ];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [selectedClassPackages, setSelectedClassPackages] = useState([]);
  const [selectedClassName, setSelectedClassName] = useState("");

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

  const handleSaved = ({ created }) => {
    if (created) {
      if (page === 1) fetchData();
      else setPage(1);
    } else {
      fetchData();
    }
  };

  const handleViewPackages = (record) => {
    setSelectedClassName(record?.name ?? "");
    setSelectedClassPackages(
      Array.isArray(record?.packages) ? record.packages : [],
    );
    setPackageModalOpen(true);
  };

  const columns = buildColumns({
    page,
    limit,
    onEdit: openEdit,
    onDelete: handleDelete,
    onViewPackages: handleViewPackages,
    canManage,
  });

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Title level={2} className="mb-0!">
          Danh sách lớp học
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
            placeholder="Tìm theo tên lớp..."
            className="max-w-xs"
          />
          <Select
            value={branchId ?? ""}
            options={allBranchOptions}
            onChange={(value) => {
              setPage(1);
              setBranchId(value || null);
            }}
            className="w-48"
            showSearch
            optionFilterProp="label"
          />
          <Select
            value={status ?? ""}
            options={statusOptions}
            onChange={(value) => {
              setPage(1);
              setStatus(value || null);
            }}
            className="w-48"
          />
          {canManage ? (
            <Select
              value={teacherId ?? ""}
              options={[
                { label: "Tất cả giáo viên", value: "" },
                ...teacherOptions,
              ]}
              onChange={(value) => {
                setPage(1);
                setTeacherId(value || null);
              }}
              className="w-56"
              showSearch
              optionFilterProp="label"
            />
          ) : null}
          <Select
            value={type ?? ""}
            options={typeOptions}
            onChange={(value) => {
              setPage(1);
              setType(value || null);
            }}
            className="w-48"
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setPage(1);
              setSearch(null);
              setStatus(null);
              setBranchId(null);
              setTeacherId(null);
              setPackageId(null);
              setType(null);
            }}
            className="flex items-center gap-2 rounded-lg font-medium bg-gray-100! hover:bg-gray-200!"
          >
            Đặt lại
          </Button>
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
          showTotal: (t) => `Tổng ${t} lớp học`,
          pageSizeOptions: ["10", "20", "50"],
          onChange: (p, l) => {
            setPage(p);
            setLimit(l);
          },
        }}
        bordered
        size="middle"
        scroll={{ x: "max-content" }}
      />

      <ClassFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSaved={handleSaved}
        branchOptions={branchOptions}
        teacherOptions={teacherOptions}
        packageOptions={packageOptions}
        studentOptions={studentOptions}
      />

      <Modal
        title={`Danh sách gói học${selectedClassName ? ` - ${selectedClassName}` : ""}`}
        open={packageModalOpen}
        onCancel={() => setPackageModalOpen(false)}
        footer={null}
        width={700}
      >
        <Table
          rowKey="id"
          dataSource={selectedClassPackages}
          pagination={false}
          size="small"
          locale={{ emptyText: "Lớp học chưa có gói học" }}
          columns={[
            {
              title: "Tên gói",
              dataIndex: "name",
              key: "name",
              render: (value) => value || "—",
            },
            {
              title: "Loại",
              dataIndex: "type",
              key: "type",
              render: (value) => packageTypeLabels[value] || value || "—",
            },
            {
              title: "Số buổi",
              dataIndex: "totalSessions",
              key: "totalSessions",
              width: 100,
              render: (value) => value ?? "—",
            },
            {
              title: "Học phí",
              dataIndex: "price",
              key: "price",
              width: 140,
              render: (value) =>
                Number(value || 0).toLocaleString("vi-VN") + "đ",
            },
          ]}
        />
      </Modal>
    </>
  );
};

export default ListClass;
