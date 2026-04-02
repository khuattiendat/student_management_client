import { useEffect, useMemo, useState, useCallback } from "react";
import {
  App,
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Space,
  Typography,
  Select,
} from "antd";
import dayjs from "dayjs";
import studentService from "../../../services/studentService";
import addressService from "../../../services/addressService";
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

const StudentFormModal = ({
  open,
  onClose,
  editing,
  onSaved,
  branchOptions = [],
  packageOptions = [],
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [packageTypeFilter, setPackageTypeFilter] = useState("");
  const [curriculumFilter, setCurriculumFilter] = useState("");
  const [certificateTypeFilter, setCertificateTypeFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [comboTypeFilter, setComboTypeFilter] = useState("");
  const selectedPackageIds = Form.useWatch("packageIds", form);

  // Address fields consolidated into single field
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  useEffect(() => {
    const loadEditingData = async () => {
      if (!open) return;

      if (!editing) {
        form.setFieldsValue({
          name: "",
          birthday: undefined,
          phone: "",
          branchId: undefined,
          provinceCode: undefined,
          districtCode: undefined,
          wardCode: undefined,
          addressDetail: "",
          parents: [{ name: "", phone: "", email: "" }],
          packageIds: [],
        });
        setDistricts([]);
        setWards([]);
        return;
      }

      setLoadingDetail(true);
      try {
        const response = await studentService.detail(editing.id);
        const detail = response?.data ?? editing;

        const provinceCode = detail?.provinceCode ?? undefined;
        const districtCode = detail?.districtCode ?? undefined;

        if (provinceCode) {
          try {
            const [provinceData, wardsData] = await Promise.all([
              addressService.getDistricts(provinceCode),
              addressService.getWardsByProvince(provinceCode),
            ]);
            setDistricts(
              (provinceData.districts ?? []).map((d) => ({
                label: d.name,
                value: d.code,
                name: d.name,
              })),
            );
            setWards(
              (wardsData ?? []).map((w) => ({
                label: w.name,
                value: w.code,
                name: w.name,
              })),
            );
          } catch {
            setDistricts([]);
            setWards([]);
          }
        }

        form.setFieldsValue({
          name: detail?.name ?? "",
          birthday: detail?.birthday,
          phone: detail?.phone ?? "",
          branchId: detail?.branchId ?? detail?.branch?.id ?? undefined,
          provinceCode,
          districtCode,
          wardCode: detail?.wardCode ?? undefined,
          addressDetail: detail?.addressDetail ?? "",
          parents:
            detail?.parents?.length > 0
              ? detail.parents.map((parent) => ({
                  id: parent.id,
                  name: parent.name ?? "",
                  phone: parent.phone ?? "",
                  email: parent.email ?? "",
                }))
              : [{ name: "", phone: "", email: "" }],
          packageIds:
            detail?.packageIds?.length > 0
              ? detail.packageIds
              : (detail?.packages ?? []).map((item) => item.id),
        });
      } catch (err) {
        message.error(err?.message || "Không thể tải chi tiết học viên");
      } finally {
        setLoadingDetail(false);
      }
    };

    loadEditingData();
  }, [open, editing, form, message]);

  useEffect(() => {
    if (!open) return;
    setPackageTypeFilter("");
    setCurriculumFilter("");
    setCertificateTypeFilter("");
    setSubjectFilter("");
    setClassFilter("");
    setComboTypeFilter("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const loadProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const data = await addressService.getProvinces();
        setProvinces(
          data.map((p) => ({ label: p.name, value: p.code, name: p.name })),
        );
      } catch {
        setProvinces([]);
      } finally {
        setLoadingProvinces(false);
      }
    };
    loadProvinces();
  }, [open]);

  const handleProvinceChange = useCallback(
    async (provinceCode) => {
      form.setFieldsValue({ districtCode: undefined, wardCode: undefined });
      setDistricts([]);
      setWards([]);

      if (!provinceCode) return;

      setLoadingWards(true);
      try {
        const [data, wardData] = await Promise.all([
          addressService.getDistricts(provinceCode),
          addressService.getWardsByProvince(provinceCode),
        ]);
        setDistricts(
          (data.districts ?? []).map((d) => ({
            label: d.name,
            value: d.code,
            name: d.name,
          })),
        );
        setWards(
          (wardData ?? []).map((w) => ({
            label: w.name,
            value: w.code,
            name: w.name,
          })),
        );
      } catch {
        setDistricts([]);
        setWards([]);
      } finally {
        setLoadingWards(false);
      }
    },
    [form],
  );

  const filteredPackageOptions = useMemo(() => {
    if (!editing) {
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
    }

    return packageOptions.filter((pkg) => {
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
    editing,
    packageOptions,
    packageTypeFilter,
    subjectFilter,
  ]);

  const canShowPackageCheckbox = useMemo(() => {
    if (editing) return true;

    if (!packageTypeFilter) return false;

    if (packageTypeFilter === "general") {
      if (!curriculumFilter) return false;
      if (!comboTypeFilter) return false;

      return true;
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
    editing,
    packageTypeFilter,
    subjectFilter,
  ]);

  useEffect(() => {
    if (!open || editing) return;
    form.setFieldValue("packageIds", []);
  }, [
    certificateTypeFilter,
    classFilter,
    comboTypeFilter,
    curriculumFilter,
    editing,
    form,
    open,
    packageTypeFilter,
    subjectFilter,
  ]);

  useEffect(() => {
    if (!open || editing || !canShowPackageCheckbox) return;

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
  }, [canShowPackageCheckbox, editing, filteredPackageOptions, form, open]);

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
    setSaving(true);
    try {
      // Extract address data from form
      const selectedProvince = provinces.find(
        (p) => p.value === values.provinceCode,
      );
      const selectedDistrict = districts.find(
        (d) => d.value === values.districtCode,
      );
      const selectedWard = wards.find((w) => w.value === values.wardCode);

      const addressData = {
        provinceCode: values.provinceCode,
        provinceName: selectedProvince?.name,
        districtCode: values.districtCode,
        districtName: selectedDistrict?.name,
        wardCode: values.wardCode,
        wardName: selectedWard?.name,
        addressDetail: values.addressDetail || null,
      };

      if (editing) {
        const payload = {
          name: values.name,
          birthday: values.birthday,
          phone: values.phone,
          branchId: values.branchId,
          ...addressData,
          parents: (values.parents ?? []).map((parent) => {
            if (parent.id) {
              return { id: parent.id };
            }

            return {
              name: parent.name,
              phone: parent.phone,
              email: parent.email || null,
            };
          }),
        };

        await studentService.update(editing.id, payload);
        message.success("Cập nhật học viên thành công");
      } else {
        const payload = {
          name: values.name,
          birthday: values.birthday,
          phone: values.phone,
          branchId: values.branchId,
          ...addressData,
          isPaid: values.isPaid,
          parents: (values.parents ?? []).map((parent) => ({
            name: parent.name,
            phone: parent.phone,
            email: parent.email || null,
          })),
          packageIds: values.packageIds ?? [],
        };

        if (payload.packageIds.length === 0) {
          message.error("Vui lòng chọn ít nhất 1 gói học");
          setSaving(false);
          return;
        }

        await studentService.create(payload);
        message.success("Thêm học viên thành công");
      }

      handleClose();
      onSaved({ created: !editing });
    } catch (err) {
      message.error(
        err?.message ||
          (editing ? "Cập nhật học viên thất bại" : "Thêm học viên thất bại"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editing ? "Cập nhật học viên" : "Thêm học viên mới"}
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      destroyOnHidden
      width={760}
      confirmLoading={loadingDetail}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        className="mt-4 grid grid-cols-1 gap-x-4 md:grid-cols-2"
      >
        <Form.Item
          label="Họ tên học viên"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập họ tên học viên" }]}
        >
          <Input placeholder="Nhập họ tên học viên" />
        </Form.Item>

        <Form.Item label="Năm sinh" name="birthday">
          <InputNumber className="w-full!" />
        </Form.Item>

        <Form.Item label="Số điện thoại học viên" name="phone">
          <Input placeholder="Nhập số điện thoại học viên" />
        </Form.Item>

        <Form.Item
          label="Cơ sở"
          name="branchId"
          rules={[{ required: true, message: "Vui lòng chọn cơ sở" }]}
        >
          <Select
            options={branchOptions}
            placeholder="Chọn cơ sở"
            optionFilterProp="label"
            showSearch
          />
        </Form.Item>

        <Form.Item label="Tỉnh/Thành phố" name="provinceCode">
          <Select
            options={provinces}
            placeholder="Chọn tỉnh/thành phố"
            optionFilterProp="label"
            showSearch
            allowClear
            loading={loadingProvinces}
            onChange={handleProvinceChange}
          />
        </Form.Item>

        <Form.Item label="Phường/Xã" name="wardCode">
          <Select
            options={wards}
            placeholder="Chọn phường/xã"
            optionFilterProp="label"
            showSearch
            allowClear
            loading={loadingWards}
            disabled={wards.length === 0}
          />
        </Form.Item>

        <Form.Item
          label="Địa chỉ chi tiết"
          name="addressDetail"
          className="md:col-span-2"
        >
          <Input placeholder="Số nhà, đường, ngõ..." />
        </Form.Item>

        <div className="md:col-span-2">
          <Form.List
            name="parents"
            rules={[
              {
                validator: async (_, parents) => {
                  if (parents && parents.length > 0) {
                    return;
                  }
                  throw new Error("Vui lòng thêm ít nhất 1 phụ huynh");
                },
              },
            ]}
          >
            {(fields, { errors }) => (
              <div className="flex flex-col ">
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    align="start"
                    className="grid w-full grid-cols-1 gap-0 md:grid-cols-12"
                    wrap
                  >
                    <Form.Item {...restField} name={[name, "id"]} hidden>
                      <Input />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "name"]}
                      label="Tên phụ huynh"
                      rules={[
                        {
                          required: true,
                          message: "Nhập tên phụ huynh",
                          whitespace: true,
                        },
                      ]}
                      className="md:col-span-4"
                    >
                      <Input placeholder="Tên phụ huynh" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "phone"]}
                      label="SĐT phụ huynh"
                      rules={[
                        { required: true, message: "Nhập SĐT phụ huynh" },
                      ]}
                      className="md:col-span-3"
                    >
                      <Input placeholder="Số điện thoại" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "email"]}
                      label="Email"
                      rules={[{ type: "email", message: "Email không hợp lệ" }]}
                      className="md:col-span-4"
                    >
                      <Input placeholder="Email" />
                    </Form.Item>
                  </Space>
                ))}

                <Form.ErrorList errors={errors} />
              </div>
            )}
          </Form.List>
        </div>

        {!editing && (
          <Form.Item label="Gói học" className="md:col-span-2">
            <div className="space-y-3">
              {!editing ? (
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
              ) : null}

              {canShowPackageCheckbox ? (
                <Form.Item
                  name="packageIds"
                  rules={
                    editing
                      ? []
                      : [
                          {
                            required: true,
                            message: "Vui lòng chọn ít nhất 1 gói học",
                          },
                        ]
                  }
                  className="mb-0"
                >
                  <Checkbox.Group
                    disabled={Boolean(editing)}
                    className="flex w-full flex-col gap-2"
                  >
                    {filteredPackageOptions.map((pkg) => (
                      <Checkbox
                        key={pkg.value}
                        value={pkg.value}
                        className="m-0 block w-full"
                      >
                        <div className="py-0.5">
                          <div className="font-medium">
                            {pkg.name || pkg.label} (
                            {pkg?.totalSessions ?? "N/A"} buổi)
                          </div>
                        </div>
                      </Checkbox>
                    ))}
                  </Checkbox.Group>
                </Form.Item>
              ) : null}
              {!editing &&
              canShowPackageCheckbox &&
              filteredPackageOptions.length === 0 ? (
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
        )}
        {!editing && (
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
        )}

        <div className="flex justify-end gap-2 md:col-span-2">
          <Button onClick={handleClose}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={saving || loadingDetail}
          >
            {editing ? "Cập nhật" : "Thêm mới"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default StudentFormModal;
