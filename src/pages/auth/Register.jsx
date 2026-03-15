import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Select,
  Divider,
  App,
} from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { ROLES } from "../../utils/constants";

const { Title, Text } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const onFinish = async ({ confirmPassword: _ignored, ...payload }) => {
    try {
      await authService.register(payload);
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      message.error(err?.message || "Đăng ký thất bại");
    }
  };

  return (
    <Card className="w-[420px] rounded-xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
      <div className="mb-8 text-center">
        <Title level={3} className="!mb-1">
          Đăng ký tài khoản
        </Title>
        <Text type="secondary">Hệ thống quản lý sinh viên</Text>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} size="large">
        <Form.Item
          name="name"
          label="Họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="example@email.com" />
        </Form.Item>

        <Form.Item
          name="role"
          label="Vai trò"
          initialValue={ROLES.STUDENT}
          rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
        >
          <Select placeholder="Chọn vai trò">
            <Select.Option value={ROLES.STUDENT}>Sinh viên</Select.Option>
            <Select.Option value={ROLES.TEACHER}>Giảng viên</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu" },
            { min: 6, message: "Mật khẩu ít nhất 6 ký tự" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Ít nhất 6 ký tự"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Mật khẩu không khớp"));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập lại mật khẩu"
          />
        </Form.Item>

        <Form.Item className="!mb-3">
          <Button type="primary" htmlType="submit" block>
            Đăng ký
          </Button>
        </Form.Item>
      </Form>

      <Divider className="!my-3" />

      <div className="text-center">
        <Text type="secondary">Đã có tài khoản? </Text>
        <Link to="/login">Đăng nhập</Link>
      </div>
    </Card>
  );
};

export default Register;
