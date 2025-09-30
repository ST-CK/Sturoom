import {
  AIReportGroup,
  AttendanceGroup,
  StudyGroup,
  aiBands,
  heatmapData,
  metrics,
} from "@/components/report";

export default function Page() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-neutral-50 to-white text-neutral-900">
      <div className="mx-auto max-w-6xl p-6">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">리포트</h1>
            <p className="text-sm text-neutral-500">STACK³ · 학습/출석 리포트</p>
          </div>
          <button className="rounded-xl bg-neutral-900 text-white px-4 py-2 text-sm shadow hover:bg-neutral-800">
            내보내기
          </button>
        </header>

        {/* 그룹 ① */}
        <AIReportGroup bands={aiBands} />

        {/* 그룹 ② */}
        <section className="mt-6">
          <AttendanceGroup heat={heatmapData} presence={metrics.presence} />
        </section>

        {/* 그룹 ③ */}
        <section className="mt-6">
          <StudyGroup study={metrics.study} volume={metrics.volume} accuracy={metrics.accuracy} />
        </section>

        <footer className="mt-8 text-center text-xs text-neutral-400">© STACK³ • Report v0.2</footer>
      </div>
    </main>
  );
}
