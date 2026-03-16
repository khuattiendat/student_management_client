import { useEffect, useState } from "react";
import {
  App,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
} from "antd";
import dayjs from "dayjs";
import packageService from "../../../services/packageService";

const typeOptions = [
  { label: "Combo buổi", value: "combo" },
  { label: "Khóa học", value: "course" },
];

const PackageFormModal = ({ open, onClose, editing, onSaved }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const selectedType = Form.useWatch("type", form);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: editing?.name ?? "",
        type: editing?.type ?? "combo",
        price: editing?.price ? Number(editing.price) : undefined,
        totalSessions: editing?.totalSessions ?? undefined,
        dateRange:
          editing?.startDate && editing?.endDate
            ? [dayjs(editing.startDate), dayjs(editing.endDate)]
            : undefined,
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
        type: values.type,
        price: values.price,
      };

      if (values.type === "combo") {
        payload.totalSessions = values.totalSessions;
        payload.startDate = null;
        payload.endDate = null;
      } else {
        payload.startDate = values.dateRange?.[0]?.format("YYYY-MM-DD") ?? null;
        payload.endDate = values.dateRange?.[1]?.format("YYYY-MM-DD") ?? null;
        payload.totalSessions = null;
      }

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
            onChange={() => {
              form.resetFields(["totalSessions", "dateRange"]);
            }}
          />
        </Form.Item>

        <Form.Item
          label="Giá (VNĐ)"
          name="price"
          rules={[{ required: true, message: "Vui lòng nhập giá" }]}
        >
          <InputNumber
            className="!w-full"
            min={0}
            formatter={(value) =>
              value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
            }
            parser={(value) => value?.replace(/,/g, "") ?? ""}
            placeholder="Nhập giá"
          />
        </Form.Item>

        {selectedType === "combo" && (
          <Form.Item
            label="Số buổi học"
            name="totalSessions"
            rules={[{ required: true, message: "Vui lòng nhập số buổi" }]}
          >
            <InputNumber
              className="!w-full"
              min={1}
              placeholder="Nhập số buổi"
            />
          </Form.Item>
        )}

        {selectedType === "course" && (
          <Form.Item
            label="Thời gian học"
            name="dateRange"
            rules={[{ required: true, message: "Vui lòng chọn thời gian học" }]}
          >
            <DatePicker.RangePicker
              className="w-full"
              format="DD/MM/YYYY"
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
            />
          </Form.Item>
        )}

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
