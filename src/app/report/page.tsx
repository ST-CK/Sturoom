"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  AIReportGroup,
  AttendanceGroup,
  StudyGroup,
  LibraryReportGroup,
  aiBands,
  heatmapData,
  metrics,
} from "@/components/report";

type ReportLibraryOverview = {
  room_id: string;
  room_title: string;
  instructor: string;
  track: string | null;
  is_new: boolean | null;
  post_count: number;
  last_post_date: string | null;
  avg_week: number | null;
};

export default function ReportPage() {
  const [libraryData, setLibraryData] = useState<ReportLibraryOverview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      const { data, error } = await supabase
        .from("report_library_overview")
        .select("*");

      if (error) console.error("❌ Supabase Fetch Error:", error);
      else setLibraryData(data);
      setLoading(false);
    }
    loadReport();
  }, []);

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-neutral-50 to-white text-neutral-900">
      {/* ✅ 모바일 패딩/여백 보완 */}
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* ✅ 헤더: 모바일에서는 세로 정렬, PC에서는 가로 정렬 */}
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              리포트
            </h1>
            <p className="text-xs text-neutral-500 sm:text-sm">
              STACK³ · 학습 및 라이브러리 통합 리포트
            </p>
          </div>
          <button
            className="
              w-full rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white shadow 
              hover:bg-neutral-800
              sm:w-auto
            "
          >
            내보내기
          </button>
        </header>

        {/* 기존 분석 섹션 */}
        <AIReportGroup bands={aiBands} />

        <div className="mt-6">
          <AttendanceGroup heat={heatmapData} presence={metrics.presence} />
        </div>

        <div className="mt-6">
          <StudyGroup
            study={metrics.study}
            volume={metrics.volume}
            accuracy={metrics.accuracy}
          />
        </div>

        {/* Supabase 기반 라이브러리 리포트 */}
        <div className="mt-6">
          {loading ? (
            <p className="text-sm text-neutral-400">
              라이브러리 리포트 불러오는 중...
            </p>
          ) : (
            <LibraryReportGroup data={libraryData} />
          )}
        </div>

        <footer className="mt-8 pb-4 text-center text-[11px] text-neutral-400 sm:text-xs">
          © STACK³ • Report Dashboard v2.0
        </footer>
      </div>
    </main>
  );
}