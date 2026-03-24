import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();
  const onClick = () => {
    navigate(-1);
  };

  return (
    <Button
      type="link"
      onClick={onClick}
      className="px-0 !mb-0 hover:underline"
    >
      <ArrowLeftOutlined /> Quay lại
    </Button>
  );
};

export default BackButton;
