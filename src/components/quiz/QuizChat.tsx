"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import ChatSidebar from "./ChatSidebar";
import ChatMessage from "./ChatMessage";
import QuizCard from "./QuizCard";
import Composer from "./Composer";

type QuizType = "multiple" | "ox" | "short" | "mixed";
type QuizItem = { id: string; question: string; choices?: string[] };
type QuizPayload = {
  question?: string;
  options?: string[];
  quiz?: { question?: string; choices?: string[] }[];
  text?: string;
};

export default function QuizChat() {
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

  useEffect(() => {
    if (chatScrollRef.current && endRef.current) {
      chatScrollRef.current.scrollTop = endRef.current.offsetTop;
    }
  }, [messages]);

  // ✅ 과거 메시지 로드 + 실시간 구독
  useEffect(() => {
    if (!sessionId) return;

    async function loadOldMessages() {
      const { data, error } = await supabase
        .from("quiz_messages")
        .select("id, role, kind, payload, created_at, order_index")
        .eq("session_id", sessionId)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("❌ 과거 메시지 불러오기 실패:", error.message);
        return;
      }

      const parsed = (data || []).map((m) => {
        let content: QuizPayload = {};
        try {
          content =
            typeof m.payload === "string"
              ? (JSON.parse(m.payload) as QuizPayload)
              : (m.payload as QuizPayload);
        } catch {
          content = { text: String(m.payload) };
        }

        if (m.kind === "quiz") {
          return {
            id: m.id,
            role: m.role,
            kind: m.kind,
            question:
              content.question ||
              content.quiz?.[0]?.question ||
              "문제 표시 오류",
            options: content.options || content.quiz?.[0]?.choices || [],
          };
        }

        if (m.kind === "text") {
          return {
            id: m.id,
            role: m.role,
            kind: m.kind,
            text: content.text || "",
          };
        }

        if (m.kind === "card") {
          return { id: m.id, role: m.role, kind: "card" };
        }

        return null;
      });

      setMessages([{ id: "init", role: "ai", kind: "card" }, ...(parsed || [])]);
    }

    loadOldMessages();

    const channel = supabase
      .channel(`quiz_messages_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "quiz_messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const m = payload.new;
          let content: QuizPayload = {};
          try {
            content =
              typeof m.payload === "string"
                ? (JSON.parse(m.payload) as QuizPayload)
                : (m.payload as QuizPayload);
          } catch {
            content = { text: String(m.payload) };
          }

          if (m.kind === "quiz") {
            setMessages((prev) => [
              ...prev,
              {
                id: m.id,
                role: m.role,
                kind: m.kind,
                question:
                  content.question ||
                  content.quiz?.[0]?.question ||
                  "문제 표시 오류",
                options: content.options || content.quiz?.[0]?.choices || [],
              },
            ]);
          } else if (m.kind === "text") {
            setMessages((prev) => [
              ...prev,
              { id: m.id, role: m.role, kind: m.kind, text: content.text || "" },
            ]);
          } else if (m.kind === "card") {
            setMessages((prev) => [
              ...prev,
              { id: m.id, role: m.role, kind: "card" },
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // ✅ 정답 전송/채점
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
      data: { user },
    } = await supabase.auth.getUser();

    const res = await fetch(`${BACKEND_URL}/quiz/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        session_id: sessionId,
        run_id: runId,
        question_id: currentQ.id,
        user_email: user?.email,
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

    if (currentIndex + 1 < quizList.length) {
      const nextQ = quizList[currentIndex + 1];
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 3,
            role: "ai",
            kind: "quiz",
            question: nextQ.question,
            options: nextQ.choices ?? [],
          },
        ]);
      }, 800);
    } else {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 3,
            role: "ai",
            kind: "text",
            text: "🎉 퀴즈가 모두 완료되었습니다!",
          },
          { id: prev.length + 4, role: "ai", kind: "card" },
        ]);
        setSessionId("");
        setRunId("");
        setQuizList([]);
        setCurrentIndex(0);
      }, 800);
    }
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
        data: { user },
      } = await supabase.auth.getUser();

      const postRes = await fetch(
        `/api/library/classrooms/${lectureId}/weeks/${weekId}/posts/${weekId}`
      );
      if (!postRes.ok) throw new Error("자료 불러오기 실패");
      const postData = await postRes.json();

      const res = await fetch(`${BACKEND_URL}/quiz/from-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          session_id: sId,
          run_id: rId,
          user_id: user?.id,
          room_id: lectureId,
          week_id: weekId,
          mode,
          file_urls: postData?.file_urls || [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "퀴즈 생성 실패");

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
            text: "⚠️ 생성된 문항이 없습니다. 파일 내용을 확인하세요.",
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
          <p className="text-sm text-slate-500 mt-1">잠시만 기다려 주세요 🤖</p>
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
              {messages.map((m, i) => {
                if (m.kind === "card")
                  return (
                    <ChatMessage key={i} role="ai">
                      <QuizCard onStart={handleStartQuiz} />
                    </ChatMessage>
                  );
                if (m.kind === "quiz")
                  return (
                    <ChatMessage key={i} role="ai">
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
                    <ChatMessage key={i} role={m.role}>
                      {m.text}
                    </ChatMessage>
                  );
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
