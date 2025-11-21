"use client";

import Card from "../parts/Card";
import Sparkline from "../parts/Sparkline";
import Heatmap from "../parts/Heatmap";
import { HeatDot, PresenceMetrics } from "../types";
import { calcStreak } from "../utils";

export default function AttendanceGroup({
  heat,
  presence,
}: {
  heat: HeatDot[];
  presence: PresenceMetrics;
}) {
  const { current, longest } = calcStreak(heat.map((h) => ({ visited: h.visited })));
  const nextGoal = Math.max(0, longest - current + 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 
      px-2 sm:px-0"> {/* ← 모바일 좌우 여백 살짝 줄임 */}

      {/* 출석 캘린더 */}
      <Card 
        title="출석 캘린더 (잔디)"
        className="text-xs sm:text-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">

          <div className="text-[11px] sm:text-xs text-neutral-500">최근 20주</div>

          <div className="flex flex-wrap items-center gap-1 text-[10px] sm:text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1">
              Less<div className="h-2.5 w-2.5 sm:h-3 sm:w-3 bg-neutral-200 rounded-sm" />
            </span>
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-200 rounded-sm" />
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-300 rounded-sm" />
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-400 rounded-sm" />
            <span className="inline-flex items-center gap-1">
              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-500 rounded-sm" />More
            </span>
          </div>
        </div>

        <div className="scale-[0.9] sm:scale-100 origin-top-left">
          <Heatmap data={heat} />
        </div>
      </Card>

      {/* 스트릭 */}
      <Card
        title="연속 출석 스트릭"
        right={<Sparkline data={presence.trend} />}
        className="text-xs sm:text-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-4">

          <div>
            <div className="text-3xl sm:text-4xl font-extrabold leading-none">
              {current}
              <span className="text-lg sm:text-xl font-semibold ml-1">일</span>
            </div>

            <div className="text-[11px] sm:text-xs text-neutral-500 mt-1">
              현재 스트릭
            </div>

            <div className="text-sm sm:text-base text-neutral-700 mt-3">
              최장 <span className="font-semibold">{longest}일</span>
            </div>

            <div className="text-[11px] sm:text-xs text-blue-600 mt-1">
              최장 갱신까지 {nextGoal}일 남았어요
            </div>
          </div>

          <div className="ml-auto text-right">
            <div className="text-[11px] sm:text-xs text-neutral-500">이번 주 결석</div>
            <div className="text-lg sm:text-xl font-semibold">0일</div>
          </div>

        </div>
      </Card>

      {/* 접속 시간 */}
      <Card
        title="출석 접속시간"
        right={<Sparkline data={presence.trend} />}
        className="md:col-span-2 text-xs sm:text-sm"
      >
        <div className="grid grid-cols-3 gap-3 sm:gap-4">

          <div>
            <div className="text-[11px] sm:text-xs text-neutral-500">오늘</div>
            <div className="text-lg sm:text-xl font-bold">{presence.todayMin}분</div>
          </div>

          <div>
            <div className="text-[11px] sm:text-xs text-neutral-500">최근 7일 평균</div>
            <div className="text-lg sm:text-xl font-bold">{presence.avg7Min}분</div>
          </div>

          <div>
            <div className="text-[11px] sm:text-xs text-neutral-500">이번 주 총합</div>
            <div className="text-lg sm:text-xl font-bold">{presence.weekMin}분</div>
          </div>

        </div>
      </Card>
    </div>
  );
}