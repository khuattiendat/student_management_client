import { useEffect, useState } from "react";
import { App, Button, Form, Input, Modal, Select } from "antd";
import teacherService from "../../../services/teacherService";
import authService from "../../../services/authService";

const statusOptions = [
  { label: "Hoạt động", value: "active" },
  { label: "Ngừng hoạt động", value: "inactive" },
];

const TeacherFormModal = ({
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
        userName: editing?.userName ?? "",
        phone: editing?.phone ?? "",
        status: editing?.status ?? "active",
        branchIds: editing?.branches?.map((branch) => branch.id) ?? [],
        password: "",
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
      const payload = {
        name: values.name,
        userName: values.userName,
        phone: values.phone || null,
        status: values.status,
        branchIds: values.branchIds ?? [],
      };

      if (!editing && values.password) {
        payload.password = values.password;
      }

      if (editing) {
        await teacherService.update(editing.id, payload);
        message.success("Cập nhật giáo viên thành công");
      } else {
        await authService.register(payload);
        message.success("Thêm giáo viên thành công");
      }

      handleClose();
      onSaved({ created: !editing });
    } catch (err) {
      message.error(
        err?.message ||
          (editing ? "Cập nhật giáo viên thất bại" : "Thêm giáo viên thất bại"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editing ? "Cập nhật giáo viên" : "Thêm giáo viên mới"}
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      destroyOnHidden
      width={640}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        className="mt-4 grid grid-cols-1 gap-x-4 md:grid-cols-2"
      >
        <Form.Item
          label="Họ tên"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
        >
          <Input placeholder="Nhập họ tên giáo viên" />
        </Form.Item>

        <Form.Item
          label="Tên đăng nhập"
          name="userName"
          rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
        >
          <Input placeholder="Nhập tên đăng nhập" disabled={Boolean(editing)} />
        </Form.Item>

        <Form.Item label="Số điện thoại" name="phone">
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select options={statusOptions} placeholder="Chọn trạng thái" />
        </Form.Item>

        <Form.Item
          label="Cơ sở"
          name="branchIds"
          rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 cơ sở" }]}
          className="md:col-span-2"
        >
          <Select
            mode="multiple"
            options={branchOptions}
            placeholder="Chọn cơ sở phụ trách"
            optionFilterProp="label"
          />
        </Form.Item>

        {!editing && (
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu" },
              { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
            ]}
            className="md:col-span-2"
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
        )}

        <div className="flex justify-end gap-2 md:col-span-2">
          <Button onClick={handleClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={saving}>
            {editing ? "Cập nhật" : "Thêm mới"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default TeacherFormModal;
