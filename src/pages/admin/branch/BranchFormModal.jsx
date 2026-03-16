import { useEffect, useState } from "react";
import { App, Button, Form, Input, Modal } from "antd";
import branchService from "../../../services/branchService";

const BranchFormModal = ({ open, onClose, editing, onSaved }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: editing?.name ?? "",
        address: editing?.address ?? "",
        phone: editing?.phone ?? "",
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
        await branchService.update(editing.id, values);
        message.success("Cập nhật cơ sở thành công");
      } else {
        await branchService.create(values);
        message.success("Thêm cơ sở thành công");
      }
      handleClose();
      onSaved({ created: !editing });
    } catch (err) {
      message.error(
        err?.message || (editing ? "Cập nhật thất bại" : "Thêm mới thất bại"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editing ? "Cập nhật cơ sở" : "Thêm cơ sở mới"}
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
          label="Tên cơ sở"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên cơ sở" }]}
        >
          <Input placeholder="Nhập tên cơ sở" />
        </Form.Item>

        <Form.Item label="Địa chỉ" name="address">
          <Input placeholder="Nhập địa chỉ" />
        </Form.Item>

        <Form.Item label="Số điện thoại" name="phone">
          <Input placeholder="Nhập số điện thoại" />
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

export default BranchFormModal;
