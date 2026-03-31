import { useState } from "react";
import { Select, Space, Table, Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import InputSearch from "../../../components/common/InputSearch";
import { usePackageList } from "./usePackageList";
import { buildColumns } from "./_columns";
import PackageFormModal from "./PackageFormModal";
import Heading from "../../../components/common/Heading";

const { Title } = Typography;

const typeOptions = [
  { label: "Tất cả loại", value: "" },
  { label: "Gói phổ thông", value: "general" },
  { label: "Gói chứng chỉ", value: "certificate" },
  { label: "Các môn trên trường", value: "school_subject" },
];

const ListPackage = () => {
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
    type,
    setType,
    fetchData,
    handleDelete,
  } = usePackageList();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

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
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <Heading title="Danh sách gói học" />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm mới
        </Button>
      </div>

      <div className="mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          {/* Search */}
          <div className="w-full md:max-w-xs">
            <InputSearch
              value={search ?? ""}
              onSearch={handleSearch}
              placeholder="Tìm theo tên hoặc loại gói..."
              className="w-full"
            />
          </div>

          {/* Type */}
          <div className="w-full sm:w-48">
            <Select
              value={type ?? ""}
              options={typeOptions}
              onChange={(value) => {
                setPage(1);
                setType(value || null);
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
          showTotal: (t) => `Tổng ${t} gói học`,
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

      <PackageFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSaved={handleSaved}
      />
    </>
  );
};

export default ListPackage;
