import { useEffect, useState } from "react";
import {
  App,
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import studentService from "../../../services/studentService";

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

  useEffect(() => {
    const loadEditingData = async () => {
      if (!open) return;

      if (!editing) {
        form.setFieldsValue({
          name: "",
          birthday: undefined,
          phone: "",
          branchId: undefined,
          parents: [{ name: "", phone: "", email: "" }],
          packageIds: [],
        });
        return;
      }

      setLoadingDetail(true);
      try {
        const response = await studentService.detail(editing.id);
        const detail = response?.data ?? editing;

        form.setFieldsValue({
          name: detail?.name ?? "",
          birthday: detail?.birthday ? dayjs(detail.birthday) : undefined,
          phone: detail?.phone ?? "",
          branchId: detail?.branchId ?? detail?.branch?.id ?? undefined,
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

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      if (editing) {
        const payload = {
          name: values.name,
          birthday: values.birthday
            ? values.birthday.format("YYYY-MM-DD")
            : undefined,
          phone: values.phone,
          branchId: values.branchId,
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
          birthday: values.birthday
            ? values.birthday.format("YYYY-MM-DD")
            : undefined,
          phone: values.phone,
          branchId: values.branchId,
          parents: (values.parents ?? []).map((parent) => ({
            name: parent.name,
            phone: parent.phone,
            email: parent.email || null,
          })),
          packageIds: values.packageIds ?? [],
        };

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
      destroyOnClose
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

        <Form.Item label="Ngày sinh" name="birthday">
          <DatePicker className="w-full!" format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item label="Số điện thoại học viên" name="phone">
          <Input placeholder="Nhập số điện thoại học viên" />
        </Form.Item>

        <Form.Item label="Cơ sở" name="branchId">
          <Select
            options={branchOptions}
            placeholder="Chọn cơ sở"
            optionFilterProp="label"
            showSearch
          />
        </Form.Item>

        <Form.Item
          label="Gói học"
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
          className="md:col-span-2"
        >
          <Select
            mode="multiple"
            options={packageOptions}
            placeholder="Chọn gói học"
            optionFilterProp="label"
            disabled={Boolean(editing)}
          />
        </Form.Item>

        <div className="md:col-span-2">
          <Form.List name="parents">
            {(fields, { add, remove }) => (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Thông tin phụ huynh
                  </span>
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => add()}
                  >
                    Thêm phụ huynh
                  </Button>
                </div>

                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    align="start"
                    className="grid w-full grid-cols-1 gap-2 md:grid-cols-12"
                    wrap
                  >
                    <Form.Item {...restField} name={[name, "id"]} hidden>
                      <Input />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "name"]}
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
                      rules={[{ type: "email", message: "Email không hợp lệ" }]}
                      className="md:col-span-4"
                    >
                      <Input placeholder="Email" />
                    </Form.Item>

                    <Button
                      danger
                      type="text"
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                      className="md:col-span-1"
                      disabled={fields.length <= 1}
                    />
                  </Space>
                ))}
              </div>
            )}
          </Form.List>
        </div>

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
