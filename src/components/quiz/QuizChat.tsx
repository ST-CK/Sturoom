"use client";

import { useEffect, useRef, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import ChatSidebar from "./ChatSidebar";
import ChatMessage from "./ChatMessage";
import QuizCard from "./QuizCard";
import Composer from "./Composer";

type QuizType = "multiple" | "ox" | "short" | "mixed";
type QuizItem = {
  id?: string | number;
  question: string;
  choices?: string[];
  options?: string[];
};

export default function QuizChat() {
  const supabase = createClientComponentClient();
  const [messages, setMessages] = useState<any[]>([]);
  const [composer, setComposer] = useState("");
  const [quizList, setQuizList] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

  // 최초 카드 출력
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    setMessages([{ id: 1, role: "ai", kind: "card" }]);
  }, []);

  // 자동 스크롤 감지
  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20;
      setIsAtBottom(bottom);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // 자동 스크롤 유지
  useEffect(() => {
    if (isAtBottom && chatScrollRef.current && endRef.current) {
      chatScrollRef.current.scrollTo({
        top: endRef.current.offsetTop,
        behavior: "smooth",
      });
    }
  }, [messages, isAtBottom]);

  // ✅ 답변 전송
  async function send() {
    if (!composer.trim() || !quizList.length) return;

    let answer = composer.trim();
    const currentQ = quizList[currentIndex];
    setComposer("");

    // ✅ OX 자동 변환 (대소문자 전부 대응)
    if (currentQ?.choices?.length === 2) {
      const normalized = answer.toUpperCase();
      const ch = currentQ.choices.map((c) => c.toUpperCase());

      if (ch.includes("O") && ch.includes("X")) {
        if (["A", "O"].includes(normalized)) answer = "O";
        else if (["B", "X"].includes(normalized)) answer = "X";
      }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userEmail = user?.email;

    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, role: "user", kind: "text", text: answer },
    ]);

    const qid = (currentQ?.id as string | number | undefined) ?? currentIndex + 1;

    try {
      const res = await fetch(`${BACKEND_URL}/quiz/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          question_id: qid,
          user_answer: answer,
          user_email: userEmail,
        }),
      });

      const result = await res.json();

      if (res.ok && result?.is_correct) {
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 2, role: "ai", kind: "text", text: "✅ 정답입니다!" },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 2,
            role: "ai",
            kind: "text",
            text: `❌ 오답입니다. 정답은 ${result?.correct_answer ?? "?"} 입니다.`,
          },
        ]);
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 2,
          role: "ai",
          kind: "text",
          text: "⚠️ 정답 채점 중 오류가 발생했습니다.",
        },
      ]);
    }

    // ✅ 다음 문제 or 종료
    if (currentIndex + 1 < quizList.length) {
      const nextQ = quizList[currentIndex + 1];
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 3,
            role: "ai",
            kind: "quiz",
            qtype: "multiple",
            question: nextQ.question,
            options: (nextQ.choices ?? nextQ.options) || [],
          },
        ]);
      }, 1200);
    } else {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 4,
            role: "ai",
            kind: "text",
            text: "🎉 퀴즈가 모두 완료되었습니다!",
          },
          { id: prev.length + 5, role: "ai", kind: "card" },
        ]);
        setQuizList([]);
        setCurrentIndex(0);
        setSessionId("");
      }, 1200);
    }
  }

  // ✅ 퀴즈 시작
  async function handleStartQuiz({
    lectureId,
    weekId,
    mode,
    sessionId,
  }: {
    lectureId: string;
    weekId: string;
    mode: QuizType;
    sessionId: string;
  }) {
    try {
      setLoading(true);
      setSessionId(sessionId);

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "ai",
          kind: "text",
          text: "🤖 AI가 퀴즈를 생성 중이에요... 잠시만 기다려주세요.",
        },
      ]);

      const postRes = await fetch(
        `/api/library/classrooms/${lectureId}/weeks/${weekId}/posts/${weekId}`
      );

      if (!postRes.ok) throw new Error("❌ 자료 불러오기 실패");

      const postData = await postRes.json();

      const res = await fetch(`${BACKEND_URL}/quiz/from-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: lectureId,
          week_id: weekId,
          file_urls: postData.file_urls,
          mode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error("퀴즈 생성 실패");

      let parsed: any = null;
      if (Array.isArray(data?.quiz)) parsed = data.quiz;
      else if (typeof data?.quiz === "string") {
        const m = data.quiz.match(/```json([\s\S]*?)```/i);
        const txt = m ? m[1].trim() : data.quiz;
        parsed = JSON.parse(txt);
      } else if (Array.isArray(data)) parsed = data;
      else if (typeof data === "object" && data) parsed = [data];

      const list: QuizItem[] = (parsed || [])
        .map((q: any) => ({
          id: q?.id,
          question: q?.question ?? q?.prompt ?? "",
          choices: Array.isArray(q?.choices)
            ? q.choices
            : Array.isArray(q?.options)
            ? q.options
            : undefined,
        }))
        .filter((q: QuizItem) => q.question);

      if (!list.length) throw new Error("퀴즈를 불러오지 못했습니다.");

      setQuizList(list);
      setCurrentIndex(0);
      setMessages([
        {
          id: 1,
          role: "ai",
          kind: "quiz",
          qtype: mode,
          question: list[0].question,
          options: list[0].choices ?? [],
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "ai",
          kind: "text",
          text: "⚠️ 퀴즈 생성 중 오류가 발생했습니다.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // ✅ 컴포넌트 렌더
  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* 🔄 로딩 오버레이 */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-slate-700 font-medium">
            AI가 퀴즈를 생성 중입니다...
          </p>
        </div>
      )}

      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        <Panel defaultSize={18} minSize={14} maxSize={30}>
          <ChatSidebar />
        </Panel>

        <PanelResizeHandle className="w-1 hover:w-2 bg-indigo-200/40 cursor-col-resize" />

        <Panel>
          <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800">
            <header className="h-14 bg-white/70 backdrop-blur-md flex items-center px-6 shadow-sm shrink-0">
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

                if (m.kind === "quiz") {
                  const opts: string[] = m.options || [];
                  return (
                    <ChatMessage key={m.id} role="ai">
                      <div>
                        <p className="font-medium">{m.question}</p>
                        {!!opts.length && (
                          <ul className="mt-2 text-sm text-slate-700 space-y-1">
                            {opts.map((opt: string, i: number) => (
                              <li key={i}>
                                {String.fromCharCode(65 + i)}. {opt}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </ChatMessage>
                  );
                }

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
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
