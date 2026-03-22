import { useState } from "react";
import { Select, Space, Table, Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import useSWR from "swr";
import InputSearch from "../../../components/common/InputSearch";
import branchService from "../../../services/branchService";
import { useTeacherList } from "./useTeacherList";
import { buildColumns } from "./_columns";
import TeacherFormModal from "./TeacherFormModal";

const { Title } = Typography;

const statusOptions = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Hoạt động", value: "active" },
  { label: "Ngừng hoạt động", value: "inactive" },
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

  const handleSaved = ({ created }) => {
    if (created) {
      if (page === 1) fetchData();
      else setPage(1);
    } else {
      fetchData();
    }
  };

  const columns = buildColumns({
    page,
    limit,
    onEdit: openEdit,
    onDelete: handleDelete,
  });

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Title level={2} className="mb-0!">
          Danh sách giáo viên
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm mới
        </Button>
      </div>

      <div className="mb-4">
        <Space wrap size="middle">
          <InputSearch
            value={search ?? ""}
            onSearch={handleSearch}
            placeholder="Tìm theo tên hoặc tên đăng nhập..."
            className="max-w-xs"
          />
          <Select
            value={status ?? ""}
            options={statusOptions}
            onChange={(value) => {
              setPage(1);
              setStatus(value || null);
            }}
            className="w-56"
          />
          <Select
            value={branchId ?? ""}
            options={allBranchOptions}
            onChange={(value) => {
              setPage(1);
              setBranchId(value || null);
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
          showTotal: (value) => `Tổng ${value} giáo viên`,
          pageSizeOptions: ["10", "20", "50"],
          onChange: (nextPage, nextLimit) => {
            setPage(nextPage);
            setLimit(nextLimit);
          },
        }}
        bordered
        size="middle"
      />

      <TeacherFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSaved={handleSaved}
        branchOptions={branchOptions}
      />
    </>
  );
};

export default ListTeacher;
