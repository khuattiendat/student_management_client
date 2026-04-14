import { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Form,
  Modal,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import studentService from "../../../services/studentService";
import {
  certificateOptions,
  classOptions,
  comboTypeOptions,
  generalProgramOptions,
  subjectOptions,
  typeOptions,
} from "../package/packageFormOptions";

const { Text, Title } = Typography;
const DetailModal = ({
  open,
  onClose,
  detailStudent,
  packageOptions = [],
  onUpdated,
}) => {
  console.log(detailStudent);

  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [showChangePackage, setShowChangePackage] = useState(false);
  const [packageTypeFilter, setPackageTypeFilter] = useState("");
  const [curriculumFilter, setCurriculumFilter] = useState("");
  const [certificateTypeFilter, setCertificateTypeFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [comboTypeFilter, setComboTypeFilter] = useState("");

  const currentPackageIds = useMemo(
    () => (detailStudent?.packages ?? []).map((item) => item.id),
    [detailStudent],
  );

  const oldPackageId = Form.useWatch("oldPackageId", form);
  const newPackageId = Form.useWatch("newPackageId", form);

  useEffect(() => {
    if (!open) {
      form.resetFields();
      return;
    }

    setShowChangePackage(false);
    setPackageTypeFilter("");
    setCurriculumFilter("");
    setCertificateTypeFilter("");
    setSubjectFilter("");
    setClassFilter("");
    setComboTypeFilter("");

    const firstEnrollment = detailStudent?.enrollments?.find(
      (enrollment) => enrollment?.packageId,
    );

    form.setFieldsValue({
      oldPackageId: firstEnrollment?.packageId,
      newPackageId: undefined,
      isPaid: firstEnrollment?.isPaid ?? false,
    });
  }, [detailStudent, form, open]);

  const currentEnrollment = useMemo(() => {
    if (!detailStudent?.enrollments?.length) return null;

    const selectedOldId = Number(oldPackageId);
    if (!Number.isInteger(selectedOldId)) {
      return detailStudent.enrollments[0] ?? null;
    }

    return (
      detailStudent.enrollments.find(
        (enrollment) => enrollment.packageId === selectedOldId,
      ) ??
      detailStudent.enrollments[0] ??
      null
    );
  }, [detailStudent, oldPackageId]);

  const oldPackage = useMemo(() => {
    if (!currentEnrollment) return null;
    return (
      detailStudent?.packages?.find(
        (item) => item.id === currentEnrollment.packageId,
      ) ?? null
    );
  }, [currentEnrollment, detailStudent]);

  const selectableNewPackages = useMemo(() => {
    const ownedIds = new Set(currentPackageIds);
    return packageOptions.filter((item) => !ownedIds.has(item.value));
  }, [currentPackageIds, packageOptions]);

  const filteredNewPackageOptions = useMemo(() => {
    if (!packageTypeFilter) return [];

    if (packageTypeFilter === "general") {
      if (!curriculumFilter || !comboTypeFilter) return [];
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

    return selectableNewPackages.filter((pkg) => {
      if (packageTypeFilter && pkg.type !== packageTypeFilter) {
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
    packageTypeFilter,
    selectableNewPackages,
    subjectFilter,
  ]);

  const canSelectNewPackage = useMemo(() => {
    if (!packageTypeFilter) return false;

    if (packageTypeFilter === "general") {
      return Boolean(curriculumFilter && comboTypeFilter);
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
    if (!showChangePackage) return;
    form.setFieldValue("newPackageId", undefined);
  }, [
    certificateTypeFilter,
    classFilter,
    comboTypeFilter,
    curriculumFilter,
    form,
    packageTypeFilter,
    showChangePackage,
    subjectFilter,
  ]);

  const selectedNewPackage = useMemo(() => {
    const selectedId = Number(newPackageId);
    if (!Number.isInteger(selectedId)) return null;
    return (
      selectableNewPackages.find((item) => item.value === selectedId) ?? null
    );
  }, [newPackageId, selectableNewPackages]);

  const learnedSessions = useMemo(() => {
    if (!oldPackage || !currentEnrollment) return 0;

    return (
      Number(oldPackage.totalSessions ?? 0) -
      Number(currentEnrollment.remainingSessions ?? 0)
    );
  }, [currentEnrollment, oldPackage]);

  const previewRemainingSessions = useMemo(() => {
    if (!selectedNewPackage) return null;
    return Number(selectedNewPackage.totalSessions ?? 0) - learnedSessions;
  }, [learnedSessions, selectedNewPackage]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSave = async () => {
    if (!detailStudent?.id) return;

    try {
      const values = await form.validateFields();

      if (!values.oldPackageId) {
        message.error("Vui lòng chọn gói cũ");
        return;
      }

      if (!values.newPackageId) {
        message.error("Vui lòng chọn gói mới");
        return;
      }

      setSaving(true);
      const response = await studentService.updateEnrollments(
        detailStudent.id,
        {
          oldPackageId: values.oldPackageId,
          newPackageId: values.newPackageId,
          isPaid: Boolean(values.isPaid),
        },
      );

      const updatedStudent = response?.data;
      message.success("Đổi gói học thành công");
      onUpdated?.(updatedStudent);
      handleClose();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(
        err?.response?.data?.message || err?.message || "Đổi gói học thất bại",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      centered
      width={760}
      title={
        detailStudent?.name
          ? `Chi tiết học viên - ${detailStudent.name}`
          : "Chi tiết học viên"
      }
      footer={null}
      destroyOnHidden
    >
      {detailStudent && (
        <div className="flex flex-col gap-3">
          <div>
            <Title level={5} className="mb-1!">
              Địa chỉ
            </Title>
            <span>
              {[
                detailStudent.addressDetail,
                detailStudent.wardName,
                detailStudent.provinceName,
              ]
                .filter(Boolean)
                .join(", ") || "Không có địa chỉ"}
            </span>
          </div>

          <div>
            <Title level={5} className="mb-1!">
              Lớp
            </Title>
            {Array.isArray(detailStudent.classStudents) &&
            detailStudent.classStudents.length ? (
              <div className="flex flex-wrap gap-1">
                {detailStudent.classStudents.map((item) => (
                  <Tag key={item.id}>{item?.classEntity?.name}</Tag>
                ))}
              </div>
            ) : (
              <span>Không có lớp</span>
            )}
          </div>

          <div>
            <div className="flex gap-2">
              <Title level={5} className="mb-1!">
                Gói học
              </Title>
            </div>

            {Array.isArray(detailStudent.packages) &&
            detailStudent.packages.length ? (
              <div className="flex flex-wrap gap-1">
                {detailStudent.packages.map((item) => (
                  <Tag key={item.id}>{item.name}</Tag>
                ))}
              </div>
            ) : (
              <span>Không có gói học</span>
            )}
          </div>
          <div className="flex gap-2">
            <Title level={5} className="mb-1!">
              Thay đổi gói học
            </Title>
            <Switch
              className="ml-2"
              checked={showChangePackage}
              onChange={(checked) => setShowChangePackage(checked)}
            />
          </div>

          {showChangePackage && (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
              <Title level={5} className="mb-3!">
                Đổi gói học
              </Title>

              {detailStudent.packages?.length ? (
                <Form form={form} layout="vertical">
                  <Space direction="vertical" size={12} className="w-full">
                    <Form.Item
                      label="Gói cũ"
                      name="oldPackageId"
                      rules={[{ required: true, message: "Chọn gói cũ" }]}
                    >
                      <Select
                        placeholder="Chọn gói hiện tại"
                        options={(detailStudent.packages ?? []).map((item) => ({
                          label: item.name,
                          value: item.id,
                        }))}
                        onChange={() =>
                          form.setFieldValue("newPackageId", undefined)
                        }
                      />
                    </Form.Item>

                    <Form.Item label="Gói mới" className="mb-0">
                      <Space direction="vertical" size={12} className="w-full">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                          <Select
                            value={packageTypeFilter}
                            options={[
                              { label: "Tất cả loại", value: "" },
                              ...typeOptions,
                            ]}
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
                                onChange={(value) =>
                                  setComboTypeFilter(value || "")
                                }
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
                              onChange={(value) =>
                                setCertificateTypeFilter(value || "")
                              }
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
                                onChange={(value) =>
                                  setSubjectFilter(value || "")
                                }
                              />
                              <Select
                                value={classFilter}
                                options={[
                                  { label: "Tất cả khối", value: "" },
                                  ...classOptions,
                                ]}
                                placeholder="Khối lớp"
                                onChange={(value) =>
                                  setClassFilter(value || "")
                                }
                              />
                              <Select
                                value={comboTypeFilter}
                                options={[
                                  { label: "Tất cả combo", value: "" },
                                  ...comboTypeOptions,
                                ]}
                                placeholder="Combo"
                                onChange={(value) =>
                                  setComboTypeFilter(value || "")
                                }
                              />
                            </>
                          ) : null}
                        </div>

                        <Form.Item
                          name="newPackageId"
                          rules={[{ required: true, message: "Chọn gói mới" }]}
                          className="mb-0"
                        >
                          <Select
                            placeholder="Chọn gói mới"
                            options={filteredNewPackageOptions}
                            showSearch
                            optionFilterProp="label"
                            disabled={!oldPackageId || !canSelectNewPackage}
                          />
                        </Form.Item>

                        {packageTypeFilter &&
                        canSelectNewPackage &&
                        filteredNewPackageOptions.length === 0 ? (
                          <Text type="secondary">
                            Không có gói học phù hợp bộ lọc
                          </Text>
                        ) : null}
                      </Space>
                    </Form.Item>

                    <Form.Item
                      label="Đã thanh toán"
                      name="isPaid"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>

                    <div className="rounded-md bg-white p-3 text-sm text-slate-700">
                      <div>
                        <strong>Số buổi đã học:</strong> {learnedSessions}
                      </div>
                      <div>
                        <strong>Số buổi còn lại sau khi đổi:</strong>{" "}
                        {previewRemainingSessions ?? "-"}
                      </div>
                      {selectedNewPackage ? (
                        <div>
                          <strong>Gói mới:</strong> {selectedNewPackage.label}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="primary"
                        onClick={handleSave}
                        loading={saving}
                      >
                        Lưu thay đổi
                      </Button>
                    </div>
                  </Space>
                </Form>
              ) : (
                <span>Học viên chưa có gói học để đổi</span>
              )}
            </div>
          )}

          <div>
            <Title level={5} className="mb-1!">
              Ngày tạo
            </Title>
            <span>
              {detailStudent.createdAt
                ? dayjs(detailStudent.createdAt).format("DD/MM/YYYY")
                : "Không có ngày tạo"}
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default DetailModal;
