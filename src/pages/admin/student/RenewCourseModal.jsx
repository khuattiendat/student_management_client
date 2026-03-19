import { useEffect, useState } from "react";
import { App, Button, Form, Modal, Select } from "antd";
import studentService from "../../../services/studentService";

const RenewCourseModal = ({
  open,
  onClose,
  student,
  packageOptions = [],
  onSaved,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({ packageIds: [] });
  }, [open, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSave = async (values) => {
    if (!student?.id) return;

    setSaving(true);
    try {
      await studentService.renewCourse(student.id, {
        packageIds: values.packageIds ?? [],
      });

      message.success("Gia hạn khóa học thành công");
      handleClose();
      onSaved?.();
    } catch (err) {
      message.error(err?.message || "Gia hạn khóa học thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`Gia hạn khóa học${student?.name ? ` - ${student.name}` : ""}`}
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
        className="mt-4"
      >
        <Form.Item
          label="Gói học muốn gia hạn"
          name="packageIds"
          rules={[
            { required: true, message: "Vui lòng chọn ít nhất 1 gói học" },
          ]}
        >
          <Select
            mode="multiple"
            options={packageOptions}
            placeholder="Chọn gói học"
            optionFilterProp="label"
          />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={handleClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={saving}>
            Gia hạn
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default RenewCourseModal;
