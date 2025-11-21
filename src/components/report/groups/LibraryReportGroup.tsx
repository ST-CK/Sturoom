"use client";

import Card from "../parts/Card";

type LibraryReport = {
  room_id: string;
  room_title: string;
  instructor: string;
  track: string | null;
  is_new: boolean | null;
  post_count: number;
  last_post_date: string | null;
  avg_week: number | null;
};

export default function LibraryReportGroup({ data }: { data: LibraryReport[] }) {
  if (!data.length) {
    return (
      <Card title="📚 라이브러리 리포트 요약">
        <p className="text-xs sm:text-sm text-neutral-400">데이터가 없습니다.</p>
      </Card>
    );
  }

  return (
    <Card
      title="📚 라이브러리 리포트 요약"
      right={
        <span className="text-[11px] sm:text-xs text-neutral-500">
          Supabase 데이터 기반
        </span>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {data.map((room) => (
          <div
            key={room.room_id}
            className="rounded-xl border border-neutral-200 p-3 sm:p-4 bg-gradient-to-b from-white to-neutral-50"
          >
            <div className="flex justify-between items-center mb-2 gap-2">
              <h3 className="text-sm sm:text-base font-semibold truncate">
                {room.room_title}
              </h3>
              {room.is_new && (
                <span className="text-[11px] sm:text-xs text-blue-600 font-medium shrink-0">
                  NEW
                </span>
              )}
            </div>

            <p className="text-[11px] sm:text-sm text-neutral-600 mb-2">
              {room.instructor} · {room.track ?? "트랙 미지정"}
            </p>

            <div className="text-xs sm:text-sm text-neutral-700">
              📄 게시글 수:{" "}
              <span className="font-semibold">{room.post_count}</span>
            </div>

            <div className="text-[11px] sm:text-xs text-neutral-500 mt-1">
              마지막 작성:{" "}
              {room.last_post_date
                ? new Date(room.last_post_date).toLocaleDateString()
                : "없음"}
            </div>

            <div className="text-[11px] sm:text-xs text-neutral-500">
              평균 주차: {room.avg_week ?? "-"}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}