"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type QuizMode = "multiple" | "ox" | "short" | "mixed";

export default function QuizCard({
  onStart,
}: {
  onStart: (args: {
    sessionId: string;
    runId: string;
    first: any;
    lectureId: string;
    weekId: string;
    mode: QuizMode;
  }) => void;
}) {
  const [lectures, setLectures] = useState<any[]>([]);
  const [weeks, setWeeks] = useState<any[]>([]);
  const [lectureId, setLectureId] = useState("");
  const [weekId, setWeekId] = useState("");
  const [mode, setMode] = useState<QuizMode>("mixed");
  const [loading, setLoading] = useState(false);

  // 강의 목록
  useEffect(() => {
    fetch("/api/library/classrooms")
      .then((r) => r.json())
      .then(setLectures);
  }, []);

  // 주차 목록
  useEffect(() => {
    if (!lectureId) return;
    fetch(`/api/library/classrooms/${lectureId}/weeks`)
      .then((r) => r.json())
      .then(setWeeks);
  }, [lectureId]);

  // ---------------------------------------
  // 🔥 generate API 호출
  // ---------------------------------------
  async function start() {
    if (!lectureId || !weekId) {
      alert("강의/주차 선택해줘!");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;
      if (!token) throw new Error("로그인 필요!");

      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lectureId,
          weekId,
          mode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onStart({
        sessionId: data.sessionId,
        runId: data.runId,
        first: data.firstQuestion,
        lectureId,
        weekId,
        mode,
      });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-[380px] bg-white rounded-2xl shadow p-6">
      <h3 className="text-xl font-semibold text-center mb-4">📘 AI 퀴즈 생성</h3>

      <select
        value={lectureId}
        onChange={(e) => setLectureId(e.target.value)}
        className="w-full border rounded-lg px-3 py-2"
      >
        <option value="">강의 선택</option>
        {lectures.map((l) => (
          <option key={l.id} value={l.id}>
            {l.title}
          </option>
        ))}
      </select>

      <select
        value={weekId}
        onChange={(e) => setWeekId(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 mt-3"
        disabled={!lectureId}
      >
        <option value="">주차 선택</option>
        {weeks.map((w) => (
          <option key={w.id} value={w.id}>
            {w.week_number}주차 - {w.title}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-4 gap-2 mt-4">
        {(["multiple", "ox", "short", "mixed"] as QuizMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-2 py-1 rounded-lg border ${
              mode === m ? "bg-indigo-200 border-indigo-600" : "border-gray-300"
            }`}
          >
            {m === "multiple"
              ? "선다"
              : m === "ox"
              ? "OX"
              : m === "short"
              ? "서술"
              : "혼합"}
          </button>
        ))}
      </div>

      <button
        onClick={start}
        disabled={loading}
        className="w-full mt-5 bg-indigo-600 text-white py-2 rounded-lg"
      >
        {loading ? "생성 중..." : "퀴즈 시작하기"}
      </button>
    </div>
  );
}
