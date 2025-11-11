"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

type Session = {
  id: string;
  lecture_id: string | null;
  week_id: string | null;
  mode: string | null;
  quiz_count: number | null;
  created_at: string;
  lecture_title?: string | null;
  week_number?: number | null;
  post_title?: string | null;
};

type Props = {
  onSelect?: (sessionId: string) => void;
};

export default function ChatSidebar({ onSelect }: Props) {
  const supabase = createClientComponentClient();
  const [sessions, setSessions] = useState<Session[]>([]);

  // ✅ 영어 → 한글 모드 변환
  const modeMap: Record<string, string> = {
    multiple: "선다형",
    short: "서술형",
    ox: "OX",
    mixed: "혼합",
  };

  // ✅ 세션 목록 불러오기
  async function loadSessions() {
    const { data, error } = await supabase
      .from("quiz_sessions_view")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ 세션 불러오기 실패:", error.message);
      return;
    }

    const filtered = (data || []).filter((s) => (s.quiz_count ?? 0) > 0);
    setSessions(filtered as Session[]);
  }

  // ✅ 초기 세션 로드
  useEffect(() => {
    loadSessions();
  }, []);

  // ✅ 실시간 구독 (Supabase Realtime)
  useEffect(() => {
    // 클라이언트 전용 supabase 인스턴스
    const supabaseClient = createClientComponentClient();

    // 채널 구독
    const channel = supabaseClient
      .channel("realtime:quiz_sessions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quiz_sessions",
        },
        (payload) => {
          console.log("♻️ 세션 변경 감지:", payload);
          loadSessions(); // 변경 시 다시 불러오기
        }
      )
      .subscribe((status) => console.log("📡 Realtime 연결 상태:", status));

    // cleanup 함수 (언마운트 시 구독 해제)
    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  // ✅ UI 렌더링
  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200">
      {/* 상단 헤더 */}
      <div className="h-12 flex items-center px-4 border-b border-slate-200 bg-slate-50/80 backdrop-blur-md">
        <h2 className="font-semibold text-slate-700">AI 퀴즈 기록</h2>
      </div>

      {/* 본문 리스트 */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
            저장된 세션이 없습니다.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sessions.map((s) => {
              const lectureTitle = s.lecture_title || "강의실 없음";
              const weekLabel = s.week_number
                ? `${s.week_number}주차`
                : "주차 정보 없음";
              const modeLabel =
                modeMap[s.mode ?? ""] ?? s.mode?.toUpperCase() ?? "MODE";
              const title = `${lectureTitle} · ${weekLabel} · ${modeLabel}`;
              const time = format(new Date(s.created_at), "M월 d일 a h:mm", {
                locale: ko,
              });

              return (
                <li
                  key={s.id}
                  onClick={() => onSelect?.(s.id)}
                  className="px-4 py-3 hover:bg-indigo-50 transition cursor-pointer"
                >
                  <div className="text-indigo-600 font-medium truncate">
                    {title}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{time}</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 하단 새 퀴즈 버튼 */}
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={() => window.location.reload()}
          className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 font-medium transition"
        >
          + 새 퀴즈 시작
        </button>
      </div>
    </div>
  );
}
