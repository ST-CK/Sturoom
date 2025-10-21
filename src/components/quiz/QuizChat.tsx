"use client";

import { useEffect, useRef, useState } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import ChatSidebar from "./ChatSidebar";
import ChatMessage from "./ChatMessage";
import QuizCard from "./QuizCard";
import Composer from "./Composer";

type QuizType = "multiple" | "ox" | "short" | "mixed";

type Msg =
  | { id: number; role: "ai"; kind: "card" }
  | { id: number; role: "ai" | "user"; kind: "text"; text: string }
  | {
      id: number;
      role: "ai";
      kind: "quiz";
      qtype: QuizType;
      question: string;
      options?: string[];
    };

export default function QuizChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [composer, setComposer] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // ✅ 첫 렌더링 시 카드 메시지 표시
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    setMessages([{ id: 1, role: "ai", kind: "card" }]);
  }, []);

  // ✅ 스크롤 감지
  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 20;
      setIsAtBottom(isBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ 새 메시지 추가 시 자동 스크롤
  useEffect(() => {
    if (!chatScrollRef.current || !endRef.current) return;
    if (isAtBottom) {
      chatScrollRef.current.scrollTo({
        top: endRef.current.offsetTop,
        behavior: "smooth",
      });
    }
  }, [messages, isAtBottom]);

  // ✅ 일반 채팅 메시지 전송
  const send = () => {
    if (!composer.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, role: "user", kind: "text", text: composer.trim() },
      { id: prev.length + 2, role: "ai", kind: "text", text: "AI 응답 예시입니다." },
    ]);
    setComposer("");
  };

  // ✅ 퀴즈 생성 로직
  const handleStartQuiz = async ({
    lectureId,
    weekId,
    mode,
  }: {
    lectureId: string;
    weekId: string;
    mode: QuizType;
  }) => {
    try {
      // 1️⃣ 주차 상세 정보 요청 → file_url 가져오기
      const weekRes = await fetch(
        `/api/library/classrooms/${lectureId}/weeks/${weekId}`
      );
      if (!weekRes.ok) throw new Error("주차 정보를 불러올 수 없습니다.");
      const week = await weekRes.json();

      // 2️⃣ 사용자 메시지 추가
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "user",
          kind: "text",
          text: `${week.week_number}주차 (${week.title}) 퀴즈를 생성합니다.`,
        },
        {
          id: prev.length + 2,
          role: "ai",
          kind: "text",
          text: `📘 "${week.title}" 자료를 분석 중입니다...`,
        },
      ]);

      // 3️⃣ FastAPI로 퀴즈 생성 요청
      const response = await fetch("http://localhost:5000/quiz/from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_url: week.file_url, // Supabase에 저장된 자료 링크
          mode,
        }),
      });

      if (!response.ok) throw new Error("서버 요청 실패");
      const data = await response.json();
      const rawText = data.quiz ?? "";

      // 4️⃣ GPT가 준 응답에서 JSON만 추출
      const match = rawText.match(/```json([\s\S]*?)```/i);
      const jsonText = match ? match[1].trim() : rawText;
      let parsed: any = null;

      try {
        parsed = JSON.parse(jsonText);
      } catch (e) {
        console.warn("⚠️ JSON 파싱 실패:", e);
      }

      // 5️⃣ 퀴즈 메시지 추가
      if (parsed && parsed.question) {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 3,
            role: "ai",
            kind: "quiz",
            qtype: mode,
            question: parsed.question,
            options:
              parsed.options?.map((opt: any) =>
                typeof opt === "string" ? opt : opt.text
              ) ?? [],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 3,
            role: "ai",
            kind: "text",
            text: rawText || "⚠️ 퀴즈 생성 실패",
          },
        ]);
      }
    } catch (err: any) {
      console.error("❌ 퀴즈 생성 오류:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "ai",
          kind: "text",
          text: `⚠️ 오류: ${err?.message || "퀴즈 생성 중 문제가 발생했습니다."}`,
        },
      ]);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        {/* 사이드바 */}
        <Panel defaultSize={18} minSize={14} maxSize={30}>
          <ChatSidebar />
        </Panel>

        {/* 리사이즈 핸들 */}
        <PanelResizeHandle className="w-1 hover:w-2 bg-transparent hover:bg-indigo-200/40 rounded-full cursor-col-resize transition-all" />

        {/* 메인 채팅 영역 */}
        <Panel>
          <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800">
            <header className="h-14 bg-white/70 backdrop-blur-md flex items-center px-6 shadow-sm shrink-0">
              <h1 className="font-semibold text-lg text-slate-800">AI 퀴즈</h1>
            </header>

            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 scroll-smooth"
            >
              {messages.map((m) => {
                if (m.kind === "card") {
                  return (
                    <ChatMessage key={m.id} role="ai">
                      <QuizCard onStart={handleStartQuiz} />
                    </ChatMessage>
                  );
                }

                if (m.kind === "quiz") {
                  return (
                    <ChatMessage key={m.id} role="ai">
                      <div>
                        <p className="font-medium">{m.question}</p>
                        {m.options && (
                          <ul className="mt-2 list-disc list-inside text-sm text-slate-600">
                            {m.options.map((opt, i) => (
                              <li key={i}>{opt}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </ChatMessage>
                  );
                }

                if (m.kind === "text") {
                  return (
                    <ChatMessage key={m.id} role={m.role}>
                      {m.text}
                    </ChatMessage>
                  );
                }

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
