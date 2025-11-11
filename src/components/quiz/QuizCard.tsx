"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type QuizMode = "multiple" | "ox" | "short" | "mixed";

type Props = {
  onStart: (args: {
    lectureId: string;
    weekId: string;
    mode: QuizMode;
    sessionId: string;
  }) => void;
};

export default function QuizCard({ onStart }: Props) {
  const supabase = createClientComponentClient();

  const [lectures, setLectures] = useState<any[]>([]);
  const [weeks, setWeeks] = useState<any[]>([]);
  const [lectureId, setLectureId] = useState("");
  const [weekId, setWeekId] = useState("");
  const [mode, setMode] = useState<QuizMode>("mixed");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

  // ✅ 강의 목록 불러오기
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/library/classrooms");
      if (!res.ok) return;
      const data = await res.json();
      setLectures(data);
    })();
  }, []);

  // ✅ 주차 목록 불러오기
  useEffect(() => {
    if (!lectureId) {
      setWeeks([]);
      return;
    }
    (async () => {
      const res = await fetch(`/api/library/classrooms/${lectureId}/weeks`);
      if (!res.ok) return;
      const data = await res.json();
      setWeeks(data);
    })();
  }, [lectureId]);

  // ✅ 퀴즈 시작
  async function handleStart() {
    if (!lectureId || !weekId) return;
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("로그인이 필요합니다.");
        return;
      }

      const userId = user.id;

      const sessionRes = await fetch(`${BACKEND_URL}/quiz/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          room_id: lectureId,
          post_id: weekId, // ✅ 주차 단위로 세션 생성
          mode,
        }),
      });

      const session = await sessionRes.json();
      const sessionId = session?.id;

      alert("AI가 퀴즈를 생성 중입니다...");
      onStart({ lectureId, weekId, mode, sessionId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-[380px] bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-slate-200/60">
      <h3 className="text-xl font-semibold text-center mb-4 text-slate-800">
        📘 AI 퀴즈 생성기
      </h3>

      <div className="space-y-4">
        {/* ✅ 강의 선택 */}
        <select
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
          value={lectureId}
          onChange={(e) => setLectureId(e.target.value)}
        >
          <option value="">강의를 선택하세요</option>
          {lectures.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>

        {/* ✅ 주차 선택 */}
        <select
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
          value={weekId}
          onChange={(e) => setWeekId(e.target.value)}
          disabled={!lectureId}
        >
          <option value="">주차를 선택하세요</option>
          {weeks.map((w) => (
            <option key={w.id} value={w.id}>
              {w.week_number}주차 - {w.title}
            </option>
          ))}
        </select>

        {/* ✅ 퀴즈 모드 선택 */}
        <div className="grid grid-cols-4 gap-2">
          {(["multiple", "ox", "short", "mixed"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              type="button"
              className={`rounded-lg px-3 py-2 text-sm border transition ${
                mode === m
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold"
                  : "border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
            >
              {m === "multiple"
                ? "선다형"
                : m === "ox"
                ? "OX"
                : m === "short"
                ? "서술형"
                : "혼합"}
            </button>
          ))}
        </div>

        {/* ✅ 시작 버튼 */}
        <button
          disabled={loading}
          onClick={handleStart}
          className={`w-full mt-3 rounded-lg py-2 font-semibold text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "퀴즈 생성 중..." : "퀴즈 시작하기"}
        </button>
      </div>
    </div>
  );
}
