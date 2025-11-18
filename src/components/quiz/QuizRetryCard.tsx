"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function QuizRetryCard({
  lectureId,
  weekId,
  mode,
  onRetry,
}: {
  lectureId: string;
  weekId: string;
  mode: string;
  onRetry: (args: { sessionId: string; runId: string; first: any }) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function retry() {
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

      onRetry({
        sessionId: data.sessionId,
        runId: data.runId,
        first: data.firstQuestion,
      });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-white border rounded-xl shadow-md">
      <h3 className="font-semibold mb-3">🔁 다시 풀기</h3>

      <button
        onClick={retry}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg"
      >
        {loading ? "생성 중…" : "새 퀴즈 생성하기"}
      </button>
    </div>
  );
}
