"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  sessionId: string;
  onRetry: (args: { sessionId: string; runId: string }) => void;
};

export default function QuizRetryCard({ sessionId, onRetry }: Props) {
  const [loading, setLoading] = useState(false);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

  async function handleRetry() {
    setLoading(true);

    try {
      const { data: auth } = await supabase.auth.getSession();
      const token = auth.session?.access_token;

      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      const res = await fetch(`${BACKEND_URL}/api/quiz/run/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ session_id: sessionId }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || "재도전 실행 실패");

      onRetry({
        sessionId: result.session_id,
        runId: result.run_id,
      });
    } catch (err: any) {
      alert(err.message || "재도전 생성 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        mx-auto 
        w-[350px] sm:w-[350px] 
        max-w-full 
        bg-white/90 backdrop-blur-md 
        rounded-2xl shadow-lg p-6 
        border border-slate-200/60 
        animate-[fadeIn_0.25s_ease]

        /* 모바일 최적화 */
        text-xs sm:text-sm
        px-4 py-5
      "
    >
      <h3
        className="
        text-base sm:text-lg 
        font-semibold text-center 
        mb-2 text-slate-800
      "
      >
        🔁 기존 세션 퀴즈 재도전
      </h3>

      <p
        className="
        text-center 
        text-[11px] sm:text-sm 
        text-slate-600 
        mb-4 leading-relaxed
      "
      >
        이 채팅방에서 새 퀴즈를 이어서 생성합니다.<br />
        세션은 그대로 유지되고 새로운 퀴즈만 추가됩니다.
      </p>

      <button
        disabled={loading}
        onClick={handleRetry}
        className={`
          w-full 
          rounded-lg 
          py-2 
          text-xs sm:text-sm 
          font-semibold text-white 
          transition
          ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}
        `}
      >
        {loading ? "새 퀴즈 준비 중..." : "새 퀴즈 생성하기"}
      </button>
    </div>
  );
}