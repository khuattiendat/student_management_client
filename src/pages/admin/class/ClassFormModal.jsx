import { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Table,
  TimePicker,
} from "antd";
import dayjs from "dayjs";
import classService from "../../../services/classService";

const statusOptions = [
  { label: "Hoạt động", value: "active" },
  { label: "Ngừng hoạt động", value: "inactive" },
  { label: "Đã hoàn thành", value: "completed" },
];

const weekdayOptions = [
  { label: "Chủ nhật", value: 0 },
  { label: "Thứ 2", value: 1 },
  { label: "Thứ 3", value: 2 },
  { label: "Thứ 4", value: 3 },
  { label: "Thứ 5", value: 4 },
  { label: "Thứ 6", value: 5 },
  { label: "Thứ 7", value: 6 },
];

const buildTimeValue = (timeText) => {
  if (!timeText) return undefined;
  const [hourText, minuteText] = String(timeText).split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return undefined;
  }

  return dayjs().hour(hour).minute(minute).second(0);
};

const ClassFormModal = ({
  open,
  onClose,
  editing,
  onSaved,
  branchOptions = [],
  teacherOptions = [],
  packageOptions = [],
  studentOptions = [],
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const selectedStudentIds = Form.useWatch("studentIds", form);

  const selectedStudents = useMemo(() => {
    const selectedIdSet = new Set(selectedStudentIds ?? []);
    return studentOptions.filter((student) => selectedIdSet.has(student.value));
  }, [selectedStudentIds, studentOptions]);

  useEffect(() => {
    const loadEditingData = async () => {
      if (!open) return;

      if (!editing) {
        form.setFieldsValue({
          name: "",
          branchId: undefined,
          teacherId: undefined,
          packageId: undefined,
          weekdays: [],
          startDate: undefined,
          startTime: undefined,
          endTime: undefined,
          status: "active",
          studentIds: [],
        });
        return;
      }

      setLoadingDetail(true);
      try {
        const response = await classService.detail(editing.id);
        const detail = response?.data ?? editing;

        form.setFieldsValue({
          name: detail?.name ?? "",
          branchId: detail?.branchId ?? detail?.branch?.id ?? undefined,
          teacherId: detail?.teacherId ?? detail?.teacher?.id ?? undefined,
          packageId: detail?.packageId ?? detail?.package?.id ?? undefined,
          weekdays: detail?.weekdays ?? [],
          startDate: detail?.startDate ? dayjs(detail.startDate) : undefined,
          startTime: buildTimeValue(detail?.startTime),
          endTime: buildTimeValue(detail?.endTime),
          status: detail?.status ?? "active",
          studentIds: (detail?.students ?? []).map((student) => student.id),
        });
      } catch (err) {
        message.error(err?.message || "Không thể tải chi tiết lớp học");
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
      const payload = {
        name: values.name,
        branchId: values.branchId,
        teacherId: values.teacherId,
        packageId: values.packageId,
        weekdays: values.weekdays ?? [],
        startTime: values.startTime?.format("HH:mm"),
        endTime: values.endTime?.format("HH:mm"),
        status: values.status,
        studentIds: values.studentIds ?? [],
      };

      if (editing) {
        await classService.update(editing.id, payload);
        message.success("Cập nhật lớp học thành công");
      } else {
        payload.startDate = values.startDate?.format("YYYY-MM-DD");
        await classService.create(payload);
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
      destroyOnClose
      width={1100}
      confirmLoading={loadingDetail}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        className="mt-4 grid grid-cols-1 gap-x-4 md:grid-cols-2"
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
          label="Giáo viên"
          name="teacherId"
          rules={[{ required: true, message: "Vui lòng chọn giáo viên" }]}
        >
          <Select
            options={teacherOptions}
            placeholder="Chọn giáo viên"
            optionFilterProp="label"
            showSearch
          />
        </Form.Item>

        <Form.Item
          label="Gói học"
          name="packageId"
          rules={[{ required: true, message: "Vui lòng chọn gói học" }]}
        >
          <Select
            options={packageOptions}
            placeholder="Chọn gói học"
            optionFilterProp="label"
            showSearch
          />
        </Form.Item>

        <Form.Item
          label="Ngày bắt đầu"
          name="startDate"
          rules={
            editing
              ? []
              : [{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]
          }
        >
          <DatePicker
            className="w-full!"
            format="DD/MM/YYYY"
            disabled={Boolean(editing)}
            placeholder={
              editing ? "Ngày bắt đầu không thể chỉnh sửa" : "Chọn ngày bắt đầu"
            }
          />
        </Form.Item>

        <Form.Item
          label="Thứ học trong tuần"
          name="weekdays"
          rules={[
            { required: true, message: "Vui lòng chọn ít nhất 1 thứ học" },
          ]}
        >
          <Select
            mode="multiple"
            options={weekdayOptions}
            placeholder="Chọn thứ học"
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          label="Giờ bắt đầu"
          name="startTime"
          rules={[{ required: true, message: "Vui lòng chọn giờ bắt đầu" }]}
        >
          <TimePicker className="w-full!" format="HH:mm" minuteStep={5} />
        </Form.Item>

        <Form.Item
          label="Giờ kết thúc"
          name="endTime"
          rules={[{ required: true, message: "Vui lòng chọn giờ kết thúc" }]}
        >
          <TimePicker className="w-full!" format="HH:mm" minuteStep={5} />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select options={statusOptions} placeholder="Chọn trạng thái" />
        </Form.Item>

        <Form.Item label="Học sinh" name="studentIds" className="md:col-span-2">
          <Select
            mode="multiple"
            options={studentOptions}
            placeholder="Chọn học sinh"
            optionFilterProp="label"
            showSearch
          />
        </Form.Item>

        <div className="md:col-span-2">
          <Table
            rowKey="value"
            dataSource={selectedStudents}
            pagination={false}
            size="small"
            bordered
            locale={{ emptyText: "Chưa chọn học sinh" }}
            columns={[
              {
                title: "Họ tên",
                dataIndex: "name",
                key: "name",
                render: (value) => value || "—",
              },
              {
                title: "Số điện thoại",
                dataIndex: "phone",
                key: "phone",
                render: (value) => value || "—",
              },
              {
                title: "Cơ sở",
                dataIndex: "branchName",
                key: "branchName",
                render: (value) => value || "—",
              },
            ]}
          />
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

export default ClassFormModal;
