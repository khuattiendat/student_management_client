import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const Forbidden = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Result
        status="403"
        title="403"
        subTitle="Bạn không có quyền truy cập trang này."
        extra={
          <>
            <Button type="primary" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
            <Button type="primary" onClick={handleLogout}>
              Đăng nhập lại
            </Button>
          </>
        }
      />
    </div>
  );
};

export default Forbidden;
