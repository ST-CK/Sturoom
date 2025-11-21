"use client";

import Card from "../parts/Card";
import Sparkline from "../parts/Sparkline";
import Donut from "../parts/Donut";
import { AccuracyMetrics, StudyMetrics, VolumeMetrics } from "../types";

export default function StudyGroup({
  study,
  volume,
  accuracy,
}: {
  study: StudyMetrics;
  volume: VolumeMetrics;
  accuracy: AccuracyMetrics;
}) {
  const diffText = `${accuracy.diff >= 0 ? "+" : ""}${Math.round(
    accuracy.diff * 100
  )}%p`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {/* 학습시간 */}
      <Card title="학습시간" right={<Sparkline data={study.trend} />}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div>
            <div className="text-xs sm:text-sm text-neutral-500">총 학습시간</div>
            <div className="text-xl sm:text-2xl font-bold">
              {study.totalH}시간 {study.totalM}분
            </div>

            <div className="text-xs sm:text-sm text-neutral-500 mt-2">
              세션당 평균
            </div>
            <div className="text-base sm:text-lg font-semibold">
              {study.avgPerSessionMin}분 / {study.sessions}세션
            </div>
          </div>
        </div>
      </Card>

      {/* 학습량 */}
      <Card title="학습량">
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          <div className="rounded-xl border border-neutral-200 p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-neutral-500">
              문항 풀이 수
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {volume.problems.toLocaleString()}개
            </div>
            <div className="text-[11px] sm:text-xs text-blue-600 mt-1">
              지난주 대비 +{volume.weekDiffProblems}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-neutral-500">
              동영상 학습(분)
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {volume.videosMin.toLocaleString()}분
            </div>
            <div className="text-[11px] sm:text-xs text-blue-600 mt-1">
              지난주 대비 +{volume.weekDiffVideos}
            </div>
          </div>
        </div>
      </Card>

      {/* 정답률 */}
      <Card title="정답률" className="md:col-span-2">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* 도넛 그래프 */}
          <div className="scale-90 sm:scale-100">
            <Donut value={accuracy.rate} label="최근 4주" />
          </div>

          {/* 텍스트 */}
          <div className="text-center sm:text-left">
            <div className="text-sm text-neutral-600">최근 정답률</div>
            <div className="text-2xl sm:text-3xl font-extrabold">
              {Math.round(accuracy.rate * 100)}%
            </div>

            <div
              className={`text-sm sm:text-base mt-1 sm:mt-2 ${
                accuracy.diff >= 0 ? "text-blue-600" : "text-rose-600"
              }`}
            >
              {diffText}
            </div>

            <p className="text-[11px] sm:text-xs text-neutral-500 mt-2 sm:mt-3 leading-relaxed">
              최근 100문항 기준, 단원/난이도 보정 없음
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}