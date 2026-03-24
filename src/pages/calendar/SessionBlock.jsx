import { ClockCircleOutlined, UserOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";

const SessionBlock = ({
  session,
  slotIndex,
  visibleHours,
  onClick,
  getConfig,
  toMin,
  ROW_H,
  SLOT_H,
  SLOT_GAP,
}) => {
  const cfg = getConfig(session);
  const offsetH = toMin(session.startTime) / 60 - visibleHours[0];
  const topPx = offsetH * ROW_H + slotIndex * (SLOT_H + SLOT_GAP);

  return (
    <Tooltip
      title={
        <div className="text-xs space-y-0.5">
          <div className="font-bold text-sm">{session.title}</div>
          <div>
            <ClockCircleOutlined className="mr-1" />
            {session.startTime.slice(0, 5)} – {session.endTime?.slice(0, 5)}
          </div>
          {session.class.teacher && (
            <div>
              <UserOutlined className="mr-1" />
              {session.class.teacher.name}
            </div>
          )}
          {session.class.roomName && (
            <div>
              {/* <DoorOutlined className="mr-1" /> */}
              {session.class.roomName}
            </div>
          )}
        </div>
      }
      placement="right"
      mouseEnterDelay={0.4}
    >
      <div
        onClick={() => onClick(session)}
        className="absolute flex items-center gap-1.5 rounded cursor-pointer overflow-hidden transition-all duration-150 hover:brightness-90 hover:shadow-md"
        style={{
          top: topPx,
          left: 2,
          right: 2,
          height: SLOT_H,
          background: cfg.bg,
          borderLeft: `3px solid ${cfg.border}`,
          padding: "0 6px",
          boxShadow: "0 1px 3px rgba(0,0,0,.12)",
          zIndex: 2,
        }}
      >
        {/* Time badge */}
        <span className="text-[9px] font-bold text-white/90 bg-black/20 rounded px-1 py-px shrink-0 whitespace-nowrap">
          {session.startTime.slice(0, 5)}
        </span>
        {/* Title */}
        <span className="text-[11px] font-bold text-white truncate flex-1">
          {session.title}
        </span>
      </div>
    </Tooltip>
  );
};
export default SessionBlock;
