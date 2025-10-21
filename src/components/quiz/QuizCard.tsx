"use client";
import { useEffect, useState } from "react";

type Props = {
  onStart: (args: {
    lectureId: string;
    weekId: string;
    mode: "multiple" | "ox" | "short" | "mixed";
  }) => void;
};

export default function QuizCard({ onStart }: Props) {
  const [lectures, setLectures] = useState<any[]>([]);
  const [weeks, setWeeks] = useState<any[]>([]);
  const [lectureId, setLectureId] = useState("");
  const [weekId, setWeekId] = useState("");
  const [mode, setMode] = useState<"multiple" | "ox" | "short" | "mixed">("mixed");

  useEffect(() => {
    fetch("/api/library/classrooms")
      .then((r) => r.json())
      .then(setLectures)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!lectureId) return;
    fetch(`/api/library/classrooms/${lectureId}/weeks`)
      .then((r) => r.json())
      .then(setWeeks)
      .catch(console.error);
  }, [lectureId]);

  const disabled = !lectureId || !weekId;

  return (
    <div className="mx-auto w-full max-w-lg bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-slate-200/60">
      <h3 className="text-xl font-semibold text-center mb-4 text-slate-800">
        AI 기반 주차별 퀴즈 생성
      </h3>

      <div className="space-y-4">
        {/* ✅ 강의 선택 */}
        <div>
          <label className="block mb-1 text-sm font-medium">강의 선택</label>
          <div className="relative">
            <select
              className="w-full appearance-none border border-slate-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* ✅ 주차 선택 */}
        <div>
          <label className="block mb-1 text-sm font-medium">주차 선택</label>
          <div className="relative">
            <select
              className="w-full appearance-none border border-slate-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-100"
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* ✅ 문제 유형 */}
        <div>
          <label className="block mb-1 text-sm font-medium">문제 유형</label>
          <div className="grid grid-cols-4 gap-2">
            {(["multiple", "ox", "short", "mixed"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-lg px-3 py-2 text-sm border transition ${
                  mode === m
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                {m === "multiple"
                  ? "5지선다"
                  : m === "ox"
                  ? "OX"
                  : m === "short"
                  ? "서술형"
                  : "혼합"}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ 시작 버튼 */}
        <button
          disabled={disabled}
          onClick={async () => {
            if (disabled) return;

            try {
              // ✅ 주차 자료의 URL을 불러오기 (예시로 /api/library/ 자료에서 가져왔다고 가정)
              const weekRes = await fetch(`/api/library/classrooms/${lectureId}/weeks/${weekId}`);
              const weekData = await weekRes.json();

              // ✅ 백엔드에 퀴즈 생성 요청
              const res = await fetch("http://localhost:5000/quiz/from-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  file_url: weekData.file_url, // ← 주차 자료 파일 URL
                  mode, // 선택된 문제 유형
                }),
              });

              const data = await res.json();
              console.log("✅ 생성된 퀴즈:", data.quiz);

              alert("AI가 퀴즈를 생성했어요!");
            } catch (err) {
              console.error("퀴즈 생성 오류:", err);
              alert("퀴즈 생성 중 오류가 발생했어요.");
            }
          }}
          className={`w-full mt-3 rounded-lg py-2 font-semibold text-white transition ${
            disabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          퀴즈 시작하기
        </button>
      </div>
    </div>
  );
}
