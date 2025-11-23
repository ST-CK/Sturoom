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

type QuizPayload = {
  question?: string;
  choices?: string[];
  text?: string;
  // 예전 형식 호환용
  quiz?: { id?: string; question?: string; choices?: string[] }[];
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
   * 1. 메시지 바뀔 때마다 자동 스크롤
   * ------------------------------------- */
  useEffect(() => {
    if (chatScrollRef.current && endRef.current) {
      chatScrollRef.current.scrollTop = endRef.current.offsetTop;
    }
  }, [messages]);

  /* ---------------------------------------
   * 2. 세션 선택되면 과거 메시지 로드
   * ------------------------------------- */
  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    async function loadOldMessages() {
      const { data, error } = await supabase
        .from("quiz_messages")
        .select("id, role, kind, payload, created_at, seq")
        .eq("session_id", sessionId)
        .order("seq", { ascending: true });

      if (error) {
        console.error("❌ 과거 메시지 불러오기 실패:", error.message);
        return;
      }

    const parsed = (data || [])
      .map((m: any) => {
        // 카드 종류는 DB에 안 쓰기로 했으니 혹시 있어도 무시
        if (m.kind === "card") return null;

        let content: QuizPayload = {};
        try {
          content =
            typeof m.payload === "string"
              ? (JSON.parse(m.payload) as QuizPayload)
              : (m.payload as QuizPayload);
        } catch {
          content = { text: String(m.payload) };
        }

        // 예전 형식: { quiz: [ { question, choices }, ... ] } → 이런 건 무시
        if (Array.isArray(content.quiz)) {
          return null;
        }

        if (m.kind === "quiz") {
          return {
            id: m.id,
            role: "ai",
            kind: "quiz",
            question: content.question ?? "문제 로드 오류",
            options: content.choices ?? [],
          };
        }

        if (m.kind === "text") {
          return {
            id: m.id,
            role: m.role, // user / ai 그대로
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
   * 3. 사이드바에서 세션 선택
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
    if (!composer.trim() || !sessionId || !quizList.length) return;

    const answer = composer.trim();
    const currentQ = quizList[currentIndex];
    setComposer("");

    // 1) 내 답 화면에 표시
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, role: "user", kind: "text", text: answer },
    ]);

    // 2) 내 답 DB 저장
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("quiz_messages").insert({
      session_id: sessionId,
      run_id: runId,
      user_id: user?.id,
      role: "user",
      kind: "text",
      payload: JSON.stringify({ text: answer }),
    });

    // 3) 채점 요청
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
      : `❌ 오답입니다. 정답은 ${result?.correct_answer ?? "?"}${
          result?.explanation ? ` (해설: ${result.explanation})` : ""
        }`;

    // 4) 피드백 화면에 표시
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 2, role: "ai", kind: "text", text: feedbackText },
    ]);

    // 5) 다음 문제 / 종료 처리
    if (currentIndex + 1 < quizList.length) {
      const nextQ = quizList[currentIndex + 1];

      // 다음 문제도 DB에 남겨야, 나중에 채팅 다시 열었을 때 보임
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
          choices: nextQ.choices ?? [],
          question_id: nextQ.id,
        }),
      });

      setTimeout(() => {
        setCurrentIndex((v) => v + 1);
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
      }, 600);
    } else {
      // 마지막 문제였다면 종료 문구만 출력
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 3,
            role: "ai",
            kind: "text",
            text: "🎉 퀴즈가 모두 완료되었습니다!",
          },
        ]);

        setQuizList([]);
        setCurrentIndex(0);
        setRunId("");
      }, 600);
    }
  }

  /* ---------------------------------------
   * 5. 새 세션 시작 (최초 퀴즈 생성)
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
        data: { user },
      } = await supabase.auth.getUser();

      const postRes = await fetch(
        `/api/library/classrooms/${lectureId}/weeks/${weekId}/posts/${weekId}`
      );
      const postData = await postRes.json();

      const res = await fetch(`${BACKEND_URL}/api/quiz/from-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

      const list = (data?.quiz ?? []) as QuizItem[];
      if (!list.length) throw new Error("퀴즈가 비어 있습니다.");

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
          choices: list[0].choices ?? [],
          question_id: list[0].id,
        }),
      });

      // 첫 문제 화면 표시
      setMessages([
        {
          id: "q-1",
          role: "ai",
          kind: "quiz",
          question: list[0].question,
          options: list[0].choices ?? [],
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
        data: { user },
      } = await supabase.auth.getUser();

      const { data: sessionInfo } = await supabase
        .from("quiz_sessions")
        .select("lecture_id, week_id, mode")
        .eq("id", sId)
        .single();

      if (!sessionInfo) {
        console.error("❌ sessionInfo null");
        return;
      }

      const lecture_id = sessionInfo.lecture_id;
      const week_id = sessionInfo.week_id;
      const mode = (sessionInfo.mode as QuizType) ?? "mixed";

      const postRes = await fetch(
        `/api/library/classrooms/${lecture_id}/weeks/${week_id}/posts/${week_id}`
      );
      const postData = await postRes.json();

      const res = await fetch(`${BACKEND_URL}/api/quiz/from-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

      const list = (data?.quiz ?? []) as QuizItem[];
      if (!list.length) throw new Error("퀴즈가 비어 있습니다.");

      setRunId(rId);
      setQuizList(list);
      setCurrentIndex(0);

      // 새 런의 첫 문제 DB 저장
      await supabase.from("quiz_messages").insert({
        session_id: sId,
        run_id: rId,
        user_id: user?.id,
        role: "ai",
        kind: "quiz",
        payload: JSON.stringify({
          question: list[0].question,
          choices: list[0].choices ?? [],
          question_id: list[0].id,
        }),
      });

      // 기존 대화 뒤에 새 문제 붙이기
      setMessages((prev) => [
        ...prev,
        {
          id: `q-${Date.now()}`,
          role: "ai",
          kind: "quiz",
          question: list[0].question,
          options: list[0].choices ?? [],
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
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          <p className="mt-4 text-slate-700 font-semibold">
            AI가 퀴즈를 생성 중입니다...
          </p>
          <p className="text-sm text-slate-500 mt-1">
            잠시만 기다려 주세요 🤖
          </p>
        </div>
      )}

      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        <Panel defaultSize={18} minSize={14} maxSize={30}>
          <ChatSidebar
            selectedSessionId={sessionId}
            onSelect={handleSelectSession}
          />
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
              {/* 채팅 메시지들 */}
              {messages.map((m, i) => {
                if (m.kind === "quiz") {
                  return (
                    <ChatMessage key={i} role="ai">
                      <div>
                        <p className="font-medium">{m.question}</p>
                        {!!m.options?.length && (
                          <ul className="mt-2 text-sm text-slate-700 space-y-1">
                            {m.options.map((opt: string, k: number) => (
                              <li key={k}>
                                {String.fromCharCode(65 + k)}. {opt}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </ChatMessage>
                  );
                }

                if (m.kind === "text") {
                  return (
                    <ChatMessage key={i} role={m.role}>
                      {m.text}
                    </ChatMessage>
                  );
                }

                return null;
              })}

              {/* 맨 아래에 카드 1개만 */}
              {!sessionId && messages.length === 0 && (
                <ChatMessage role="ai">
                  <QuizCard onStart={handleStartQuiz} />
                </ChatMessage>
              )}

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
              placeholder="답변을 입력하세요..."
              disabled={!sessionId || loading || quizList.length === 0}
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
