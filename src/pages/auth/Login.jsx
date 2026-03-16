import { Form, Input, Button, Card, Typography, Divider, App } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import authService from "../../services/authService";

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();

  const from = location.state?.from?.pathname || "/";

  const onFinish = async (values) => {
    try {
      const response = await authService.login(values);
      login(response.data);
      message.success("Đăng nhập thành công!");
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Tên đăng nhập hoặc mật khẩu không đúng";
      message.error(errorMessage);
    }
  };

  return (
    <Card className="w-[400px] rounded-xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
      <div className="mb-8 text-center">
        <Title level={3} className="!mb-1">
          Đăng nhập
        </Title>
        <Text type="secondary">Hệ thống quản lý học sinh</Text>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} size="large">
        <Form.Item
          name="userName"
          rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Mật khẩu"
            autoComplete="off"
          />
        </Form.Item>

        <Form.Item className="!mb-3">
          <Button type="primary" htmlType="submit" block>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Login;
