"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

import {
  AIReportGroup,
  AttendanceGroup,
  StudyGroup,
  AISummary
} from "@/components/report";

// 타입 꼬임 막으려고 일단 전부 any로 받자
type UISummary = {
  aiBands: any[];
  aiExtraBands: any[],
  attendanceData: {
    heat: any[];
    presence: any;
  };
  studyData: {
    study: any;
    volume: any;
    accuracy: any;
  };
  ai?: any;
};

export default function ReportPage() {
  const [summary, setSummary] = useState<any>(null); // 원본 API 응답
  const [ui, setUI] = useState<UISummary | null>(null); // 화면용 가공 데이터
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // 🔥 summary → UI 변환 함수
  // -----------------------------
  function transformSummaryToUI(api: any, aiData?: any): UISummary {
    if (!api || !api.quiz || !api.attendance) {
      return {
        aiBands: [],
        aiExtraBands: [],
        attendanceData: {
          heat: [],
          presence: {
            todayMin: 0,
            avg7Min: 0,
            weekMin: 0,
            trend: [],
            currentStreak: 0,
            bestStreak: 0,
          },
        },
        studyData: {
          study: {
            totalH: 0,
            totalM: 0,
            avgPerSessionMin: 0,
            sessions: 0,
            trend: [],
          },
          volume: {
            problems: 0,
            weekDiffProblems: 0,
            videosMin: 0,
            weekDiffVideos: 0,
          },
          accuracy: {
            rate: 0,
            diff: 0,
          },
        },
      };
    }

    const att = api.attendance;
    const quiz = api.quiz;

    const heat = (att.daily || []).map((d: any) => {
      const seconds = d.seconds || 0;
      return {
        date: new Date(d.date),
        visited: seconds > 0,
        value: Math.min(4, Math.floor(seconds / 300)),
      };
    });

    const last7 = (att.daily || []).slice(-7);
    const presenceTrend =
      last7.length > 0
        ? last7.map((d: any) => Math.floor((d.seconds || 0) / 60))
        : [0];

    const totalSeconds = att.total_seconds || 0;

    // 🟦 기본 3개 (평균·최고·최근)
    const aiBands = [
      {
        label: "평균 점수",
        level: "기본",
        value: quiz.average_score,
      },
      {
        label: "최고 점수",
        level: "우수",
        value: quiz.best_score,
      },
      {
        label: "최근 점수",
        level: "최근",
        value: quiz.latest_score,
      },
    ];

    // 🟪 AI metrics 3개 추가
    let aiExtraBands: any[] = [];
    if (aiData?.metrics) {
      aiExtraBands = [
        {
          label: "집중도",
          level: "Focus",
          value: aiData.metrics.focus_score,
        },
        {
          label: "학습 균형",
          level: "Balance",
          value: aiData.metrics.balance_score,
        },
        {
          label: "준비도",
          level: "Readiness",
          value: aiData.metrics.readiness_score,
        },
      ];
    }

    return {
      aiBands,
      aiExtraBands,   // 추가됨!!
      attendanceData: {
        heat,
        presence: {
          todayMin: att.today_seconds
            ? Math.floor(att.today_seconds / 60)
            : 0,
          weekMin: Math.floor((att.this_week_seconds || 0) / 60),
          avg7Min: Math.floor(totalSeconds / 60 / 7),
          trend: presenceTrend,
          currentStreak: att.current_streak ?? 0,
          bestStreak: att.best_streak ?? 0,
        },
      },

      studyData: {
        study: {
          totalH: Math.floor(totalSeconds / 3600),
          totalM: Math.floor((totalSeconds % 3600) / 60),
          avgPerSessionMin:
            att.sessions > 0
              ? Math.floor(totalSeconds / 60 / att.sessions)
              : 0,
          sessions: att.sessions || 0,
          trend: presenceTrend,
        },

        volume: {
          problems: quiz.total_questions || 0,
          weekDiffProblems: 0,
          videosMin: 0,
          weekDiffVideos: 0,
        },

        accuracy: {
          rate: (quiz.accuracy_overall || 0) / 100,
          diff: 0,
        },
      },
      ai: aiData || null
    };
  }

  // -----------------------------
  // 🔥 summary 불러오기
  // -----------------------------
  useEffect(() => {
    async function loadSummary() {
      try {
        const { data: user } = await supabase.auth.getUser();
        const userId = user?.user?.id;

        if (!userId) {
          console.error("❌ 로그인된 사용자 없음");
          setLoading(false);
          return;
        }

        // 1️⃣ summary 먼저 가져오기
        const res = await fetch(
          `http://127.0.0.1:5000/api/report/summary?user_id=${userId}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          console.error("❌ summary 오류:", res.status);
          setLoading(false);
          return;
        }

        const data = await res.json();

        // 2️⃣ AI summary 가져오기
        const aiRes = await fetch("http://127.0.0.1:5000/api/report/ai-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summary: data }),
        });

        let aiData = null;
        if (aiRes.ok) {
          const aiJson = await aiRes.json();
          aiData = aiJson.ai_report;
        }

        // 3️⃣ summary + aiData 한 번에 UI 변환
        const transformed = transformSummaryToUI(data, aiData);

        // 4️⃣ UI 최종 업데이트 (한 번만)
        setUI(transformed);

        setLoading(false);
      } catch (err) {
        console.error("❌ 요청 실패:", err);
        setLoading(false);
      }
    }

    loadSummary();
  }, []);

  // -----------------------------
  // 🔥 로딩 중
  // -----------------------------
  if (loading || !ui) {
    return (
      <div className="p-6 text-neutral-500">리포트를 불러오는 중...</div>
    );
  }

  // -----------------------------
  // 🔥 최종 렌더링
  // -----------------------------
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-neutral-50 to-white text-neutral-900">
      <div className="mx-auto max-w-6xl p-6">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">리포트</h1>
            <p className="text-sm text-neutral-500">
              학습자 AI 리포트 · AI 학습진단 · 출석 · 퀴즈 통계
            </p>
          </div>
          <button className="rounded-xl bg-neutral-900 text-white px-4 py-2 text-sm shadow hover:bg-neutral-800">
            내보내기
          </button>
        </header>

        {/* AI 요약 보고서 */}
        <div className="mt-6">
          <AISummary ai={ui.ai} />
        </div>

        {/* AI 학습진단 리포트 막대 3개 */}
        <div className="mt-6">
          <AIReportGroup bands={[...ui.aiBands, ...(ui.aiExtraBands || [])]} />
        </div>

        {/* 출석(잔디 + 스트릭 + 접속시간) */}
        <div className="mt-6">
          <AttendanceGroup
            heat={ui.attendanceData.heat}
            presence={ui.attendanceData.presence}
          />
        </div>

        {/* 학습시간/학습량/정답률 */}
        <div className="mt-6">
          <StudyGroup
            study={ui.studyData.study}
            volume={ui.studyData.volume}
            accuracy={ui.studyData.accuracy}
          />
        </div>

        <footer className="mt-8 text-center text-xs text-neutral-400">
          © STACK³ • Report Dashboard v2.1
        </footer>
      </div>
    </main>
  );
}
