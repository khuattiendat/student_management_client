import {
  Modal,
  Form,
  DatePicker,
  TimePicker,
  Button,
  InputNumber,
  Select,
} from "antd";
import useAuthStore from "../../../../store/authStore";
import { ROLES } from "../../../../utils/constants";
import useSWR from "swr";
import sessionService from "../../../../services/sessionService";
import dayjs from "dayjs";

const ModalAddSession = ({ classId, open, onClose, onSubmit, isEdit }) => {
  const userRole = useAuthStore((s) => s.user?.role);
  const canManage = userRole === ROLES.ADMIN;
  const [form] = Form.useForm();

  const { data: sessionListData, isLoading: sessionsLoading } = useSWR(
    ["sessions", classId],
    async () => {
      const response = await sessionService.list({
        classId,
        limit: 1000,
      });

      return response?.data ?? { items: [], pagination: { total: 0 } };
    },
    {
      keepPreviousData: true,
    },
  );

  const handleFinish = async (values) => {
    const payload = {
      classId: Number(classId),
      sessionDate: values.sessionDate.format("YYYY-MM-DD"),
      startTime: values.startTime.format("HH:mm"),
      endTime: values.endTime.format("HH:mm"),
      code: values.code,
      sessionId: values.sessionId,
    };
    await onSubmit(payload);
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEdit ? "Tạo buổi bù" : "Thêm buổi học mới"}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          classId,
        }}
        className="mt-4"
      >
        {/* Session Date */}
        <Form.Item
          label="Ngày học"
          name="sessionDate"
          rules={[{ required: true, message: "Vui lòng chọn ngày học" }]}
        >
          <DatePicker className="!w-full" format="DD/MM/YYYY" />
        </Form.Item>

        {/* Start Time */}
        <Form.Item
          label="Giờ bắt đầu"
          name="startTime"
          rules={[{ required: true, message: "Vui lòng chọn giờ bắt đầu" }]}
        >
          <TimePicker className="!w-full" format="HH:mm" minuteStep={5} />
        </Form.Item>

        {/* End Time */}
        <Form.Item
          label="Giờ kết thúc"
          name="endTime"
          dependencies={["startTime"]}
          rules={[
            { required: true, message: "Vui lòng chọn giờ kết thúc" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const start = getFieldValue("startTime");
                if (!start || !value || value.isAfter(start)) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Giờ kết thúc phải sau giờ bắt đầu"),
                );
              },
            }),
          ]}
        >
          <TimePicker className="!w-full" format="HH:mm" minuteStep={5} />
        </Form.Item>
        {isEdit && (
          <Form.Item
            label="Buổi học được thay thế"
            name="sessionId"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn buổi học được thay thế",
              },
            ]}
          >
            <Select
              className="!w-full"
              placeholder="Buổi học được thay thế:"
              showSearch
              optionFilterProp="label"
              loading={sessionsLoading}
              options={sessionListData?.items.map((session) => ({
                label: `Buổi ngày ${dayjs(session.sessionDate).format("DD-MM-YYYY")} `,
                value: session.id,
              }))}
            />
          </Form.Item>
        )}

        {!canManage && (
          <Form.Item
            label="Xác nhận mã code"
            name="code"
            rules={[
              { required: true, message: "Vui lòng nhập mã code để xác nhận" },
            ]}
          >
            <InputNumber
              className="!w-full"
              placeholder="Nhập mã code để xác nhận"
            />
          </Form.Item>
        )}

        {/* Submit */}
        <Form.Item className="mb-0 mt-4">
          <Button type="primary" htmlType="submit" block>
            {isEdit ? "Tạo buổi bù" : "Tạo buổi học"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalAddSession;
