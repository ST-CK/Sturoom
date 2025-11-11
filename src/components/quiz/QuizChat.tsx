"use client";

import { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import ChatSidebar from "./ChatSidebar";
import ChatMessage from "./ChatMessage";
import QuizCard from "./QuizCard";
import Composer from "./Composer";

type QuizType = "multiple" | "ox" | "short" | "mixed";
type QuizItem = { id: string; question: string; choices?: string[] };

export default function QuizChat() {
  const supabase = createClientComponentClient();
  const [messages, setMessages] = useState<any[]>([]);
  const [composer, setComposer] = useState("");
  const [quizList, setQuizList] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [runId, setRunId] = useState("");
  const [loading, setLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    setMessages([{ id: 1, role: "ai", kind: "card" }]);
  }, []);

  async function send() {
    if (!composer.trim() || !sessionId || !quizList.length) return;
    const answer = composer.trim();
    const currentQ = quizList[currentIndex];
    setComposer("");
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, role: "user", kind: "text", text: answer },
    ]);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    const res = await fetch(`${BACKEND_URL}/quiz/attempt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        session_id: sessionId,
        run_id: runId,
        question_id: currentQ.id,
        user_answer: answer,
      }),
    });

    const result = await res.json();
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 2,
        role: "ai",
        kind: "text",
        text: result?.is_correct
          ? "✅ 정답입니다!"
          : `❌ 오답입니다. 정답은 ${result?.correct_answer ?? "?"}`,
      },
    ]);
  }

  async function handleStartQuiz({
    lectureId,
    weekId,
    mode,
    sessionId: sId,
    runId: rId,
  }: {
    lectureId: string;
    weekId: string;
    mode: QuizType;
    sessionId: string;
    runId: string;
  }) {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const postRes = await fetch(
        `/api/library/classrooms/${lectureId}/weeks/${weekId}/posts/${weekId}`
      );
      const postData = await postRes.json();

      const res = await fetch(`${BACKEND_URL}/quiz/from-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          session_id: sId,
          run_id: rId,
          room_id: lectureId,
          week_id: weekId,
          mode,
          file_urls: postData?.file_urls || [],
        }),
      });

      const data = await res.json();
      const list = data?.quiz ?? [];

      if (list.length > 0) {
        setSessionId(sId);
        setRunId(rId);
        setQuizList(list);
        setCurrentIndex(0);
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            role: "ai",
            kind: "quiz",
            question: list[0].question,
            options: list[0].choices ?? [],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            role: "ai",
            kind: "text",
            text: "⚠️ 생성된 문항이 없습니다.",
          },
        ]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-700 font-semibold">
            AI가 퀴즈를 생성 중입니다...
          </p>
        </div>
      )}

      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        <Panel defaultSize={18} minSize={14} maxSize={30}>
          <ChatSidebar onSelect={(id) => setSessionId(id)} />
        </Panel>

        <PanelResizeHandle className="w-1 bg-slate-200/50 hover:bg-indigo-300 cursor-col-resize" />

        <Panel>
          <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <header className="h-14 bg-white/70 backdrop-blur-md flex items-center px-6 shadow-sm">
              <h1 className="font-semibold text-lg text-slate-800">AI 퀴즈</h1>
            </header>

            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-4"
            >
              {messages.map((m) => {
                if (m.kind === "card")
                  return (
                    <ChatMessage key={m.id} role="ai">
                      <QuizCard onStart={handleStartQuiz} />
                    </ChatMessage>
                  );

                if (m.kind === "quiz")
                  return (
                    <ChatMessage key={m.id} role="ai">
                      <div>
                        <p className="font-medium">{m.question}</p>
                        {!!m.options?.length && (
                          <ul className="mt-2 text-sm text-slate-700 space-y-1">
                            {m.options.map((opt: string, i: number) => (
                              <li key={i}>
                                {String.fromCharCode(65 + i)}. {opt}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </ChatMessage>
                  );

                if (m.kind === "text")
                  return (
                    <ChatMessage key={m.id} role={m.role}>
                      {m.text}
                    </ChatMessage>
                  );

                return null;
              })}
              <div ref={endRef} />
            </div>

            <Composer
              value={composer}
              onChange={setComposer}
              onSend={send}
              placeholder="답변을 입력하세요..."
              disabled={!sessionId || loading}
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
