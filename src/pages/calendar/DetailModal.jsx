import {
  BankOutlined,
  ClockCircleOutlined,
  TagOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Modal, Tag } from "antd";

const DetailModal = ({ session, onClose, TYPE_CONFIG, getConfig }) => {
  const cfg = getConfig(session);
  const typeLabel =
    session.class.status === "completed"
      ? TYPE_CONFIG.completed.label
      : TYPE_CONFIG[session.class.type]?.label || "Phổ thông";

  const rows = [
    {
      icon: <TagOutlined />,
      label: "Loại lớp",
      value: <Tag color={cfg.tagColor}>{typeLabel}</Tag>,
    },
    session.class.teacher && {
      icon: <UserOutlined />,
      label: "Giáo viên",
      value: session.class.teacher.name,
    },
    session.class.branch && {
      icon: <BankOutlined />,
      label: "Cơ sở",
      value: session.class.branch.name,
    },
    session.class.roomName && {
      icon: <BankOutlined />,
      label: "Phòng học",
      value: session.class.roomName,
    },
  ].filter(Boolean);

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      width={340}
      styles={{ body: { padding: 0 } }}
      centered
      destroyOnHide
    >
      {/* Coloured header */}
      <div
        className="flex items-start justify-between px-5 py-4 rounded-t-lg mt-8"
        style={{ background: cfg.bg }}
      >
        <div>
          <p className="m-0 text-sm font-extrabold text-white leading-snug">
            {session.title}
          </p>
          <p className="m-0 mt-1 text-xs text-white/80 flex items-center gap-1">
            <ClockCircleOutlined /> Bắt đầu lúc {session.startTime.slice(0, 5)}
          </p>
        </div>
      </div>

      {/* Info rows */}
      <div className="px-5 py-4 flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <span className="text-base text-slate-400 w-5 flex-shrink-0">
              {row.icon}
            </span>
            <div>
              <p className="m-0 text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                {row.label}
              </p>
              <p className="m-0 text-sm text-slate-800 font-semibold">
                {row.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default DetailModal;
