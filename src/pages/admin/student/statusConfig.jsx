import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";

export const statusTagConfig = {
  present: {
    color: "green",
    icon: <CheckCircleOutlined />,
    text: "Có mặt",
  },
  late: {
    color: "orange",
    icon: <ClockCircleOutlined />,
    text: "Đi muộn",
  },
  unexcused_absent: {
    color: "red",
    icon: <CloseCircleOutlined />,
    text: "Nghỉ không phép",
  },
  late_cancel_absent: {
    color: "volcano",
    icon: <WarningOutlined />,
    text: "Báo nghỉ sát giờ",
  },
  unjustified_leave: {
    color: "magenta",
    icon: <WarningOutlined />,
    text: "Nghỉ có phép nhưng không chính đáng",
  },
  excused_absent: {
    color: "blue",
    icon: <CheckCircleOutlined />,
    text: "Nghỉ có phép chính đáng",
  },
};

export const ATTENDANCE_STATUS_SUGGESTIONS = [
  { value: "present", label: "Có mặt" },
  { value: "late", label: "Đi muộn" },
  { value: "unexcused_absent", label: "Nghỉ không phép" },
  { value: "late_cancel_absent", label: "Báo nghỉ sát giờ" },
  { value: "unjustified_leave", label: "Nghỉ có phép nhưng không chính đáng" },
  { value: "excused_absent", label: "Nghỉ có phép chính đáng" },
];
