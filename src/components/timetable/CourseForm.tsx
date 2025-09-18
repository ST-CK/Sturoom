// /src/components/timetable/CourseForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { DAYS, periodTimeMap, Stage, TimetableEntry } from "@/lib/timetable";

/** 개별 시간 블록(슬롯) */
export type TimeSlot = {
  days: number[];        // 1..7 (월..일)
  start_time?: string;   // 'HH:MM'
  end_time?: string;     // 'HH:MM'
  period_from?: number;  // K-12 전용
  period_to?: number;    // K-12 전용
};

export type CoursePayload = {
  title: string;
  location?: string;
  instructor?: string;
  color?: string;        // 파스텔 HEX (자동)
  memo?: string;
  slots: TimeSlot[];     // ✅ 여러 개의 시간 블록 지원
};

export default function CourseForm({
  stage,
  initial,
  onCancel,
  onSave,
}: {
  stage: Stage;
  initial?: Partial<TimetableEntry> & { days?: number[] };
  onCancel: () => void;
  onSave: (payload: CoursePayload) => void;
}) {
  // 기본 정보
  const [title, setTitle] = useState(initial?.title ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [instructor, setInstructor] = useState(initial?.instructor ?? "");
  const [color, setColor] = useState<string>(initial?.color ?? randomPastel());
  const [memo, setMemo] = useState<string>(initial?.memo ?? "");

  // 초기 슬롯: 수정모드면 해당 엔트리 1개를 슬롯으로 구성, 아니면 기본 슬롯 1개
  const initialSlots: TimeSlot[] = useMemo(() => {
    if (initial) {
      const firstDays = initial.days ?? (initial.day_of_week ? [initial.day_of_week] : [1]);
      return [
        {
          days: firstDays,
          start_time: initial.start_time?.slice(0, 5) ?? "09:00",
          end_time: initial.end_time?.slice(0, 5) ?? "10:00",
          period_from: initial.period_from ?? undefined,
          period_to: initial.period_to ?? undefined,
        },
      ];
    }
    return [{ days: [1], start_time: "09:00", end_time: "10:00", period_from: 1, period_to: 2 }];
  }, [initial]);

  const [slots, setSlots] = useState<TimeSlot[]>(initialSlots);

  // K-12는 교시 → 시간 자동 계산
  useEffect(() => {
    if (stage === "university") return;
    setSlots((prev) =>
      prev.map((s) => {
        const pf = s.period_from ?? 1;
        const pt = s.period_to ?? Math.max(pf, 2);
        const mapped = periodTimeMap[stage](pf, pt);
        return mapped ? { ...s, start_time: mapped.start, end_time: mapped.end } : s;
      })
    );
  }, [stage]);

  const addSlot = () => {
    const last = slots[slots.length - 1];
    // 마지막 슬롯 기준 살짝 다른 시간으로 추가
    const nextStart = last?.start_time ?? "09:00";
    const [h, m] = nextStart.split(":").map(Number);
    const propose = `${String(Math.min(h + 1, 21)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    setSlots((arr) => [
      ...arr,
      stage === "university"
        ? { days: [1], start_time: propose, end_time: "23:59" > propose ? timePlus(propose, 60) : "23:00" }
        : { days: [1], period_from: 3, period_to: 4 }, // K-12 기본 교시
    ]);
  };

  const removeSlot = (idx: number) => setSlots((arr) => arr.filter((_, i) => i !== idx));

  const updateSlot = (idx: number, patch: Partial<TimeSlot>) =>
    setSlots((arr) => arr.map((s, i) => (i === idx ? { ...s, ...patch } : s)));

  const toggleDay = (idx: number, d: number) =>
    setSlots((arr) =>
      arr.map((s, i) => {
        if (i !== idx) return s;
        const has = s.days.includes(d);
        const days = has ? s.days.filter((x) => x !== d) : [...s.days, d].sort((a, b) => a - b);
        return { ...s, days };
      })
    );

  // 저장 핸들러
  const handleSave = () => {
    // 간단 검증
    if (!title.trim()) return alert("과목/활동명을 입력해 주세요.");
    if (slots.length === 0) return alert("시간 블록을 1개 이상 추가해 주세요.");
    const normalized = slots
      .map((s) => normalizeSlot(stage, s))
      .filter((s) => s.days.length && s.start_time && s.end_time) as TimeSlot[];

    if (normalized.length === 0) return alert("유효한 시간 블록이 없습니다.");

    onSave({
      title: title.trim(),
      location: location.trim() || undefined,
      instructor: instructor.trim() || undefined,
      color,
      memo: memo.trim() || undefined,
      slots: normalized,
    });
  };

  return (
    <div className="p-4 space-y-5">
      {/* 헤더 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="과목/활동명">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-2xl border px-3 py-2"
            placeholder="예: 수학 / 데이터베이스"
          />
        </Field>
        <Field label="장소">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 w-full rounded-2xl border px-3 py-2"
            placeholder="예: 3-2반 / 공대 102호"
          />
        </Field>
        <Field label="지도교사/교수">
          <input
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            className="mt-1 w-full rounded-2xl border px-3 py-2"
          />
        </Field>

        {/* 색상: 파스텔 자동 + 다시 뽑기 */}
        <Field label="블록 색상 (자동)">
          <div className="mt-1 flex items-center gap-2">
            <div className="h-7 w-7 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-500">{color}</span>
            <button
              type="button"
              onClick={() => setColor(randomPastel())}
              className="ml-auto rounded-xl border px-2.5 py-1 text-xs hover:bg-gray-50"
              title="다른 파스텔 색상으로 변경"
            >
              다시 뽑기
            </button>
          </div>
        </Field>
      </div>

      {/* 슬롯 목록 */}
      <div className="space-y-3">
        {slots.map((s, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 bg-slate-50/40 p-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-slate-900 text-white text-xs font-semibold">
                  #{idx + 1}
                </span>
                <span className="text-sm font-medium text-slate-700">
                  시간 블록
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeSlot(idx)}
                className="rounded-lg border px-2 py-1 text-xs text-slate-700 hover:bg-white"
                title="이 블록 삭제"
                disabled={slots.length === 1}
              >
                삭제
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 요일 */}
              <div className="md:col-span-1">
                <div className="text-xs font-medium text-slate-600 mb-1.5">요일</div>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS.map((label, i) => {
                    const d = i + 1;
                    const active = s.days.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDay(idx, d)}
                        className={`px-2.5 py-1 rounded-full border text-xs transition ${
                          active ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-100"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 시간 / 교시 */}
              {stage === "university" ? (
                <>
                  <Field small label="시작">
                    <input
                      type="time"
                      value={s.start_time ?? "09:00"}
                      onChange={(e) => updateSlot(idx, { start_time: e.target.value })}
                      className="mt-1 w-full rounded-xl border px-3 py-2"
                    />
                  </Field>
                  <Field small label="종료">
                    <input
                      type="time"
                      value={s.end_time ?? "10:00"}
                      onChange={(e) => updateSlot(idx, { end_time: e.target.value })}
                      className="mt-1 w-full rounded-xl border px-3 py-2"
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field small label="시작 교시">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={s.period_from ?? 1}
                      onChange={(e) =>
                        updateSlot(idx, { period_from: clamp(parseInt(e.target.value || "1"), 1, 10) })
                      }
                      className="mt-1 w-full rounded-xl border px-3 py-2"
                    />
                  </Field>
                  <Field small label="종료 교시">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={s.period_to ?? Math.max(s.period_from ?? 1, 2)}
                      onChange={(e) =>
                        updateSlot(idx, { period_to: clamp(parseInt(e.target.value || "1"), 1, 10) })
                      }
                      className="mt-1 w-full rounded-xl border px-3 py-2"
                    />
                  </Field>
                  <div className="flex items-center text-xs text-slate-500">
                    {/* 자동 계산 결과 미리보기 */}
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 border">
                      {previewK12(stage, s)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={addSlot}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
        >
          + 시간 블록 추가
        </button>
        <span className="text-xs text-slate-500">한 과목이 여러 요일·시간에 열릴 때 사용하세요.</span>
      </div>

      <Field label="메모 (선택)">
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="mt-1 w-full rounded-2xl border px-3 py-2"
          rows={3}
        />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <button className="px-4 py-2 rounded-xl border" onClick={onCancel}>
          취소
        </button>
        <button className="px-4 py-2 rounded-xl bg-gray-900 text-white" onClick={handleSave}>
          저장
        </button>
      </div>
    </div>
  );
}

/* ---------- 작은 프리미티브들 ---------- */
function Field({
  label,
  children,
  small,
}: {
  label: string;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <div className={small ? "" : ""}>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function previewK12(stage: Stage, s: TimeSlot) {
  if (!s.period_from || !s.period_to) return "교시 선택";
  const mapped = periodTimeMap[stage](s.period_from, s.period_to);
  if (!mapped) return "시간 계산 불가";
  return `${mapped.start}–${mapped.end}`;
}

/* === 유틸: 파스텔 랜덤 생성 === */
function randomPastel(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 62 + Math.random() * 14; // 62–76%
  const l = 82 + Math.random() * 8;  // 82–90%
  return hslToHex(h, s, l);
}
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(255 * x).toString(16).padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}
function timePlus(hhmm: string, min: number) {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + min;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(Math.min(nh, 23)).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}
function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, isNaN(n) ? a : n));
}
function normalizeSlot(stage: Stage, s: TimeSlot): TimeSlot {
  if (stage !== "university" && s.period_from && s.period_to) {
    const t = periodTimeMap[stage](s.period_from, s.period_to);
    return { ...s, start_time: t?.start, end_time: t?.end };
  }
  return s;
}
