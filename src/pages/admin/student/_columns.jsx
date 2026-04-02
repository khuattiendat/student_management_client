import {
  Button,
  DatePicker,
  Input,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  MessageOutlined,
  PhoneOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
// import dayjs from "dayjs";
const { Text } = Typography;
const filterByCurriculum = (data = []) =>
  Object.values(
    data.reduce((acc, item) => {
      const key = item?.package?.info?.curriculum || `id-${item.id}`;

      if (!acc[key] || item.remainingSessions > acc[key].remainingSessions) {
        acc[key] = item;
      }

      return acc;
    }, {}),
  );

const hasLowRemainingSessions = (record = {}) => {
  const candidateArrays = [
    record?.enrollments,
    record?.studentPackages,
    record?.packageEnrollments,
    record?.remainingSessionsByPackage,
  ];

  const detailedRows = candidateArrays.find((item) => Array.isArray(item));

  if (Array.isArray(detailedRows) && detailedRows.length > 0) {
    const filtered = filterByCurriculum(detailedRows);

    return filtered.some(
      (item) => Number(item?.remainingSessions) < 0 || item?.isPaid === false,
    );
  }

  return Number(record?.remainingSessions) < 0;
};
const hasLowThreRemainingSessions = (record = {}) => {
  const candidateArrays = [
    record?.enrollments,
    record?.studentPackages,
    record?.packageEnrollments,
    record?.remainingSessionsByPackage,
  ];

  const detailedRows = candidateArrays.find((item) => Array.isArray(item));

  if (Array.isArray(detailedRows) && detailedRows.length > 0) {
    const filtered = filterByCurriculum(detailedRows);

    return filtered.some(
      (item) =>
        Number(item?.remainingSessions) <= 3 &&
        Number(item?.remainingSessions) >= 0,
    );
  }

  const remainingSessions = Number(record?.remainingSessions);
  return remainingSessions <= 3 && remainingSessions >= 0;
};

export const buildColumns = ({
  page,
  limit,
  onEdit,
  onRenew,
  onDelete,
  onViewAttendances,
  onViewRemainingSessions,
  onViewDetail,
  canManage,
  onUpdateNotifications,
  // onUpdateCycleStartDate,
}) => [
  {
    title: "STT",
    width: 60,
    align: "center",
    render: (_, __, index) => (page - 1) * limit + index + 1,
  },
  {
    title: "Học viên",
    dataIndex: "name",
    width: 240,
    key: "name",
    render: (_, record) => {
      const isLowRemainingSessions = hasLowRemainingSessions(record);
      const isLowThreRemainingSessions = hasLowThreRemainingSessions(record);
      return (
        <div className="flex flex-col">
          <Text
            strong
            type={isLowRemainingSessions ? "danger" : undefined}
            className={isLowRemainingSessions ? "animate-pulse" : ""}
          >
            <div className="flex items-center gap-1">
              <span>{record.name}</span>
              {isLowThreRemainingSessions && (
                <div className="animate-pulse text-red-600">!</div>
              )}
            </div>
          </Text>
          <Text type="secondary">{record.phone || "—"}</Text>
        </div>
      );
    },
  },
  {
    title: "Năm sinh",
    dataIndex: "birthday",
    key: "birthday",
  },
  // {
  //   title: "Ngày bắt đầu chu kỳ",
  //   dataIndex: "cycleStartDate",
  //   width: 200,
  //   key: "cycleStartDate",
  //   render: (value, record) => (
  //     <DatePicker
  //       value={value ? dayjs(value) : null}
  //       format="DD/MM/YYYY"
  //       disabledDate={(current) => current && current.isAfter(dayjs())}
  //       onChange={(value) => onUpdateCycleStartDate(record.id, value)}
  //     />
  //   ),
  // },
  {
    title: "Cơ sở",
    dataIndex: "branch",
    width: 200,
    key: "branch",
    render: (branch) => branch?.name || "—",
  },
  {
    title: "Số buổi đã học",
    dataIndex: "learnedSessions",
    key: "learnedSessions",
    render: (value, record) => (
      <Button
        type="link"
        className="px-0!"
        onClick={() => onViewAttendances(record)}
      >
        {value ?? 0}
      </Button>
    ),
  },
  {
    title: "Buổi còn lại",
    dataIndex: "remainingSessions",
    key: "remainingSessions",
    render: (value, record) => (
      <Button
        type="link"
        className="px-0!"
        onClick={() => onViewRemainingSessions(record)}
      >
        {value ?? 0}
      </Button>
    ),
  },
  {
    title: "Thông báo",
    dataIndex: "notifications",
    key: "notifications",
    render: (_, record) => {
      return (
        <Space>
          {canManage ? (
            <div className="flex items-center gap-2">
              <Tooltip title="Đã nhắn tin">
                <div className="flex items-center gap-1">
                  <MessageOutlined />
                  <Input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={record.isTexted}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateNotifications(
                        record.id,
                        "isTexted",
                        !record.isTexted,
                      );
                    }}
                  />
                </div>
              </Tooltip>
              <Tooltip title="Đã gọi điện">
                <div className="flex items-center gap-1">
                  <PhoneOutlined />
                  <Input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={record.isCalled}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateNotifications(
                        record.id,
                        "isCalled",
                        !record.isCalled,
                      );
                    }}
                  />
                </div>
              </Tooltip>
            </div>
          ) : (
            "—"
          )}
        </Space>
      );
    },
  },
  {
    title: "Hành động",
    key: "action",
    width: 140,
    align: "center",
    render: (_, record) => (
      <Space>
        {canManage ? (
          <>
            <Tooltip title="Thông tin chi tiết">
              <Button
                type="text"
                icon={<InfoCircleOutlined className="text-blue-500!" />}
                onClick={() => onViewDetail(record)}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
              />
            </Tooltip>
            <Tooltip title="Gia hạn khóa học">
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => onRenew(record)}
              />
            </Tooltip>
            <Popconfirm
              title="Xác nhận xóa"
              description={`Bạn có chắc muốn xóa học viên "${record.name}"?`}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => onDelete(record.id)}
            >
              <Tooltip title="Xóa">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </>
        ) : (
          "—"
        )}
      </Space>
    ),
  },
];
