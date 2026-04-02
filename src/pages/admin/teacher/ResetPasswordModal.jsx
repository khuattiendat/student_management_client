import { Button, Input, Modal } from "antd";
import { useState } from "react";

const ResetPasswordModal = ({ open, onClose, teacher, onOk }) => {
  const [newPassword, setNewPassword] = useState("");
  const handleOk = async () => {
    const payload = { id: teacher.id, newPassword };
    await onOk(payload);
    setNewPassword("");
    onClose();
  };
  return (
    <Modal
      title="Đặt lại mật khẩu"
      open={open}
      onCancel={onClose}
      destroyOnHidden
      onOk={handleOk}
      okText="Xác nhận"
      cancelText="Hủy"
      afterClose={() => {
        setNewPassword("");
      }}
    >
      <Input.Password
        placeholder="Nhập mật khẩu mới"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
    </Modal>
  );
};

export default ResetPasswordModal;
