import { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Checkbox,
  Form,
  Modal,
  Radio,
  Select,
  Typography,
} from "antd";
import studentService from "../../../services/studentService";
import {
  certificateOptions,
  classOptions,
  comboTypeOptions,
  generalProgramOptions,
  subjectOptions,
  typeOptions,
} from "../package/packageFormOptions";

const { Text } = Typography;

const parsePrice = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const RenewCourseModal = ({
  open,
  onClose,
  student,
  packageOptions = [],
  onSaved,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [packageTypeFilter, setPackageTypeFilter] = useState("");
  const [curriculumFilter, setCurriculumFilter] = useState("");
  const [certificateTypeFilter, setCertificateTypeFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [comboTypeFilter, setComboTypeFilter] = useState("");
  const [ageGroupFilter, setAgeGroupFilter] = useState("");
  const selectedPackageIds = Form.useWatch("packageIds", form);

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({ packageIds: [] });
    setPackageTypeFilter("");
    setCurriculumFilter("");
    setCertificateTypeFilter("");
    setSubjectFilter("");
    setClassFilter("");
    setComboTypeFilter("");
    setAgeGroupFilter("");
  }, [open, form]);

  const filteredPackageOptions = useMemo(() => {
    if (!packageTypeFilter) return [];

    if (packageTypeFilter === "general") {
      if (!curriculumFilter) return [];
      if (!comboTypeFilter) {
        return [];
      }
    }

    if (packageTypeFilter === "certificate" && !certificateTypeFilter) {
      return [];
    }

    if (
      packageTypeFilter === "school_subject" &&
      (!subjectFilter || !classFilter || !comboTypeFilter)
    ) {
      return [];
    }

    return packageOptions.filter((pkg) => {
      if (pkg.type !== packageTypeFilter) {
        return false;
      }

      const info = pkg.info ?? {};

      if (packageTypeFilter === "general") {
        if (curriculumFilter && info.curriculum !== curriculumFilter) {
          return false;
        }

        if (comboTypeFilter && info.comboType !== comboTypeFilter) {
          return false;
        }
      }

      if (packageTypeFilter === "certificate") {
        if (
          certificateTypeFilter &&
          info.certificateType !== certificateTypeFilter
        ) {
          return false;
        }
      }

      if (packageTypeFilter === "school_subject") {
        if (subjectFilter && info.subject !== subjectFilter) {
          return false;
        }

        if (classFilter && info.class !== classFilter) {
          return false;
        }

        if (comboTypeFilter && info.comboType !== comboTypeFilter) {
          return false;
        }
      }

      return true;
    });
  }, [
    certificateTypeFilter,
    classFilter,
    comboTypeFilter,
    curriculumFilter,
    packageOptions,
    packageTypeFilter,
    subjectFilter,
  ]);

  const canShowPackageCheckbox = useMemo(() => {
    if (!packageTypeFilter) return false;

    if (packageTypeFilter === "general") {
      if (!curriculumFilter) return false;
      return Boolean(comboTypeFilter);
    }

    if (packageTypeFilter === "certificate") {
      return Boolean(certificateTypeFilter);
    }

    if (packageTypeFilter === "school_subject") {
      return Boolean(subjectFilter && classFilter && comboTypeFilter);
    }

    return false;
  }, [
    certificateTypeFilter,
    classFilter,
    comboTypeFilter,
    curriculumFilter,
    packageTypeFilter,
    subjectFilter,
  ]);

  useEffect(() => {
    if (!open) return;
    form.setFieldValue("packageIds", []);
  }, [
    ageGroupFilter,
    certificateTypeFilter,
    classFilter,
    comboTypeFilter,
    curriculumFilter,
    form,
    open,
    packageTypeFilter,
    subjectFilter,
  ]);

  useEffect(() => {
    if (!open || !canShowPackageCheckbox) return;

    const currentSelected = form.getFieldValue("packageIds") ?? [];

    if (filteredPackageOptions.length === 1) {
      const onlyOptionId = filteredPackageOptions[0]?.value;
      if (
        onlyOptionId !== undefined &&
        (currentSelected.length !== 1 || currentSelected[0] !== onlyOptionId)
      ) {
        form.setFieldValue("packageIds", [onlyOptionId]);
      }
      return;
    }

    if (currentSelected.length > 0) {
      const validIds = new Set(
        filteredPackageOptions.map((item) => item.value),
      );
      const nextSelected = currentSelected.filter((id) => validIds.has(id));
      if (nextSelected.length !== currentSelected.length) {
        form.setFieldValue("packageIds", nextSelected);
      }
    }
  }, [canShowPackageCheckbox, filteredPackageOptions, form, open]);

  const selectedPackageSummary = useMemo(() => {
    const selectedIds = new Set(selectedPackageIds ?? []);
    const selectedPackages = packageOptions.filter((pkg) =>
      selectedIds.has(pkg.value),
    );

    const totalSessions = selectedPackages.reduce(
      (sum, pkg) => sum + Number(pkg.totalSessions || 0),
      0,
    );

    const totalTuition = selectedPackages.reduce(
      (sum, pkg) => sum + parsePrice(pkg.price),
      0,
    );

    return {
      count: selectedPackages.length,
      totalSessions,
      totalTuition,
    };
  }, [packageOptions, selectedPackageIds]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSave = async (values) => {
    if (!student?.id) return;

    if (values.packageIds === undefined || values.packageIds.length === 0) {
      message.error("Vui lòng chọn ít nhất 1 gói học để gia hạn");
      return;
    }

    setSaving(true);
    try {
      await studentService.renewCourse(student.id, {
        packageIds: values.packageIds ?? [],
      });

      message.success("Gia hạn khóa học thành công");
      handleClose();
      onSaved?.();
    } catch (err) {
      message.error(err?.message || "Gia hạn khóa học thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`Gia hạn khóa học${student?.name ? ` - ${student.name}` : ""}`}
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      destroyOnHidden
      width={760}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        className="mt-4"
      >
        <Form.Item label="Gói học muốn gia hạn" className="mb-0">
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Select
                value={packageTypeFilter}
                options={[{ label: "Tất cả loại", value: "" }, ...typeOptions]}
                placeholder="Lọc theo loại gói"
                onChange={(value) => {
                  setPackageTypeFilter(value || "");
                  setCurriculumFilter("");
                  setCertificateTypeFilter("");
                  setSubjectFilter("");
                  setClassFilter("");
                  setComboTypeFilter("");
                }}
              />

              {packageTypeFilter === "general" ? (
                <>
                  <Select
                    value={curriculumFilter}
                    options={[
                      { label: "Tất cả chương trình", value: "" },
                      ...generalProgramOptions,
                    ]}
                    placeholder="Chương trình"
                    onChange={(value) => {
                      setCurriculumFilter(value || "");
                    }}
                  />
                  <Select
                    value={comboTypeFilter}
                    options={[
                      { label: "Tất cả combo", value: "" },
                      ...comboTypeOptions,
                    ]}
                    placeholder="Combo"
                    onChange={(value) => setComboTypeFilter(value || "")}
                  />
                </>
              ) : null}

              {packageTypeFilter === "certificate" ? (
                <Select
                  value={certificateTypeFilter}
                  options={[
                    { label: "Tất cả chứng chỉ", value: "" },
                    ...certificateOptions,
                  ]}
                  placeholder="Loại chứng chỉ"
                  onChange={(value) => setCertificateTypeFilter(value || "")}
                />
              ) : null}

              {packageTypeFilter === "school_subject" ? (
                <>
                  <Select
                    value={subjectFilter}
                    options={[
                      { label: "Tất cả môn", value: "" },
                      ...subjectOptions,
                    ]}
                    placeholder="Môn học"
                    onChange={(value) => setSubjectFilter(value || "")}
                  />
                  <Select
                    value={classFilter}
                    options={[
                      { label: "Tất cả khối", value: "" },
                      ...classOptions,
                    ]}
                    placeholder="Khối lớp"
                    onChange={(value) => setClassFilter(value || "")}
                  />
                  <Select
                    value={comboTypeFilter}
                    options={[
                      { label: "Tất cả combo", value: "" },
                      ...comboTypeOptions,
                    ]}
                    placeholder="Combo"
                    onChange={(value) => setComboTypeFilter(value || "")}
                  />
                </>
              ) : null}
            </div>

            {canShowPackageCheckbox ? (
              <Form.Item
                name="packageIds"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất 1 gói học",
                  },
                ]}
                className="mb-0"
              >
                <Checkbox.Group className="flex w-full flex-col gap-2">
                  {filteredPackageOptions.map((pkg) => (
                    <Checkbox
                      key={pkg.value}
                      value={pkg.value}
                      className="m-0 block w-full"
                    >
                      <div className="py-0.5">
                        <div className="font-medium">
                          {pkg.name || pkg.label} ({pkg?.totalSessions ?? "N/A"}{" "}
                          buổi)
                        </div>
                      </div>
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </Form.Item>
            ) : null}

            {!canShowPackageCheckbox ? (
              <Text type="secondary">
                Vui lòng chọn đầy đủ bộ lọc theo loại gói để hiển thị danh sách.
              </Text>
            ) : null}

            {canShowPackageCheckbox && filteredPackageOptions.length === 0 ? (
              <Text type="secondary">Không có gói học phù hợp bộ lọc</Text>
            ) : null}

            {(selectedPackageSummary.count || 0) > 0 ? (
              <div className="rounded-md border border-gray-200 p-3">
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <Text>
                    Tổng gói đã chọn:{" "}
                    <strong>{selectedPackageSummary.count}</strong>
                  </Text>
                  <Text>
                    Tổng số buổi:{" "}
                    <strong>{selectedPackageSummary.totalSessions}</strong>
                  </Text>
                  <Text>
                    Tổng học phí:{" "}
                    <strong>
                      {selectedPackageSummary.totalTuition.toLocaleString(
                        "vi-VN",
                      )}
                      đ
                    </strong>
                  </Text>
                </div>
              </div>
            ) : null}
          </div>
        </Form.Item>
        <Form.Item
          label="Trạng thái đóng tiền"
          name="isPaid"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn trạng thái đóng tiền",
            },
          ]}
          className="mb-0"
        >
          <Radio.Group>
            <Radio value={true}>Đã đóng tiền</Radio>
            <Radio value={false}>Chưa đóng tiền</Radio>
          </Radio.Group>
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={handleClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={saving}>
            Gia hạn
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default RenewCourseModal;
