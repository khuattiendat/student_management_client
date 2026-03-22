import { Button, Popconfirm, Space, Tag } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

const typeColors = {
  certificate: "blue",
  general: "purple",
  school_subject: "gold",
};

const typeLabels = {
  certificate: "Gói chứng chỉ",
  general: "Gói phổ thông",
  school_subject: "Các môn trên trường",
};

const curriculumLabels = {
  english: "Tiếng Anh",
  chinese: "Tiếng Trung",
};

export const comboTypeLabels = {
  standard: "Gói tiêu chuẩn",
  breakthrough: "Gói bứt phá",
  accompanying: "Gói đồng hành",
};

const ageGroupLabels = {
  mam_non: "Mầm non (<6 tuổi)",
  tieu_hoc: "6-12 tuổi",
  tren_12: "12+ tuổi",
};

const certificateTypeLabels = {
  ielts: "IELTS",
  toeic: "TOEIC",
  hsk: "HSK",
  yct: "YCT",
};

const subjectLabels = {
  van: "Văn",
  toan: "Toán",
  tieng_viet: "Tiếng Việt",
  the_duc: "Thể Dục",
  hoa: "Hoá",
  vat_ly: "Vật Lý",
  ma_thuat_hac_am: "Ma Thuật Hắc Ám",
  gdcd: "GDCD",
  dao_duc: "Đạo Đức",
  the_thuat: "Thể Thuật",
  tu_nhien_xa_hoi: "Tự Nhiên Xã Hội",
  lich_su: "Lịch Sử",
  nhan_thuat: "Nhẫn Thuật",
  dia_ly: "Địa Lý",
};

const classLabels = {
  lop_1: "Lớp 1",
  lop_2: "Lớp 2",
  lop_3: "Lớp 3",
  lop_4: "Lớp 4",
  lop_5: "Lớp 5",
  lop_6: "Lớp 6",
  lop_7: "Lớp 7",
  lop_8: "Lớp 8",
  lop_9: "Lớp 9",
  lop_10: "Lớp 10",
  lop_11: "Lớp 11",
  lop_12: "Lớp 12",
};

const infoKeyLabels = {
  type: "Loại",
  curriculum: "Chương trình",
  comboType: "Combo",
  ageGroup: "Lứa tuổi",
  certificateType: "Chứng chỉ",
  subject: "Môn",
  class: "Khối",
};

const formatPrice = (value) =>
  Number(value || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

const renderInfoText = (info) => {
  if (!info || typeof info !== "object") return "—";

  const parts = [];
  const knownKeys = new Set([
    "type",
    "curriculum",
    "comboType",
    "ageGroup",
    "certificateType",
    "subject",
    "class",
  ]);

  if (info.type) {
    parts.push(`${infoKeyLabels.type}: ${typeLabels[info.type] || info.type}`);
  }

  if (info.curriculum) {
    parts.push(
      `${infoKeyLabels.curriculum}: ${curriculumLabels[info.curriculum] || info.curriculum}`,
    );
  }

  if (info.certificateType) {
    parts.push(
      `${infoKeyLabels.certificateType}: ${certificateTypeLabels[info.certificateType] || info.certificateType}`,
    );
  }

  if (info.subject) {
    parts.push(
      `${infoKeyLabels.subject}: ${subjectLabels[info.subject] || info.subject}`,
    );
  }

  if (info.class) {
    parts.push(
      `${infoKeyLabels.class}: ${classLabels[info.class] || info.class}`,
    );
  }

  if (info.comboType) {
    parts.push(
      `${infoKeyLabels.comboType}: ${comboTypeLabels[info.comboType] || info.comboType}`,
    );
  }

  if (info.ageGroup) {
    parts.push(
      `${infoKeyLabels.ageGroup}: ${ageGroupLabels[info.ageGroup] || info.ageGroup}`,
    );
  }

  for (const [key, rawValue] of Object.entries(info)) {
    if (knownKeys.has(key)) continue;
    if (rawValue === undefined || rawValue === null || rawValue === "")
      continue;

    const fallbackLabel = key
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]+/g, " ")
      .trim();

    parts.push(`${fallbackLabel}: ${String(rawValue)}`);
  }

  return parts.length > 0 ? parts.join(" • ") : "—";
};

export const buildColumns = ({ page, limit, onEdit, onDelete }) => [
  {
    title: "STT",
    width: 60,
    align: "center",
    render: (_, __, index) => (page - 1) * limit + index + 1,
  },
  {
    title: "Tên gói",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Loại",
    dataIndex: "type",
    key: "type",
    render: (type) => (
      <Tag color={typeColors[type] ?? "default"}>
        {typeLabels[type] || type}
      </Tag>
    ),
  },
  {
    title: "Thông tin chi tiết",
    dataIndex: "info",
    key: "info",
    render: (info) => renderInfoText(info),
  },
  {
    title: "Giá",
    dataIndex: "price",
    key: "price",
    render: (value) => formatPrice(value),
  },
  {
    title: "Số buổi",
    key: "totalSessions",
    dataIndex: "totalSessions",
    render: (value) => value ?? "—",
  },
  {
    title: "Ngày tạo",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (val) => new Date(val).toLocaleDateString("vi-VN"),
  },
  {
    title: "Hành động",
    key: "action",
    width: 120,
    align: "center",
    render: (_, record) => (
      <Space>
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => onEdit(record)}
        />
        <Popconfirm
          title="Xác nhận xóa"
          description={`Bạn có chắc muốn xóa gói "${record.name}"?`}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          onConfirm={() => onDelete(record.id)}
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    ),
  },
];
