import { useEffect, useState } from "react";
import { Modal, Avatar, Tag, Form, Input, Button, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import useAuthStore from "../../store/authStore";
import authService from "../../services/authService";

const roleColors = {
  admin: "red",
  teacher: "blue",
};

const defaultUserDisplay = "—";

const ModalInfo = ({ open, close }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const displayName = user?.name || defaultUserDisplay;
  const displayRole = user?.role || defaultUserDisplay;
  const roleColor = roleColors[user?.role] ?? "default";

  useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      name: user?.name || "",
      phone: user?.phone || "",
      userName: user?.userName || "",
    });
  }, [open, user, form]);

  const handleClose = () => {
    form.resetFields();
    close();
  };

  const onSubmit = async (values) => {
    const payload = {
      name: values.name,
      phone: values.phone,
    };

    setSubmitting(true);
    try {
      const { data } = await authService.updateProfile(payload);
      setUser(data || { ...user, ...payload });
      message.success("Cập nhật thông tin thành công");
      handleClose();
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || "Cập nhật thông tin thất bại";
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Thông tin tài khoản"
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      destroyOnHidden
    >
      <div className="flex flex-col items-center gap-3 py-4">
        <Avatar size={72} icon={<UserOutlined />} className="bg-blue-500" />
        <div className="text-center">
          <p className="text-base font-semibold">{displayName}</p>
          <Tag color={roleColor} className="mt-1">
            {displayRole}
          </Tag>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          label="Họ và tên"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
        >
          <Input placeholder="Nhập họ và tên" />
        </Form.Item>

        <Form.Item label="Số điện thoại" name="phone">
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item label="Tên đăng nhập" name="userName">
          <Input disabled />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={handleClose}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            disabled={submitting}
          >
            Lưu
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ModalInfo;
