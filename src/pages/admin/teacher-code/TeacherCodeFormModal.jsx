import { useEffect, useMemo, useState } from "react";
import { App, Button, Form, Input, Modal, Select } from "antd";
import teacherCodeService from "../../../services/teacherCodeService";

const random6Digits = () => String(Math.floor(100000 + Math.random() * 900000));

const TeacherCodeFormModal = ({
  open,
  onClose,
  editing,
  onSaved,
  teacherOptions = [],
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const title = useMemo(
    () => (editing ? "Cập nhật mã giáo viên" : "Thêm mã giáo viên mới"),
    [editing],
  );

  useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      code: editing?.code ?? "",
      teacherId: editing?.teacherId ?? undefined,
    });
  }, [open, editing, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleGenerateCode = () => {
    form.setFieldValue("code", random6Digits());
  };

  const handleSave = async (values) => {
    const payload = {
      code: String(values.code || "").trim(),
      teacherId: Number(values.teacherId),
    };

    setSaving(true);
    try {
      if (editing) {
        await teacherCodeService.update(editing.id, payload);
        message.success("Cập nhật mã giáo viên thành công");
      } else {
        await teacherCodeService.create(payload);
        message.success("Tạo mã giáo viên thành công");
      }

      handleClose();
      onSaved({ created: !editing });
    } catch (err) {
      console.log(err);

      message.error(err?.error?.message || "Tạo mã giáo viên thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      destroyOnClose
      width={560}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        className="mt-4 grid grid-cols-1 gap-x-4 md:grid-cols-2"
      >
        <Form.Item
          label="Mã"
          name="code"
          rules={[
            { required: true, message: "Vui lòng nhập mã" },
            {
              pattern: /^\d{6}$/,
              message: "Mã phải là chuỗi 6 chữ số",
            },
          ]}
          className="md:col-span-2"
        >
          <Input
            placeholder="Nhập mã 6 chữ số"
            maxLength={6}
            autoComplete="false"
            suffix={
              !editing ? (
                <Button type="link" size="small" onClick={handleGenerateCode}>
                  Random 6 số
                </Button>
              ) : null
            }
          />
        </Form.Item>

        <Form.Item
          label="Giáo viên"
          name="teacherId"
          rules={[{ required: true, message: "Vui lòng chọn giáo viên" }]}
          className="md:col-span-2"
        >
          <Select
            options={teacherOptions}
            placeholder="Chọn giáo viên"
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <div className="flex justify-end gap-2 md:col-span-2">
          <Button onClick={handleClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={saving}>
            {editing ? "Cập nhật" : "Tạo mã"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default TeacherCodeFormModal;
