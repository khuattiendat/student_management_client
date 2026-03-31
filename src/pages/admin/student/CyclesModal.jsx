import { useMemo, useState } from "react";
import { Button, Modal, Select, Spin, Typography } from "antd";
import useSWR from "swr";
import studentService from "../../../services/studentService";

const { Text } = Typography;

const CyclesModal = ({
  open,
  onClose,
  branchOptions = [],
  classOptions = [],
  onApply,
  initialBranchId,
  initialClassId,
  initialStudentIds,
}) => {
  const [branchId, setBranchId] = useState(initialBranchId ?? null);
  const [classId, setClassId] = useState(initialClassId ?? null);
  const [studentIds, setStudentIds] = useState(initialStudentIds ?? []);

  const classOptionsByBranch = useMemo(() => {
    if (!branchId) return [];
    const branchIdNumber = Number(branchId);
    return classOptions.filter(
      (item) => Number(item.branchId) === branchIdNumber,
    );
  }, [branchId, classOptions]);

  const swrKey = useMemo(() => {
    if (!branchId) return null;
    return ["cycle-students-by-branch-class", branchId, classId ?? ""];
  }, [branchId, classId]);

  const {
    data: studentOptions = [],
    isLoading,
    error,
  } = useSWR(swrKey, async () => {
    if (!branchId) return [];

    const response = await studentService.list({
      page: 1,
      limit: 1000,
      branchId: Number(branchId),
      classId: classId ? Number(classId) : undefined,
    });

    const items = response?.data?.items ?? [];

    return items.map((s) => ({
      label: `${s.name}`,
      value: s.id,
    }));
  });

  const handleClose = () => {
    onClose?.();
  };

  const handleApply = () => {
    onApply?.({
      branchId: branchId ?? null,
      classId: classId ?? null,
      studentIds,
    });
    // handleClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      afterOpenChange={(nextOpen) => {
        if (!nextOpen) return;
        setBranchId(initialBranchId ?? null);
        setClassId(initialClassId ?? null);
        setStudentIds(initialStudentIds ?? []);
      }}
      destroyOnHidden
      title="Chọn học viên để xem chu kỳ"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleClose}>Hủy</Button>
          <Button
            type="primary"
            onClick={handleApply}
            disabled={!branchId || studentIds.length === 0}
          >
            Xác nhận
          </Button>
        </div>
      }
      width={800}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Text strong>Chọn cơ sở</Text>
          <Select
            value={branchId ?? undefined}
            placeholder="Chọn 1 cơ sở..."
            options={branchOptions}
            onChange={(value) => {
              setBranchId(value || null);
              setClassId(null);
              setStudentIds([]);
            }}
            showSearch
            optionFilterProp="label"
            allowClear
          />
        </div>

        <div className="flex flex-col gap-2">
          <Text strong>Chọn lớp (tuỳ chọn)</Text>
          <Select
            value={classId ?? undefined}
            placeholder={branchId ? "Chọn 1 lớp..." : "Chọn chi nhánh trước"}
            options={classOptionsByBranch}
            onChange={(value) => {
              setClassId(value || null);
              setStudentIds([]);
            }}
            showSearch
            optionFilterProp="label"
            allowClear
            disabled={!branchId}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Text strong>Chọn học sinh</Text>
          <Select
            mode="multiple"
            value={studentIds}
            placeholder={
              branchId ? "Chọn nhiều học sinh..." : "Chọn chi nhánh trước"
            }
            options={studentOptions}
            onChange={setStudentIds}
            showSearch
            optionFilterProp="label"
            loading={isLoading}
            notFoundContent={isLoading ? <Spin size="small" /> : null}
            maxTagCount="responsive"
            allowClear
            disabled={!branchId}
          />
          {error ? (
            <Text type="danger">
              Không thể tải danh sách học sinh. Vui lòng kiểm tra kết nối hoặc
              chọn chi nhánh/class.
            </Text>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};
export default CyclesModal;
