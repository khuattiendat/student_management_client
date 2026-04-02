import dayjs from "dayjs";

export const SLOT_H = 28;
export const SLOT_GAP = 4;
export const ROW_H = 48;
export const TIME_COL_W = 56;
export const MIN_COL_W = 80;

export const TYPE_CONFIG = {
  certificate: {
    bg: "#F59E0B",
    border: "#D97706",
    tagColor: "gold",
    label: "Chứng chỉ",
  },
  school_subject: {
    bg: "#10B981",
    border: "#059669",
    tagColor: "green",
    label: "Môn học",
  },
  general: {
    bg: "#df4830",
    border: "#df4830",
    tagColor: "volcano",
    label: "Phổ thông",
  },
};

export const DAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export const getConfig = (s) =>
  s.class.status === "completed"
    ? TYPE_CONFIG.completed
    : TYPE_CONFIG[s.class.type] || TYPE_CONFIG.general;
export const toMin = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
export const toHour = (t) => Math.floor(toMin(t) / 60);

export function getWeek(offset) {
  const base = dayjs().add(offset, "week").startOf("day");
  const day = base.day();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = base.add(diffToMonday, "day");
  return Array.from({ length: 7 }, (_, i) => monday.add(i, "day"));
}

export function getVisibleHours(sessions) {
  if (!sessions.length) return Array.from({ length: 24 }, (_, i) => i);
  const minH = Math.max(
    0,
    Math.min(...sessions.map((s) => toHour(s.startTime))) - 1,
  );
  const maxH = Math.min(
    23,
    Math.max(...sessions.map((s) => toHour(s.endTime ?? s.startTime))) + 1,
  );
  return Array.from({ length: maxH - minH + 1 }, (_, i) => minH + i);
}

export function buildDayLayout(sessions) {
  const rooms = [
    ...new Set(
      sessions.filter((s) => s.class.roomName).map((s) => s.class.roomName),
    ),
  ].sort();
  const noRoom = [...sessions.filter((s) => !s.class.roomName)].sort(
    (a, b) => toMin(a.startTime) - toMin(b.startTime),
  );
  const vCols = [];
  for (const s of noRoom) {
    let placed = false;
    for (const col of vCols) {
      if (!col.some((x) => x.startTime === s.startTime)) {
        col.push(s);
        placed = true;
        break;
      }
    }
    if (!placed) vCols.push([s]);
  }
  return [
    ...vCols.map((ss, i) => ({ key: `_v${i}`, label: null, sessions: ss })),
    ...rooms.map((room) => ({
      key: room,
      label: room,
      sessions: sessions.filter((s) => s.class.roomName === room),
    })),
  ];
}
