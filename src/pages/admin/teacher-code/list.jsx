import { useMemo, useState } from "react";
import { Button, Select, Space, Table, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import useSWR from "swr";
import InputSearch from "../../../components/common/InputSearch";
import teacherService from "../../../services/teacherService";
import { useTeacherCodeList } from "./useTeacherCodeList";
import { buildColumns } from "./_columns";
import TeacherCodeFormModal from "./TeacherCodeFormModal";
import Heading from "../../../components/common/Heading";

const { Title } = Typography;
const statusOptions = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Chưa dùng", value: "active" },
  { label: "Đã dùng", value: "inactive" },
];

const ListTeacherCode = () => {
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
    teacherId,
    setTeacherId,
    fetchData,
    handleDelete,
    setStatus,
    status,
  } = useTeacherCodeList();

  const { data: teacherOptions = [] } = useSWR(
    ["teacher-code-teacher-options"],
    async () => {
      const response = await teacherService.list({
        page: 1,
        limit: 1000,
        status: "active",
      });
      return (response?.data?.items ?? []).map((teacher) => ({
        label: teacher.name,
        value: String(teacher.id),
      }));
    },
  );

  const teacherNameById = useMemo(
    () =>
      new Map(
        teacherOptions.map((teacher) => [Number(teacher.value), teacher.label]),
      ),
    [teacherOptions],
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleSearch = (keyword) => {
    setPage(1);
    setSearch(keyword || null);
  };

  const handleSaved = ({ created }) => {
    if (created) {
      if (page === 1) {
        fetchData();
      } else {
        setPage(1);
      }
      return;
    }

    fetchData();
  };

  const columns = buildColumns({
    page,
    limit,
    onDelete: handleDelete,
    teacherNameById,
  });

  return (
    <>
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <Heading title="Danh sách mã giáo viên" />

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          Thêm mới
        </Button>
      </div>

      <div className="mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-4">
          {/* Search */}
          <div className="w-full md:max-w-xs">
            <InputSearch
              value={search ?? ""}
              onSearch={handleSearch}
              placeholder="Tìm theo mã..."
              className="w-full"
            />
          </div>

          {/* Teacher */}
          <div className="w-full sm:w-64">
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
              className="w-full"
              showSearch
              optionFilterProp="label"
            />
          </div>

          {/* Status */}
          <div className="w-full sm:w-64">
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
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (value) => `Tổng ${value} mã`,
          onChange: (nextPage, nextLimit) => {
            setPage(nextPage);
            setLimit(nextLimit);
          },
        }}
        bordered
        size="middle"
        scroll={{ x: "max-content" }}
      />

      <TeacherCodeFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSaved={handleSaved}
        teacherOptions={teacherOptions.map((option) => ({
          ...option,
          value: Number(option.value),
        }))}
      />
    </>
  );
};

export default ListTeacherCode;
