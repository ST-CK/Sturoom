"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ChatMessage from "./ChatMessage";
import QuizCard from "./QuizCard";
import Composer from "./Composer";

export default function QuizChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [quiz, setQuiz] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [runId, setRunId] = useState("");
  const [idx, setIdx] = useState(0);
  const [composer, setComposer] = useState("");

  const BACKEND =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

  // ---------------------------------------
  // 🔥 generate → 첫 문제 도착하면 실행됨
  // ---------------------------------------
  function handleStart({
    sessionId: sid,
    runId: rid,
    first,
    lectureId,
    weekId,
    mode,
  }: any) {
    setSessionId(sid);
    setRunId(rid);
    setQuiz([first]);
    setMessages([
      {
        role: "ai",
        kind: "quiz",
        question: first.question,
        choices: first.choices,
      },
    ]);
    setIdx(0);
  }

  // ---------------------------------------
  // 🔥 답변 제출
  // ---------------------------------------
  async function send() {
    if (!composer.trim()) return;

    const answer = composer.trim();
    setComposer("");

    // 사용자 답변 채팅 표시
    setMessages((prev) => [
      ...prev,
      { role: "user", kind: "text", text: answer },
    ]);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token;
    const user = session?.user;

    const res = await fetch(`${BACKEND}/api/quiz/attempt`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        question_id: quiz[idx].id,
        user_answer: answer,
      }),
    });

    const result = await res.json();

    // 피드백
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        kind: "text",
        text: result.is_correct
          ? "✅ 정답!"
          : `❌ 오답! 정답: ${result.correct_answer}`,
      },
    ]);
  }

  return (
    <div className="w-full h-full px-6 py-6">
      {!sessionId && (
        <ChatMessage role="ai">
          <QuizCard onStart={handleStart} />
        </ChatMessage>
      )}

      {messages.map((m, i) => (
        <ChatMessage key={i} role={m.role}>
          {m.kind === "quiz" ? (
            <div>
              <p className="font-semibold mb-2">{m.question}</p>
              {m.choices?.map((c: string, i: number) => (
                <div key={i}>
                  {String.fromCharCode(65 + i)}. {c}
                </div>
              ))}
            </div>
          ) : (
            m.text
          )}
        </ChatMessage>
      ))}

      {sessionId && (
        <Composer
          value={composer}
          onChange={setComposer}
          onSend={send}
          placeholder="답변 입력…"
        />
      )}
    </div>
  );
}
