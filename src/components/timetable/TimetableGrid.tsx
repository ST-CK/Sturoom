// /src/components/timetable/TimetableGrid.tsx
"use client";

import { useMemo } from "react";
import { DAYS, resolveColor, Stage, TimetableEntry } from "@/lib/timetable";

const START_HOUR_UNI = 8;
const END_HOUR_UNI = 22;
const PX_PER_MIN = 1.0;

export type GridProps = {
  stage: Stage;
  entries: TimetableEntry[];
  onClickEmpty?: (day: number, minuteFromStart: number) => void;
  onClickEntry?: (entry: TimetableEntry) => void;
  onDeleteEntry?: (entry: TimetableEntry) => void;
};

export default function TimetableGrid({
  stage,
  entries,
  onClickEmpty,
  onClickEntry,
  onDeleteEntry,
}: GridProps) {
  const { hours, containerHeight, startHour } = useMemo(() => {
    if (stage === "university") {
      const hrs = Array.from(
        { length: END_HOUR_UNI - START_HOUR_UNI + 1 },
        (_, i) => START_HOUR_UNI + i
      );
      const height = (END_HOUR_UNI - START_HOUR_UNI) * 60 * PX_PER_MIN;
      return {
        hours: hrs,
        containerHeight: height,
        startHour: START_HOUR_UNI,
      };
    }
    const hrs = [8, 9, 10, 11, 12, 13, 14, 15, 16];
    const height = (16 - 8) * 60 * PX_PER_MIN;
    return { hours: hrs, containerHeight: height, startHour: 8 };
  }, [stage]);

  const dayCols = 7;
  const minutesFrom = (dayHour: number) => (dayHour - startHour) * 60;

  return (
    <div className="w-full overflow-x-auto max-md:-mx-4">
      <div className="min-w-[900px] max-md:min-w-[720px]">
        {/* 세로 스크롤 컨테이너 */}
        <div className="max-h-[70vh] overflow-y-auto">
          {/* 요일 헤더 - sticky */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] text-sm font-medium sticky top-0 z-10 bg-white/90 backdrop-blur max-md:text-xs">
            <div className="py-2" />
            {DAYS.map((d, idx) => (
              <div
                key={idx}
                className="py-2 text-center text-gray-700 max-md:px-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* 본문 */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] text-xs">
            {/* 시간축 */}
            <div className="relative" style={{ height: containerHeight }}>
              {hours.map((h) => (
                <div
                  key={h}
                  className="absolute left-1 text-xs text-gray-500 select-none"
                  style={{ top: minutesFrom(h) * PX_PER_MIN }}
                >
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {/* 요일 컬럼 */}
            {Array.from({ length: dayCols }, (_, i) => i + 1).map((day) => (
              <DayColumn
                key={day}
                day={day}
                entries={entries.filter((e) => e.day_of_week === day)}
                containerHeight={containerHeight}
                startHour={startHour}
                onClickEmpty={(min) => onClickEmpty?.(day, min)}
                onClickEntry={onClickEntry}
                onDeleteEntry={onDeleteEntry}
              />
            ))}
          </div>

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}

function DayColumn({
  day,
  entries,
  containerHeight,
  startHour,
  onClickEmpty,
  onClickEntry,
  onDeleteEntry,
}: {
  day: number;
  entries: TimetableEntry[];
  containerHeight: number;
  startHour: number;
  onClickEmpty?: (minuteFromStart: number) => void;
  onClickEntry?: (entry: TimetableEntry) => void;
  onDeleteEntry?: (entry: TimetableEntry) => void;
}) {
  const toMin = (s: string) => {
    const [hh, mm] = s.split(":").map(Number);
    return (hh - startHour) * 60 + mm;
  };

  const hourLines = (containerHeight / (60 * PX_PER_MIN)) | 0;

  return (
    <div
      className="relative border-l border-gray-200 bg-white"
      style={{ height: containerHeight }}
      onDoubleClick={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const y = e.clientY - rect.top;
        const minute = Math.round(y / PX_PER_MIN);
        onClickEmpty?.(minute);
      }}
    >
      {/* 가이드 라인 */}
      {Array.from({ length: hourLines }, (_, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 border-t border-gray-100"
          style={{ top: i * 60 * PX_PER_MIN }}
        />
      ))}

      {/* 블록 */}
      {entries.map((e) => {
        const top = toMin(e.start_time);
        const height = toMin(e.end_time) - toMin(e.start_time);
        const { bg, text } = resolveColor(e.color || undefined);

        return (
          <div
            key={e.id}
            className="absolute left-1 right-1 rounded-2xl shadow-sm cursor-pointer ring-1 ring-black/5
                       transition-transform hover:scale-[1.01] hover:shadow-md max-md:left-0.5 max-md:right-0.5 max-md:rounded-xl"
            style={{ top, height, background: bg }}
            onClick={() => onClickEntry?.(e)}
          >
            <div
              className="flex h-full flex-col justify-center gap-1 p-2 text-xs max-md:p-1.5 max-md:text-[11px]"
              style={{ color: text }}
            >
              <div className="font-semibold leading-tight truncate">
                {e.title}
              </div>
              {e.location && (
                <div className="opacity-80 truncate">{e.location}</div>
              )}
            </div>

            <button
              className="absolute bottom-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded-lg bg-white/80 hover:bg-white border border-black/5 max-md:text-[9px] max-md:px-1"
              onClick={(ev) => {
                ev.stopPropagation();
                onDeleteEntry?.(e);
              }}
            >
              삭제
            </button>
          </div>
        );
      })}
    </div>
  );
}