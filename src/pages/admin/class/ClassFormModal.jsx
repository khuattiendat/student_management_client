import { useEffect, useState } from "react";
import { App, Button, Form, Input, Modal, Select } from "antd";
import classService from "../../../services/classService";

const statusOptions = [
  { label: "Hoạt động", value: "active" },
  { label: "Ngừng hoạt động", value: "inactive" },
];

const ClassFormModal = ({
  open,
  onClose,
  editing,
  onSaved,
  branchOptions = [],
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: editing?.name ?? "",
        branchId: editing?.branchId ?? undefined,
        status: editing?.status ?? "active",
      });
    }
  }, [open, editing, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      if (editing) {
        await classService.update(editing.id, values);
        message.success("Cập nhật lớp học thành công");
      } else {
        await classService.create(values);
        message.success("Thêm lớp học thành công");
      }
      handleClose();
      onSaved({ created: !editing });
    } catch (err) {
      message.error(
        err?.message ||
          (editing ? "Cập nhật lớp học thất bại" : "Thêm lớp học thất bại"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editing ? "Cập nhật lớp học" : "Thêm lớp học mới"}
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
          label="Tên lớp"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên lớp" }]}
        >
          <Input placeholder="Nhập tên lớp học" />
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

        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select options={statusOptions} placeholder="Chọn trạng thái" />
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

export default ClassFormModal;
