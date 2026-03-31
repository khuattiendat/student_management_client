import { useState, useMemo } from "react";
import { Card, Row, Col, Typography, Alert, Select, Space, Empty } from "antd";
import {
  TeamOutlined,
  BookOutlined,
  UserOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import useSWR from "swr";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import axiosInstance from "../../services/axiosInstance";
import branchService from "../../services/branchService";
import Heading from "../../components/common/Heading";

const { Title, Text } = Typography;

const Dashboard = () => {
  const [branchId, setBranchId] = useState(null);

  const { data: branchData, isLoading: branchLoading } = useSWR(
    ["dashboard-branch-options"],
    async () => {
      const response = await branchService.list({ page: 1, limit: 1000 });
      return response?.data?.items ?? [];
    },
  );

  const { data, error, isLoading } = useSWR(
    ["admin-dashboard", branchId],
    async () => {
      return axiosInstance.get("/admin/dashboard", {
        params: { branchId: branchId || undefined },
      });
    },
  );

  const dashboard = data?.data;

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("vi-VN", {
        maximumFractionDigits: 2,
      }),
    [],
  );

  const overview = dashboard?.overview ?? {};
  const topClassesBySize = useMemo(
    () => dashboard?.topClassesBySize ?? [],
    [dashboard],
  );
  const byBranch = useMemo(() => dashboard?.byBranch ?? [], [dashboard]);
  const newStudentsByMonth = useMemo(
    () => dashboard?.newStudentsByMonth ?? [],
    [dashboard],
  );
  const branchFilter = dashboard?.branchFilter ?? null;

  const topClassesChartData = useMemo(
    () =>
      topClassesBySize.map((item) => ({
        className: item.className,
        branchName: item.branchName,
        size: Number(item.size ?? 0),
      })),
    [topClassesBySize],
  );

  const newStudentsChartData = useMemo(
    () =>
      newStudentsByMonth.map((item) => ({
        monthLabel: item.monthLabel,
        count: Number(item.count ?? 0),
      })),
    [newStudentsByMonth],
  );

  const byBranchChartData = useMemo(
    () =>
      byBranch.map((item) => ({
        branchName: item.branchName,
        studentsTotal: Number(item.studentsTotal ?? 0),
        classesTotal: Number(item.classesTotal ?? 0),
        newStudentsLast6Months: Number(item.newStudentsLast6Months ?? 0),
      })),
    [byBranch],
  );

  const stats = [
    {
      title: "Sinh viên",
      value: overview?.studentsTotal ?? 0,
      icon: <TeamOutlined />,
      colorClass: "text-blue-600",
    },
    {
      title: "Giảng viên",
      value: overview?.teachersTotal ?? 0,
      icon: <UserOutlined />,
      colorClass: "text-green-500",
    },
    {
      title: "Lớp học",
      value: overview?.classesTotal ?? 0,
      icon: <BookOutlined />,
      colorClass: "text-orange-500",
    },
    {
      title: "Học viên mới (6 tháng)",
      value: overview?.newStudentsLast6Months ?? 0,
      icon: <UserAddOutlined />,
      colorClass: "text-pink-600",
    },
  ];

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        message="Không thể tải dashboard"
        description={
          error?.response?.data?.error?.message ??
          error?.message ??
          "Vui lòng thử lại sau"
        }
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Heading title="Dashboard thống kê theo cơ sở" />
        <Space className="w-full md:w-auto justify-between md:justify-end">
          <Text type="secondary">Lọc theo cơ sở:</Text>
          <Select
            value={branchId ?? ""}
            loading={branchLoading}
            className="w-full md:w-64"
            options={[
              { label: "Tất cả cơ sở", value: "" },
              ...(branchData ?? []).map((b) => ({
                label: b.name,
                value: b.id,
              })),
            ]}
            onChange={(value) => setBranchId(value || null)}
            showSearch
            optionFilterProp="label"
          />
        </Space>
      </div>

      {/* Branch info */}
      <div className="mb-4 text-sm text-gray-500 text-center md:text-left">
        {branchFilter?.branchName ? (
          <>
            Đang xem thống kê của cơ sở:{" "}
            <Text strong>{branchFilter.branchName}</Text>
          </>
        ) : (
          "Đang xem thống kê toàn hệ thống"
        )}
      </div>

      {/* Stats */}
      <Row gutter={[12, 12]}>
        {stats.map((stat) => (
          <Col key={stat.title} xs={24} sm={12} lg={6}>
            <Card loading={isLoading} bodyStyle={{ padding: 12 }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-gray-500">{stat.title}</p>
                  <p
                    className={`text-2xl md:text-3xl font-semibold ${stat.colorClass}`}
                  >
                    {formatter.format(stat.value ?? 0)}
                  </p>
                </div>
                <span className={`text-xl md:text-2xl ${stat.colorClass}`}>
                  {stat.icon}
                </span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Line Chart */}
      <Row gutter={[12, 12]} className="mt-6">
        <Col xs={24}>
          <Card loading={isLoading} title="Học viên mới trong 6 tháng qua">
            {newStudentsChartData.length ? (
              <div className="h-56 md:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={newStudentsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value) =>
                        formatter.format(Number(value ?? 0))
                      }
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Học viên mới"
                      stroke="#0891b2"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="Chưa có dữ liệu" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Top classes */}
      <Row gutter={[12, 12]} className="mt-6">
        <Col xs={24}>
          <Card loading={isLoading} title="Sĩ số 5 lớp đông nhất">
            {topClassesChartData.length ? (
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topClassesChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="className"
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value) =>
                        formatter.format(Number(value ?? 0))
                      }
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                      dataKey="size"
                      name="Sĩ số"
                      fill="#2563eb"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="Chưa có dữ liệu" />
            )}
          </Card>
        </Col>
      </Row>

      {/* By branch */}
      <Row gutter={[12, 12]} className="mt-6">
        <Col xs={24}>
          <Card loading={isLoading} title="Thống kê theo từng cơ sở">
            {byBranchChartData.length ? (
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byBranchChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="branchName" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value) =>
                        formatter.format(Number(value ?? 0))
                      }
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                      dataKey="studentsTotal"
                      name="Sinh viên"
                      fill="#1d4ed8"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="classesTotal"
                      name="Lớp học"
                      fill="#ea580c"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="newStudentsLast6Months"
                      name="HV mới 6 tháng"
                      fill="#0f766e"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="Chưa có dữ liệu" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
