import { Modal, Form, Input, Button, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useState } from "react";
import authService from "../../services/authService";

const ModalChangePassword = ({ open, close }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    form.resetFields();
    close();
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success("Đổi mật khẩu thành công!");
      handleClose();
    } catch (err) {
      const msg =
        err?.error?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Đổi mật khẩu"
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Form.Item
          label="Mật khẩu hiện tại"
          name="currentPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Nhập mật khẩu hiện tại"
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Nhập mật khẩu mới"
          />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Mật khẩu xác nhận không khớp"),
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Nhập lại mật khẩu mới"
          />
        </Form.Item>

        <Form.Item className="mb-0 flex justify-end">
          <Button onClick={handleClose} className="mr-2">
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Xác nhận
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalChangePassword;
