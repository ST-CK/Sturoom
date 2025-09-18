"use client";
import Link from "next/link";

type Props = {
  id: string;                // 과목코드 (ex. 603137-01)
  title: string;             // 과목명
  instructor: string;        // 강의자
  track?: string;            // 교과(오프라인)
  thumbnail?: string | null; // 없으면 파란 그라데이션
  isNew?: boolean;           // NEW 배지
};

export default function RoomCard({
  id, title, instructor, track = "교과(오프라인)", thumbnail = null, isNew = false,
}: Props) {
  return (
    <Link
      href={`/library/${id}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* ── 썸네일 (없으면 Hero 톤의 파란 그라데이션) ───────────────────── */}
      <div className="relative h-36 w-full overflow-hidden">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-tr from-sky-400 to-indigo-500" />
        )}
        {/* 은은한 라이트 */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_-10%,rgba(255,255,255,0.55),rgba(255,255,255,0))]" />

        {/* 좌상단: 수업방식 배지 */}
        {track && (
          <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-gray-800 ring-1 ring-gray-200 backdrop-blur">
            {track}
          </span>
        )}

        {/* 우상단: NEW 배지 */}
        {isNew && (
          <span className="absolute right-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            NEW
          </span>
        )}
      </div>

      {/* 제목 */}
      <div className="px-4 pb-2 pt-3 text-center">
        <div className="line-clamp-1 text-[15px] font-semibold text-gray-900">
          {title}
        </div>
      </div>

      {/* 구분선: 카드 전체 너비로 쭉 */}
      <div className="h-px w-full bg-gray-200" />

      {/* 하단 정보: 강의자 · 과목코드 */}
      <div className="px-5 py-4 text-center text-[13px] leading-relaxed text-gray-700">
        <div>
          {instructor} <span className="mx-2 text-gray-300">·</span> {id}
        </div>
      </div>
    </Link>
  );
}
