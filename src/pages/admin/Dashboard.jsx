import { Card, Row, Col, Typography } from "antd";
import {
  TeamOutlined,
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const stats = [
  {
    title: "Sinh viên",
    value: 1248,
    icon: <TeamOutlined />,
    colorClass: "text-blue-600",
  },
  {
    title: "Giảng viên",
    value: 64,
    icon: <UserOutlined />,
    colorClass: "text-green-500",
  },
  {
    title: "Môn học",
    value: 32,
    icon: <BookOutlined />,
    colorClass: "text-orange-500",
  },
  {
    title: "Lịch học",
    value: 128,
    icon: <CalendarOutlined />,
    colorClass: "text-pink-600",
  },
];

const Dashboard = () => (
  <div>
    <Title level={4} className="!mb-6">
      Tổng quan hệ thống
    </Title>
    <Row gutter={[16, 16]}>
      {stats.map((stat) => (
        <Col key={stat.title} xs={24} sm={12} lg={6}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-500">{stat.title}</p>
                <p className={`text-3xl font-semibold ${stat.colorClass}`}>
                  {stat.value}
                </p>
              </div>
              <span className={`text-2xl ${stat.colorClass}`}>{stat.icon}</span>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  </div>
);

export default Dashboard;
