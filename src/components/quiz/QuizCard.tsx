"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type QuizMode = "multiple" | "ox" | "short" | "mixed";

type Props = {
  // QuizChat에서 handleStartQuiz를 넘겨줌
  onStart: (args: {
    lectureId: string;
    weekId: string;
    mode: QuizMode;
    sessionId: string;
    runId: string;
  }) => void;
};

export default function QuizCard({ onStart }: Props) {
  const [lectures, setLectures] = useState<any[]>([]);
  const [weeks, setWeeks] = useState<any[]>([]);
  const [lectureId, setLectureId] = useState("");
  const [weekId, setWeekId] = useState("");
  const [mode, setMode] = useState<QuizMode>("mixed");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

  // 🔹 강의 목록
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/library/classrooms");
        if (res.ok) {
          const data = await res.json();
          setLectures(data);
        }
      } catch (err) {
        console.error("❌ 강의 목록 로드 실패:", err);
      }
    })();
  }, []);

  // 🔹 주차 목록
  useEffect(() => {
    if (!lectureId) {
      setWeeks([]);
      setWeekId("");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/library/classrooms/${lectureId}/weeks`);
        if (res.ok) {
          const data = await res.json();
          setWeeks(data);
        }
      } catch (err) {
        console.error("❌ 주차 목록 로드 실패:", err);
      }
    })();
  }, [lectureId]);

  // ======================================================
  // 🔥 신규 세션 생성 → 반드시 최초 카드에서만 실행됨
  // ======================================================
  async function handleStart() {
    if (!lectureId || !weekId) {
      alert("강의와 주차를 먼저 선택하세요.");
      return;
    }

    setLoading(true);
    try {
      // 인증 정보
      const { data: auth } = await supabase.auth.getSession();
      const user = auth.session?.user;
      const token = auth.session?.access_token;

      if (!user || !token) {
        throw new Error("로그인이 필요합니다.");
      }

      // ⭐ 신규 세션 생성 요청
      const res = await fetch(`/api/quiz/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          room_id: lectureId,
          post_id: weekId,
          mode,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        console.error("❌ 세션 생성 실패:", payload);
        throw new Error(payload?.error || "세션 생성 실패");
      }

      // QuizChat에 세션 & run 전달
      onStart({
        lectureId,
        weekId,
        mode,
        sessionId: payload.session_id,
        runId: payload.run_id,
      });
    } catch (e: any) {
      console.error("❌ 세션 생성 중 오류:", e);
      alert(e.message || "세션 생성 오류");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm sm:max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-6 border border-slate-200/60">
      <h3 className="text-lg sm:text-xl font-semibold text-center mb-4 text-slate-800">
        📘 AI 퀴즈 생성기
      </h3>

      <div className="space-y-4">
        {/* 🔸 강의 선택 */}
        <select
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm sm:text-base"
          value={lectureId}
          onChange={(e) => setLectureId(e.target.value)}
        >
          <option value="">강의를 선택하세요</option>
          {lectures.map((l: any) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>

        {/* 🔸 주차 선택 */}
        <select
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm sm:text-base"
          value={weekId}
          onChange={(e) => setWeekId(e.target.value)}
          disabled={!lectureId}
        >
          <option value="">주차를 선택하세요</option>
          {weeks.map((w: any) => (
            <option key={w.id} value={w.id}>
              {w.week_number}주차 - {w.title}
            </option>
          ))}
        </select>

        {/* 🔸 모드 선택 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(["multiple", "ox", "short", "mixed"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              type="button"
              className={`rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border transition ${
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

        {/* 🔸 퀴즈 시작 */}
        <button
          disabled={loading}
          onClick={handleStart}
          className={`w-full mt-3 rounded-lg py-2 text-sm sm:text-base font-semibold text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "세션 생성 중..." : "퀴즈 시작하기"}
        </button>
      </div>
    </div>
  );
}