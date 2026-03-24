import { useMemo, useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import useSWR from "swr";
import { App, Button, Empty, Select } from "antd";
import { parseAsInteger, useQueryState } from "nuqs";
import {
  LeftOutlined,
  RightOutlined,
  HomeOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import DetailModal from "./DetailModal";
import SessionBlock from "./SessionBlock";
import sessionService from "../../services/sessionService";
import branchService from "../../services/branchService";
import {
  buildDayLayout,
  DAY_SHORT,
  getConfig,
  getVisibleHours,
  getWeek,
  MIN_COL_W,
  ROW_H,
  SLOT_GAP,
  SLOT_H,
  TIME_COL_W,
  toMin,
  TYPE_CONFIG,
} from "./util";

export default function WeeklySchedule() {
  const { message } = App.useApp();
  const [selected, setSelected] = useState(null);
  const [colW, setColW] = useState(120);
  const [offset, setOffset] = useQueryState(
    "offset",
    parseAsInteger.withDefault(0),
  );
  const [selectedBranchId, setSelectedBranchId] = useQueryState(
    "branchId",
    parseAsInteger,
  );

  const wrapRef = useRef(null);
  const days = useMemo(() => getWeek(offset), [offset]);
  const todayKey = dayjs().format("YYYY-MM-DD");
  const startDate = days[0].format("YYYY-MM-DD");
  const endDate = days[6].format("YYYY-MM-DD");

  const { data: branchOptions = [], isLoading: isBranchOptionsLoading } =
    useSWR(["calendar-branch-options"], async () => {
      const response = await branchService.list({ page: 1, limit: 1000 });
      return (response?.data?.items ?? []).map((branch) => ({
        label: branch.name,
        value: branch.id,
      }));
    });

  useEffect(() => {
    if (!branchOptions.length) return;
    if (selectedBranchId !== null) return;
    setSelectedBranchId(branchOptions[branchOptions.length - 1].value);
  }, [branchOptions, selectedBranchId, setSelectedBranchId]);

  const canFetchCalendar =
    !isBranchOptionsLoading &&
    (branchOptions.length === 0 || selectedBranchId !== null);

  const {
    data: calendarData,
    isLoading: isCalendarLoading,
    isValidating: isCalendarValidating,
    error: calendarError,
  } = useSWR(
    canFetchCalendar
      ? ["calendar-sessions", startDate, endDate, selectedBranchId]
      : null,
    async () => {
      const params = { startDate, endDate };
      if (selectedBranchId !== null) {
        params.branchId = selectedBranchId;
      }
      const response = await sessionService.calendar(params);
      return response?.data ?? { items: [], total: 0 };
    },
    {
      keepPreviousData: true,
    },
  );

  useEffect(() => {
    if (!calendarError) return;
    message.error(calendarError?.message || "Không thể tải lịch học");
  }, [calendarError, message]);

  const prevWeek = () => setOffset((value) => value - 1);
  const nextWeek = () => setOffset((value) => value + 1);
  const goToday = () => setOffset(0);

  const sessions = useMemo(() => calendarData?.items ?? [], [calendarData]);

  const grouped = useMemo(() => {
    const m = {};
    sessions.forEach((s) => {
      (m[s.sessionDate] ??= []).push(s);
    });
    return m;
  }, [sessions]);

  const dayLayouts = useMemo(
    () =>
      days.map((d) => {
        const key = d.format("YYYY-MM-DD");
        return { day: d, key, subCols: buildDayLayout(grouped[key] || []) };
      }),
    [days, grouped],
  );

  const visibleHours = useMemo(() => {
    const ws = days.flatMap((d) => grouped[d.format("YYYY-MM-DD")] || []);
    return getVisibleHours(ws);
  }, [days, grouped]);

  const totalSubCols = dayLayouts.reduce(
    (acc, dl) => acc + Math.max(1, dl.subCols.length),
    0,
  );

  useEffect(() => {
    const recalc = () => {
      if (!wrapRef.current) return;
      const available = wrapRef.current.clientWidth - TIME_COL_W;
      setColW(Math.max(Math.floor(available / totalSubCols), MIN_COL_W));
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [totalSubCols]);

  return (
    <div ref={wrapRef} className="min-h-screen bg-slate-100 font-sans">
      {/* ── Topbar ── */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800">
          <CalendarOutlined className="text-blue-500 text-base" />
          <span className="font-bold text-[15px]">
            Tuần từ{" "}
            <span className="text-blue-500">
              {days[0].format("DD/MM/YYYY")}
            </span>
            {" – "}
            <span className="text-blue-500">
              {days[6].format("DD/MM/YYYY")}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button icon={<LeftOutlined />} onClick={prevWeek} type="primary">
            Tuần trước
          </Button>
          <Button icon={<HomeOutlined />} onClick={goToday}>
            Hôm nay
          </Button>
          <Button
            icon={<RightOutlined />}
            onClick={nextWeek}
            type="primary"
            iconPosition="end"
          >
            Tuần sau
          </Button>
        </div>
      </div>

      <div className="bg-white border-b border-slate-100 px-6 py-2 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={selectedBranchId}
            placeholder="Lọc theo cơ sở"
            allowClear
            options={branchOptions}
            onChange={(value) => {
              setSelectedBranchId(value ?? null);
            }}
            className="w-52"
            showSearch
            optionFilterProp="label"
          />
        </div>

        <span className="text-xs font-medium text-slate-500">
          {isCalendarLoading || isCalendarValidating
            ? "Đang tải lịch..."
            : `${calendarData?.total ?? 0} buổi học`}
        </span>
      </div>

      {/* ── Legend ── */}
      <div className="bg-white border-b border-slate-100 px-6 py-2 flex items-center gap-5 flex-wrap">
        {Object.entries(TYPE_CONFIG).map(([k, cfg]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ background: cfg.bg }}
            />
            <span className="text-xs text-slate-500 font-medium">
              {cfg.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Grid ── */}
      <div className="overflow-x-auto p-4 pb-12">
        {!isCalendarLoading &&
        !isCalendarValidating &&
        sessions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 mb-4">
            <Empty description="Không có buổi học trong tuần này" />
          </div>
        ) : (
          <CalenderRender
            colW={colW}
            dayLayouts={dayLayouts}
            todayKey={todayKey}
            visibleHours={visibleHours}
            setSelected={setSelected}
          />
        )}
      </div>

      {selected && (
        <DetailModal
          session={selected}
          onClose={() => setSelected(null)}
          TYPE_CONFIG={TYPE_CONFIG}
          getConfig={getConfig}
        />
      )}
    </div>
  );
}

const CalenderRender = ({
  dayLayouts,
  todayKey,
  colW,
  visibleHours,
  setSelected,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
      {/* Header row 1 – day names */}
      <div className="flex border-b border-slate-200">
        <div
          className="shrink-0 bg-slate-50 border-r border-slate-200"
          style={{ width: TIME_COL_W }}
        />
        {dayLayouts.map(({ day, key, subCols }) => {
          const isToday = key === todayKey;
          return (
            <div
              key={key}
              className={`shrink-0 text-center py-2.5 border-r border-slate-200 ${isToday ? "bg-blue-50" : "bg-slate-50"}`}
              style={{ width: Math.max(1, subCols.length) * colW }}
            >
              <p
                className={`m-0 text-xs font-bold ${isToday ? "text-blue-600" : "text-slate-700"}`}
              >
                {DAY_SHORT[day.day()]}
              </p>
              <p
                className={`m-0 mt-0.5 text-[11px] ${isToday ? "text-blue-300" : "text-slate-400"}`}
              >
                {day.format("DD/MM")}
              </p>
            </div>
          );
        })}
      </div>

      {/* Header row 2 – room sub-headers */}
      <div className="flex border-b-2 border-slate-200">
        <div
          className="shrink-0 bg-slate-50 border-r border-slate-200"
          style={{ width: TIME_COL_W, height: 26 }}
        />
        {dayLayouts.map(({ key, subCols }) => {
          const isToday = key === todayKey;
          const cols = subCols.length ? subCols : [{ key: "_e", label: null }];
          return cols.map((sc, si) => (
            <div
              key={sc.key}
              className={`shrink-0 flex items-center justify-center text-[10px] font-bold tracking-wide
                    ${sc.label ? "text-blue-600" : "text-transparent"}
                    ${isToday ? "bg-blue-50" : "bg-slate-50"}
                    ${si < cols.length - 1 ? "border-r border-dashed border-slate-200" : "border-r border-slate-200"}`}
              style={{ width: colW, height: 26 }}
            >
              {sc.label || "·"}
            </div>
          ));
        })}
      </div>

      {/* Body */}
      <div className="flex">
        {/* Time column */}
        <div
          className="shrink-0 bg-slate-50 border-r border-slate-200 sticky left-0 z-20"
          style={{ width: TIME_COL_W }}
        >
          {visibleHours.map((h, i) => (
            <div
              key={h}
              className="flex items-start justify-end pr-2 pt-1 text-[10px] text-slate-400 font-semibold"
              style={{
                height: ROW_H,
                borderBottom:
                  i < visibleHours.length - 1 ? "1px solid #F1F5F9" : "none",
              }}
            >
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* Day columns */}
        {dayLayouts.map(({ key, subCols }) => {
          const isToday = key === todayKey;
          const cols = subCols.length
            ? subCols
            : [{ key: "_e", label: null, sessions: [] }];
          const totalH = visibleHours.length * ROW_H;

          return (
            <div
              key={key}
              className={`flex shrink-0 border-r border-slate-200 ${isToday ? "bg-blue-50/30" : "bg-white"}`}
              style={{ width: cols.length * colW }}
            >
              {cols.map((sc, si) => {
                const byTime = {};
                (sc.sessions || []).forEach((s) => {
                  (byTime[s.startTime] ??= []).push(s);
                });

                return (
                  <div
                    key={sc.key}
                    className={`shrink-0 relative ${si < cols.length - 1 ? "border-r border-dashed border-slate-100" : ""}`}
                    style={{ width: colW }}
                  >
                    {/* Hour grid lines */}
                    {visibleHours.map((h, i) => (
                      <div
                        key={h}
                        className="absolute left-0 right-0 border-b border-slate-100 pointer-events-none"
                        style={{ top: i * ROW_H }}
                      />
                    ))}

                    {/* Session blocks */}
                    {Object.entries(byTime).map(([, slots]) =>
                      slots.map((s, idx) => (
                        <SessionBlock
                          key={s.id}
                          session={s}
                          slotIndex={idx}
                          visibleHours={visibleHours}
                          onClick={setSelected}
                          ROW_H={ROW_H}
                          SLOT_H={SLOT_H}
                          SLOT_GAP={SLOT_GAP}
                          getConfig={getConfig}
                          toMin={toMin}
                        />
                      )),
                    )}

                    <div style={{ height: totalH }} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
