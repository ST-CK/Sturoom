"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
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
  selectedSessionId?: string; // ⭐ 현재 선택된 세션
  onSelect?: (sessionId: string) => void;
};

export default function ChatSidebar({ selectedSessionId, onSelect }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);

  const modeMap: Record<string, string> = {
    multiple: "선다형",
    short: "서술형",
    ox: "OX",
    mixed: "혼합",
  };

  // -------------------------------
  // 1) 세션 목록 로드
  // -------------------------------
  async function loadSessions() {
    const { data, error } = await supabase
      .from("quiz_sessions_view")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ 세션 불러오기 실패:", error.message);
      return;
    }

    // quiz_count=0 은 '완전 빈 세션' → 숨김 처리
    const filtered = (data || []).filter((s: Session) => (s.quiz_count ?? 0) > 0);
    setSessions(filtered as Session[]);
  }

  // 첫 로딩
  useEffect(() => {
    loadSessions();
  }, []);

  // -------------------------------
  // 2) Supabase Realtime 구독
  // -------------------------------
  useEffect(() => {
    const channel = supabase
      .channel("quiz_sessions_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "quiz_sessions" },
        () => {
          loadSessions(); // CRUD 발생 시 즉시 새로고침
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200">
      {/* 헤더 */}
      <div className="h-12 flex items-center px-4 border-b border-slate-200 bg-slate-50/80 backdrop-blur-md">
        <h2 className="font-semibold text-slate-700">AI 퀴즈 기록</h2>
      </div>

      {/* 세션 리스트 */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
            저장된 세션이 없습니다.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sessions.map((s) => {
              const isSelected = selectedSessionId === s.id; // ⭐ 선택된 세션 하이라이트

              const lectureTitle = s.lecture_title || "강의실 없음";
              const weekLabel = s.week_number
                ? `${s.week_number}주차`
                : "주차 정보 없음";
              const modeLabel =
                modeMap[s.mode ?? ""] ??
                s.mode?.toUpperCase() ??
                "MODE";

              const title = `${lectureTitle} · ${weekLabel} · ${modeLabel}`;
              const time = format(
                new Date(s.created_at),
                "M월 d일 a h:mm",
                { locale: ko }
              );

              return (
                <li
                  key={s.id}
                  onClick={() => onSelect?.(s.id)}
                  className={`
                    px-4 py-3 cursor-pointer transition
                    ${isSelected ? "bg-indigo-100" : "hover:bg-indigo-50"}
                  `}
                >
                  <div
                    className={`
                      font-medium truncate
                      ${isSelected ? "text-indigo-700" : "text-indigo-600"}
                    `}
                  >
                    {title}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{time}</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 새 퀴즈 버튼 */}
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={() => window.location.reload()}
          className="
            w-full rounded-lg bg-indigo-600 hover:bg-indigo-700
            text-white text-sm py-2 font-medium transition
          "
        >
          + 새 퀴즈 시작
        </button>
      </div>
    </div>
  );
}
