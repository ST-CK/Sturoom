//잔디, 스트릭, 출석시간
import Card from "../parts/Card";
import Sparkline from "../parts/Sparkline";
import Heatmap from "../parts/Heatmap";
import { HeatDot, PresenceMetrics } from "../types";
import { calcStreak } from "../utils";

export default function AttendanceGroup({
  heat, presence,
}: { heat: HeatDot[]; presence: PresenceMetrics }) {
  const { current, longest } = calcStreak(heat.map(h => ({ visited: h.visited })));
  const nextGoal = Math.max(0, longest - current + 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 잔디 */}
      <Card title="출석 캘린더 (잔디)">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-neutral-500">최근 20주</div>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1">Less<div className="h-3 w-3 bg-neutral-200 rounded-sm" /></span>
            <div className="h-3 w-3 bg-green-200 rounded-sm" />
            <div className="h-3 w-3 bg-green-300 rounded-sm" />
            <div className="h-3 w-3 bg-green-400 rounded-sm" />
            <span className="inline-flex items-center gap-1"><div className="h-3 w-3 bg-green-500 rounded-sm" />More</span>
          </div>
        </div>
        <Heatmap data={heat} />
      </Card>

      {/* 스트릭 */}
      <Card title="연속 출석 스트릭" right={<Sparkline data={presence.trend} />}>
        <div className="flex items-center gap-6">
          <div>
            <div className="text-4xl font-extrabold leading-none">
              {current}<span className="text-xl font-semibold ml-1">일</span>
            </div>
            <div className="text-xs text-neutral-500 mt-1">현재 스트릭</div>
            <div className="text-sm text-neutral-700 mt-3">최장 <span className="font-semibold">{longest}일</span></div>
            <div className="text-xs text-blue-600 mt-1">최장 갱신까지 {nextGoal}일 남았어요</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs text-neutral-500">이번 주 결석</div>
            <div className="text-lg font-semibold">0일</div>
          </div>
        </div>
      </Card>

      {/* 출석 접속시간 (2열 가득 채우도록 col-span-2) */}
      <Card title="출석 접속시간" right={<Sparkline data={presence.trend} />} className="md:col-span-2">
        <div className="grid grid-cols-3 gap-4">
          <div><div className="text-xs text-neutral-500">오늘</div><div className="text-xl font-bold">{presence.todayMin}분</div></div>
          <div><div className="text-xs text-neutral-500">최근 7일 평균</div><div className="text-xl font-bold">{presence.avg7Min}분</div></div>
          <div><div className="text-xs text-neutral-500">이번 주 총합</div><div className="text-xl font-bold">{presence.weekMin}분</div></div>
        </div>
      </Card>
    </div>
  );
}
