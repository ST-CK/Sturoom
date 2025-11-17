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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      if (!token) throw new Error("로그인이 필요합니다.");

      const res = await fetch(`${BACKEND_URL}/api/quiz/run/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ⭐ 추가됨
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || "런 생성 실패");

      onRetry({
        sessionId: result.session_id,
        runId: result.run_id,
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-[350px] bg-white/90 rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-center mb-2 text-slate-800">
        🔁 기존 세션 재도전
      </h3>

      <button
        onClick={handleRetry}
        disabled={loading}
        className="w-full rounded-lg py-2 bg-indigo-600 text-white font-semibold"
      >
        {loading ? "새 퀴즈 생성 중..." : "새 퀴즈 생성하기"}
      </button>
    </div>
  );
}
