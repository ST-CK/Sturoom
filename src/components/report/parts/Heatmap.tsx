"use client";

import { HeatDot } from "../types";
import { fmtDate } from "../utils";

export default function Heatmap({ data }: { data: HeatDot[] }) {
  const MAX_WEEKS = 20;
  const TOTAL_CELLS = MAX_WEEKS * 7;

  // 현재 데이터 길이
  const len = data.length;

  // data 길이가 140보다 작으면 앞쪽을 placeholder로 채움
  const missing = TOTAL_CELLS - len;

  // 🔹 HeatDot 타입 맞춰서 placeholder 생성 (date는 Date 객체로!)
  const placeholder: HeatDot[] = Array.from({ length: missing }, (_, i) => ({
    date: new Date(0 + i), // 의미 없는 가장 옛날 날짜. title로 보이지도 않음.
    value: 0,              // 회색 블록
    visited: false
  }));

  // 🔹 fullGrid = placeholder + 실제 데이터
  const fullGrid = [...placeholder, ...data];

  // 🔹 열(week) 단위로 잘라서 matrix 생성
  const matrix = Array.from({ length: MAX_WEEKS }, (_, w) =>
    fullGrid.slice(w * 7, w * 7 + 7)
  );

  const color = (v: number) =>
    [
      "bg-neutral-200", // 0
      "bg-green-200",   // 1
      "bg-green-300",   // 2
      "bg-green-400",   // 3
      "bg-green-500"    // 4
    ][v] || "bg-neutral-200";

  return (
    <div
      className="
        flex gap-1 overflow-x-auto pb-1
        /* 📱 모바일 대응 */
        sm:gap-1.5 sm:pb-2
      "
    >
      {matrix.map((col, i) => (
        <div key={i} className="flex flex-col gap-1 sm:gap-1.5">
          {col.map((d, j) => (
            <div
              key={`${i}-${j}`}
              className={`
                rounded-sm ${color(d.value)}
                /* 기본(PC) */ h-3 w-3
                /* 📱 모바일 크기 증가 */ sm:h-4 sm:w-4
              `}
              title={fmtDate(d.date)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}