"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";

import ChatSidebar from "./ChatSidebar";
import ChatMessage from "./ChatMessage";
import QuizCard from "./QuizCard";
import QuizRetryCard from "./QuizRetryCard";
import Composer from "./Composer";

type QuizType = "multiple" | "ox" | "short" | "mixed";

type QuizItem = {
  id: string;
  question: string;
  choices?: string[];
};

// ⭐ sessionInfo 타입
type SessionInfo = {
  lecture_id: string;
  week_id: string;
  mode: QuizType;
};

export default function QuizChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [composer, setComposer] = useState("");
  const [quizList, setQuizList] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [sessionId, setSessionId] = useState<string>("");
  const [runId, setRunId] = useState<string>("");

  const [loading, setLoading] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

  /* ---------------------------------------
   * 1. 자동 스크롤
   * ------------------------------------- */
  useEffect(() => {
    if (chatScrollRef.current && endRef.current) {
      chatScrollRef.current.scrollTop = endRef.current.offsetTop;
    }
  }, [messages]);

  /* ---------------------------------------
   * 2. 과거 메시지 불러오기
   * ------------------------------------- */
  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    async function loadOldMessages() {
      const { data, error } = await supabase
        .from("quiz_messages")
        .select("id, role, kind, payload, seq")
        .eq("session_id", sessionId)
        .order("seq", { ascending: true });

      if (error) {
        console.error("❌ 과거 메시지 불러오기 실패:", error.message);
        return;
      }

      const parsed = (data || [])
        .map((m: any) => {
          let content: any = {};
          try {
            content =
              typeof m.payload === "string"
                ? JSON.parse(m.payload)
                : m.payload;
          } catch {
            content = { text: String(m.payload) };
          }

          if (m.kind === "quiz") {
            return {
              id: m.id,
              role: "ai",
              kind: "quiz",
              question: content.question,
              options: content.choices ?? [],
            };
          }

          if (m.kind === "text") {
            return {
              id: m.id,
              role: m.role,
              kind: "text",
              text: content.text ?? "",
            };
          }

          return null;
        })
        .filter(Boolean);

      setMessages(parsed);
    }

    loadOldMessages();
  }, [sessionId]);

  /* ---------------------------------------
   * 3. 세션 선택 시 초기화
   * ------------------------------------- */
  function handleSelectSession(id: string) {
    if (id === sessionId) return;

    setSessionId(id);
    setRunId("");
    setQuizList([]);
    setCurrentIndex(0);
    setComposer("");
  }

  /* ---------------------------------------
   * 4. 정답 제출
   * ------------------------------------- */
  async function send() {
    if (!composer.trim() || !sessionId || quizList.length === 0) return;

    const answer = composer.trim();
    const currentQ = quizList[currentIndex];

    setComposer("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1) 사용자 답 채팅 UI
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + "-user", role: "user", kind: "text", text: answer },
    ]);

    // 2) Supabase 저장
    await supabase.from("quiz_messages").insert({
      session_id: sessionId,
      run_id: runId,
      user_id: user?.id,
      role: "user",
      kind: "text",
      payload: JSON.stringify({ text: answer }),
    });

    // 3) FastAPI 채점
    const res = await fetch(`${BACKEND_URL}/api/quiz/attempt`, {
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

    const feedbackText = result?.is_correct
      ? "✅ 정답입니다!"
      : `❌ 오답입니다. 정답은 ${result.correct_answer}${
          result?.explanation ? `\n해설: ${result.explanation}` : ""
        }`;

    // 4) 피드백 출력
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + "-ai", role: "ai", kind: "text", text: feedbackText },
    ]);

    // 5) 다음 문제
    if (currentIndex + 1 < quizList.length) {
      const nextQ = quizList[currentIndex + 1];

      const {
        data: { user: user2 },
      } = await supabase.auth.getUser();

      await supabase.from("quiz_messages").insert({
        session_id: sessionId,
        run_id: runId,
        user_id: user2?.id,
        role: "ai",
        kind: "quiz",
        payload: JSON.stringify({
          question: nextQ.question,
          choices: nextQ.choices,
          question_id: nextQ.id,
        }),
      });

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + "-q",
            role: "ai",
            kind: "quiz",
            question: nextQ.question,
            options: nextQ.choices,
          },
        ]);
        setCurrentIndex((v) => v + 1);
      }, 600);
    } else {
      // 마지막 문제
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: "finish",
            role: "ai",
            kind: "text",
            text: "🎉 퀴즈를 모두 완료했습니다!",
          },
        ]);
        setQuizList([]);
        setCurrentIndex(0);
        setRunId("");
      }, 600);
    }
  }

  /* ---------------------------------------
   * 5. 새 세션 시작 → 첫 퀴즈 생성
   * ------------------------------------- */
  async function handleStartQuiz({
    lectureId,
    weekId,
    mode,
    sessionId: newS,
    runId: newR,
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
      const user = session?.user;

      // 주차 파일 가져오기
      const postRes = await fetch(
        `/api/library/classrooms/${lectureId}/weeks/${weekId}/posts/${weekId}`
      );
      const postData = await postRes.json();

      // FastAPI 퀴즈 생성
      const res = await fetch(`${BACKEND_URL}/api/quiz/from-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ⭐ 필수
        },
        body: JSON.stringify({
          session_id: newS,
          run_id: newR,
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
      if (!list.length) throw new Error("퀴즈 없음");

      setSessionId(newS);
      setRunId(newR);
      setQuizList(list);
      setCurrentIndex(0);

      // 첫 문제 DB 저장
      await supabase.from("quiz_messages").insert({
        session_id: newS,
        run_id: newR,
        user_id: user?.id,
        role: "ai",
        kind: "quiz",
        payload: JSON.stringify({
          question: list[0].question,
          choices: list[0].choices,
          question_id: list[0].id,
        }),
      });

      // UI 표시
      setMessages([
        {
          id: "first-q",
          role: "ai",
          kind: "quiz",
          question: list[0].question,
          options: list[0].choices,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------
   * 6. 기존 세션 재도전 (run만 새로)
   * ------------------------------------- */
  async function handleRetryQuiz({
    sessionId: sId,
    runId: rId,
  }: {
    sessionId: string;
    runId: string;
  }) {
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;
      const user = session?.user;

      // ⭐ 기존 session 정보 로드
      const { data: rawInfo, error: infoErr } = await supabase
        .from("quiz_sessions")
        .select("lecture_id, week_id, mode")
        .eq("id", sId)
        .single();

      if (infoErr || !rawInfo) {
        throw new Error("세션 정보를 불러오지 못했습니다.");
      }

      const sessionInfo = rawInfo as SessionInfo;

      const lecture_id = sessionInfo.lecture_id;
      const week_id = sessionInfo.week_id;
      const mode = sessionInfo.mode;

      // 주차 파일 가져오기
      const postRes = await fetch(
        `/api/library/classrooms/${lecture_id}/weeks/${week_id}/posts/${week_id}`
      );
      const postData = await postRes.json();

      // 퀴즈 재생성
      const res = await fetch(`${BACKEND_URL}/api/quiz/from-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          session_id: sId,
          run_id: rId,
          user_id: user?.id,
          room_id: lecture_id,
          week_id,
          mode,
          file_urls: postData?.file_urls || [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "퀴즈 생성 실패");

      const list = data?.quiz ?? [];
      if (!list.length) throw new Error("퀴즈 없음");

      setRunId(rId);
      setQuizList(list);
      setCurrentIndex(0);

      // DB 기록
      await supabase.from("quiz_messages").insert({
        session_id: sId,
        run_id: rId,
        user_id: user?.id,
        role: "ai",
        kind: "quiz",
        payload: JSON.stringify({
          question: list[0].question,
          choices: list[0].choices,
          question_id: list[0].id,
        }),
      });

      // UI 표시
      setMessages((prev) => [
        ...prev,
        {
          id: "retry-q-" + Date.now(),
          role: "ai",
          kind: "quiz",
          question: list[0].question,
          options: list[0].choices,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------
   * 7. 렌더링
   * ------------------------------------- */
  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 z-50 backdrop-blur-sm">
          <div className="animate-spin h-10 w-10 border-b-2 border-indigo-600 rounded-full" />
          <p className="mt-4 text-slate-700 font-semibold">
            AI가 퀴즈를 생성 중입니다...
          </p>
        </div>
      )}

      <PanelGroup direction="horizontal" className="flex-1 bg-white">
        <Panel defaultSize={18} minSize={14} maxSize={30}>
          <ChatSidebar
            selectedSessionId={sessionId}
            onSelect={handleSelectSession}
          />
        </Panel>

        <PanelResizeHandle className="w-1 bg-slate-200 hover:bg-indigo-300 cursor-col-resize" />

        <Panel>
          <div className="flex flex-col h-full bg-white">
            <header className="h-14 bg-white shadow-sm flex items-center px-6">
              <h1 className="font-semibold text-lg text-slate-800">AI 퀴즈</h1>
            </header>

            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-4"
            >
              {messages.map((m, i) => {
                if (m.kind === "quiz") {
                  return (
                    <ChatMessage key={i} role="ai">
                      <div>
                        <p className="font-medium">{m.question}</p>
                        <ul className="mt-2 text-sm text-slate-700 space-y-1">
                          {m.options?.map((opt: string, k: number) => (
                            <li key={k}>
                              {String.fromCharCode(65 + k)}. {opt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </ChatMessage>
                  );
                }

                return (
                  <ChatMessage key={i} role={m.role}>
                    {m.text}
                  </ChatMessage>
                );
              })}

              {/* 최초 상태 → 퀴즈 카드 */}
              {!sessionId && messages.length === 0 && (
                <ChatMessage role="ai">
                  <QuizCard onStart={handleStartQuiz} />
                </ChatMessage>
              )}

              {/* 세션 선택 후 퀴즈 없을 때 → 재도전 카드 */}
              {sessionId && quizList.length === 0 && (
                <ChatMessage role="ai">
                  <QuizRetryCard
                    sessionId={sessionId}
                    onRetry={handleRetryQuiz}
                  />
                </ChatMessage>
              )}

              <div ref={endRef} />
            </div>

            <Composer
              value={composer}
              onChange={setComposer}
              onSend={send}
              disabled={!sessionId || quizList.length === 0}
              placeholder="답변을 입력하세요…"
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
