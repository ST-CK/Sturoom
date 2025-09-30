"use client";

export default function WeekSidebar({
  weeks,
  activeWeek,
  onSelect,
}: {
  weeks: number[];
  activeWeek: number | null;
  onSelect: (w: number | null) => void;
}) {
  return (
    <div className="w-40 shrink-0">
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => onSelect(null)}
            className={`w-full rounded px-3 py-2 text-left ${
              activeWeek === null
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            전체 보기
          </button>
        </li>
        {weeks.map((w) => (
          <li key={w}>
            <button
              onClick={() => onSelect(w)}
              className={`w-full rounded px-3 py-2 text-left ${
                activeWeek === w
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {w}주차
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
