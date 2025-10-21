"use client";

import Card from "../parts/Card";
import { Band } from "../types";

export default function AIReportGroup({ bands }: { bands: Band[] }) {
  return (
    <Card
      title="AI 학습진단 리포트"
      right={<span className="text-xs text-neutral-500">최근 4주</span>}
    >
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {bands.map((b, i) => (
          <div
            key={i}
            className="rounded-xl bg-gradient-to-b from-white to-neutral-50 p-4 border border-neutral-200"
          >
            <div className="mb-3 h-28 flex items-end">
              <div className="w-full">
                {/* 트랙 바 */}
                <div className="h-24 w-10 mx-auto rounded-t-md bg-neutral-200/70 overflow-hidden">
                  <div
                    className="h-full w-full bg-gradient-to-t from-blue-600 to-indigo-600"
                    style={{ transform: `translateY(${100 - b.value}%)` }}
                    aria-label={`${b.label} ${b.value}%`}
                    role="img"
                  />
                </div>
              </div>
            </div>

            <div className="text-xs font-medium text-neutral-600 truncate">
              {b.label}
            </div>
            <div className="text-sm font-semibold">
              {b.level} · {b.value}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
