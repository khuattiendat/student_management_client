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
  initialStudentId,
}) => {
  const [branchId, setBranchId] = useState(initialBranchId ?? null);
  const [classId, setClassId] = useState(initialClassId ?? null);
  const [studentId, setStudentId] = useState(initialStudentId ?? null);
  const [loading, setLoading] = useState(false);

  const classOptionsByBranch = useMemo(() => {
    if (!branchId) return classOptions;
    const branchIdNumber = Number(branchId);
    return classOptions.filter(
      (item) => Number(item.branchId) === branchIdNumber,
    );
  }, [branchId, classOptions]);

  const swrKey = useMemo(() => {
    if (!classId) return null;
    return ["cycle-students-by-class", classId];
  }, [classId]);

  const {
    data: studentOptions = [],
    isLoading,
    error,
  } = useSWR(swrKey, async () => {
    if (!classId) return [];

    const response = await studentService.list({
      page: 1,
      limit: 1000,
      branchId: branchId ? Number(branchId) : undefined,
      classId: Number(classId),
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

  const handleApply = async () => {
    setLoading(true);
    await onApply?.({
      classId,
      studentId: studentId ?? null,
    });
    setLoading(false);
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
        setStudentId(initialStudentId ?? null);
      }}
      destroyOnHidden
      title="Chọn học viên để xem chu kỳ"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleClose}>Hủy</Button>
          <Button
            type="primary"
            onClick={handleApply}
            disabled={!classId || loading}
            loading={loading}
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
              setStudentId(null);
            }}
            showSearch
            optionFilterProp="label"
            allowClear
          />
        </div>

        <div className="flex flex-col gap-2">
          <Text strong>Chọn lớp</Text>
          <Select
            value={classId ?? undefined}
            placeholder="Chọn 1 lớp..."
            options={classOptionsByBranch}
            onChange={(value) => {
              setClassId(value || null);
              setStudentId(null);
            }}
            showSearch
            optionFilterProp="label"
            allowClear
          />
        </div>

        <div className="flex flex-col gap-2">
          <Text strong>Chọn học sinh</Text>
          <Select
            value={studentId ?? undefined}
            placeholder={
              classId ? "Chọn 1 học sinh (tuỳ chọn)..." : "Chọn lớp trước"
            }
            options={studentOptions}
            onChange={(value) => setStudentId(value || null)}
            showSearch
            optionFilterProp="label"
            loading={isLoading}
            notFoundContent={isLoading ? <Spin size="small" /> : null}
            allowClear
            disabled={!classId}
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
