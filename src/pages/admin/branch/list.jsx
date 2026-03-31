import { useState } from "react";
import { Table, Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import InputSearch from "../../../components/common/InputSearch";
import { useBranchList } from "./useBranchList";
import { buildColumns } from "./_columns";
import BranchFormModal from "./BranchFormModal";
import Heading from "../../../components/common/Heading";

const { Title } = Typography;

const ListBranch = () => {
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
    fetchData,
    handleDelete,
  } = useBranchList();

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
        <Heading title="Danh sách cơ sở" />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm mới
        </Button>
      </div>

      <div className="mb-4">
        <InputSearch
          value={search ?? ""}
          onSearch={handleSearch}
          placeholder="Tìm theo tên cơ sở..."
          className="max-w-xs"
        />
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
          showTotal: (t) => `Tổng ${t} cơ sở`,
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

      <BranchFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        onSaved={handleSaved}
      />
    </>
  );
};

export default ListBranch;
