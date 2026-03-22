import { useEffect, useRef, useState } from "react";
import { App, Button, Form, Input, InputNumber, Modal, Select } from "antd";
import packageService from "../../../services/packageService";
import PackageDynamicFields from "./PackageDynamicFields";
import { typeOptions } from "./packageFormOptions";
import { buildPackagePayload, getInitialValues } from "./packageFormUtils";

const PackageFormModal = ({ open, onClose, editing, onSaved }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const selectedType = Form.useWatch("type", form);
  const selectedCurriculum = Form.useWatch(["info", "curriculum"], form);
  const prevTypeRef = useRef();
  const prevProgramRef = useRef();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(getInitialValues(editing));
      prevTypeRef.current = undefined;
      prevProgramRef.current = undefined;
    }
  }, [open, editing, form]);

  useEffect(() => {
    if (!open) return;

    if (prevTypeRef.current === undefined) {
      prevTypeRef.current = selectedType;
      return;
    }

    if (prevTypeRef.current === selectedType) {
      return;
    }

    prevTypeRef.current = selectedType;

    form.setFieldsValue({
      info: {
        type: selectedType,
        curriculum: undefined,
        comboType: undefined,
        ageGroup: undefined,
        certificateType: undefined,
        subject: undefined,
        class: undefined,
      },
    });
  }, [selectedType, form, open]);

  useEffect(() => {
    if (!open || selectedType !== "general") return;

    if (prevProgramRef.current === undefined) {
      prevProgramRef.current = selectedCurriculum;
      return;
    }

    if (prevProgramRef.current === selectedCurriculum) {
      return;
    }

    prevProgramRef.current = selectedCurriculum;

    if (selectedCurriculum !== "chinese") {
      form.setFieldsValue({
        info: {
          ...form.getFieldValue("info"),
          ageGroup: undefined,
        },
      });
    }
  }, [selectedCurriculum, selectedType, form, open]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const payload = buildPackagePayload(values);
      if (editing) {
        await packageService.update(editing.id, payload);
        message.success("Cập nhật gói học thành công");
      } else {
        await packageService.create(payload);
        message.success("Thêm gói học thành công");
      }

      handleClose();
      onSaved({ created: !editing });
    } catch (err) {
      message.error(
        err?.message ||
          (editing ? "Cập nhật gói học thất bại" : "Thêm gói học thất bại"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editing ? "Cập nhật gói học" : "Thêm gói học mới"}
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        className="mt-4"
      >
        <Form.Item
          label="Tên gói"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên gói" }]}
        >
          <Input placeholder="Nhập tên gói học" />
        </Form.Item>

        <Form.Item
          label="Loại gói"
          name="type"
          rules={[{ required: true, message: "Vui lòng chọn loại gói" }]}
        >
          <Select
            options={typeOptions}
            placeholder="Chọn loại gói"
            onChange={(value) => {
              form.setFieldValue(["info", "type"], value);
            }}
          />
        </Form.Item>

        <PackageDynamicFields selectedType={selectedType} />

        <Form.Item
          label="Giá (VNĐ)"
          name="price"
          rules={[{ required: true, message: "Vui lòng nhập giá" }]}
        >
          <InputNumber
            className="w-full!"
            min={0}
            formatter={(value) =>
              value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
            }
            parser={(value) => value?.replace(/,/g, "") ?? ""}
            placeholder="Nhập giá"
          />
        </Form.Item>

        <Form.Item
          label="Số buổi học"
          name="totalSessions"
          rules={[{ required: true, message: "Vui lòng nhập số buổi" }]}
        >
          <InputNumber className="w-full!" min={1} placeholder="Nhập số buổi" />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={handleClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={saving}>
            {editing ? "Cập nhật" : "Thêm mới"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default PackageFormModal;
