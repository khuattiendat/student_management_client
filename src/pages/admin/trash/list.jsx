import { useEffect, useState } from "react";
import { App, Divider, Table, Typography } from "antd";
import useSWR from "swr";
import classService from "../../../services/classService";
import branchService from "../../../services/branchService";
import studentService from "../../../services/studentService";
import { buildClassColumns } from "./column/classColoum";
import { buildBranchColumns } from "./column/branchColoum";
import { buildStudentColumns } from "./column/studentColoum";

const { Title } = Typography;

const ListTrash = () => {
  const { message } = App.useApp();
  const [pageClass, setPageClass] = useState(1);
  const [limitClass, setLimitClass] = useState(10);
  const [pageBranch, setPageBranch] = useState(1);
  const [limitBranch, setLimitBranch] = useState(10);
  const [pageStudent, setPageStudent] = useState(1);
  const [limitStudent, setLimitStudent] = useState(10);

  const {
    data: trashData = { classData: null, branchData: null, studentData: null },
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(
    [
      "trash-unified",
      pageClass,
      limitClass,
      pageBranch,
      limitBranch,
      pageStudent,
      limitStudent,
    ],
    async () => {
      const [classResponse, branchResponse, studentResponse] =
        await Promise.all([
          classService.trash({
            page: String(pageClass),
            limit: String(limitClass),
          }),
          branchService.trash({
            page: String(pageBranch),
            limit: String(limitBranch),
          }),
          studentService.trash({
            page: String(pageStudent),
            limit: String(limitStudent),
          }),
        ]);
      return {
        classData: classResponse?.data ?? {
          items: [],
          pagination: { total: 0 },
        },
        branchData: branchResponse?.data ?? {
          items: [],
          pagination: { total: 0 },
        },
        studentData: studentResponse?.data ?? {
          items: [],
          pagination: { total: 0 },
        },
      };
    },
    {
      keepPreviousData: true,
    },
  );

  const classData = trashData?.classData;
  const branchData = trashData?.branchData;
  const studentData = trashData?.studentData;
  const classError = error;
  const branchError = error;
  const studentError = error;

  useEffect(() => {
    if (classError) {
      message.error(
        classError?.message || "Không thể tải dữ liệu lớp học đã xóa",
      );
    }
  }, [classError, message]);

  useEffect(() => {
    if (branchError) {
      message.error(
        branchError?.message || "Không thể tải dữ liệu cơ sở đã xóa",
      );
    }
  }, [branchError, message]);

  useEffect(() => {
    if (studentError) {
      message.error(
        studentError?.message || "Không thể tải dữ liệu học viên đã xóa",
      );
    }
  }, [studentError, message]);

  const classItems = classData?.items ?? [];
  const classTotal = classData?.pagination?.total ?? 0;
  const loadingClassTable = isLoading || isValidating;

  const branchItems = branchData?.items ?? [];
  const branchTotal = branchData?.pagination?.total ?? 0;
  const loadingBranchTable = isLoading || isValidating;

  const studentItems = studentData?.items ?? [];
  const studentTotal = studentData?.pagination?.total ?? 0;
  const loadingStudentTable = isLoading || isValidating;

  const handleRestoreClass = async (record) => {
    try {
      await classService.restore(record.id);
      message.success(`Đã khôi phục "${record.name}"`);
      const isLastItemOnPage = classItems.length === 1;
      if (isLastItemOnPage && pageClass > 1) {
        setPageClass(pageClass - 1);
        return;
      }
      mutate();
    } catch (err) {
      message.error(err?.message || "Khôi phục thất bại");
    }
  };

  const handlePermanentDeleteClass = async (record) => {
    try {
      await classService.forceRemove(record.id);
      message.success(`Đã xóa vĩnh viễn "${record.name}"`);
      const isLastItemOnPage = classItems.length === 1;
      if (isLastItemOnPage && pageClass > 1) {
        setPageClass(pageClass - 1);
        return;
      }
      mutate();
    } catch (err) {
      message.error(err?.message || "Xóa vĩnh viễn thất bại");
    }
  };

  const handleRestoreBranch = async (record) => {
    try {
      await branchService.restore(record.id);
      message.success(`Đã khôi phục "${record.name}"`);
      const isLastItemOnPage = branchItems.length === 1;
      if (isLastItemOnPage && pageBranch > 1) {
        setPageBranch(pageBranch - 1);
        return;
      }
      mutate();
    } catch (err) {
      message.error(err?.message || "Khôi phục cơ sở thất bại");
    }
  };

  const handlePermanentDeleteBranch = async (record) => {
    try {
      await branchService.forceRemove(record.id);
      message.success(`Đã xóa vĩnh viễn "${record.name}"`);
      const isLastItemOnPage = branchItems.length === 1;
      if (isLastItemOnPage && pageBranch > 1) {
        setPageBranch(pageBranch - 1);
        return;
      }
      mutate();
    } catch (err) {
      message.error(err?.message || "Xóa vĩnh viễn cơ sở thất bại");
    }
  };

  const handleRestoreStudent = async (record) => {
    try {
      await studentService.restore(record.id);
      message.success(`Đã khôi phục "${record.name}"`);
      const isLastItemOnPage = studentItems.length === 1;
      if (isLastItemOnPage && pageStudent > 1) {
        setPageStudent(pageStudent - 1);
        return;
      }
      mutate();
    } catch (err) {
      message.error(err?.message || "Khôi phục học viên thất bại");
    }
  };

  const handlePermanentDeleteStudent = async (record) => {
    try {
      await studentService.forceRemove(record.id);
      message.success(`Đã xóa vĩnh viễn "${record.name}"`);
      const isLastItemOnPage = studentItems.length === 1;
      if (isLastItemOnPage && pageStudent > 1) {
        setPageStudent(pageStudent - 1);
        return;
      }
      mutate();
    } catch (err) {
      message.error(err?.message || "Xóa vĩnh viễn học viên thất bại");
    }
  };

  const columnsClass = buildClassColumns({
    pageClass,
    limitClass,
    handleRestore: handleRestoreClass,
    handlePermanentDelete: handlePermanentDeleteClass,
  });

  const columnsBranch = buildBranchColumns({
    pageBranch,
    limitBranch,
    handleRestoreBranch,
    handlePermanentDeleteBranch,
  });

  const columnsStudent = buildStudentColumns({
    pageStudent,
    limitStudent,
    handleRestoreStudent,
    handlePermanentDeleteStudent,
  });

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Title level={2} className="mb-0!">
          Thùng rác
        </Title>
      </div>
      <Divider />

      <div className="mb-4 flex items-center justify-between">
        <Title level={2} className="mb-0!">
          Lớp học đã xóa
        </Title>
      </div>

      <Table
        rowKey="id"
        dataSource={classItems}
        columns={columnsClass}
        loading={loadingClassTable}
        bordered
        size="middle"
        pagination={{
          current: pageClass,
          pageSize: limitClass,
          total: classTotal,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (value) => `Tổng ${value} bản ghi`,
          onChange: (nextPage, nextLimit) => {
            setPageClass(nextPage);
            setLimitClass(nextLimit);
          },
        }}
      />

      <div className="mb-4 mt-8 flex items-center justify-between">
        <Title level={2} className="mb-0!">
          Cơ sở đã xóa
        </Title>
      </div>

      <Table
        rowKey="id"
        dataSource={branchItems}
        columns={columnsBranch}
        loading={loadingBranchTable}
        bordered
        size="middle"
        pagination={{
          current: pageBranch,
          pageSize: limitBranch,
          total: branchTotal,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (value) => `Tổng ${value} bản ghi`,
          onChange: (nextPage, nextLimit) => {
            setPageBranch(nextPage);
            setLimitBranch(nextLimit);
          },
        }}
      />

      <div className="mb-4 mt-8 flex items-center justify-between">
        <Title level={2} className="mb-0!">
          Học viên đã xóa
        </Title>
      </div>

      <Table
        rowKey="id"
        dataSource={studentItems}
        columns={columnsStudent}
        loading={loadingStudentTable}
        bordered
        size="middle"
        pagination={{
          current: pageStudent,
          pageSize: limitStudent,
          total: studentTotal,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (value) => `Tổng ${value} bản ghi`,
          onChange: (nextPage, nextLimit) => {
            setPageStudent(nextPage);
            setLimitStudent(nextLimit);
          },
        }}
      />
    </>
  );
};

export default ListTrash;
