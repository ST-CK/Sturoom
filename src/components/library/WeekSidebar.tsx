"use client";

type Props = {
  weeks: number[];
  activeWeek?: number | null;
  onSelect?: (w: number | null) => void;
};

export default function WeekSidebar({ weeks, activeWeek = null, onSelect }: Props) {
  return (
    <aside className="hidden w-56 shrink-0 rounded-2xl border border-gray-200 bg-white/70 p-3 lg:block">
      <button
        onClick={() => onSelect?.(null)}
        className={`mb-1 w-full rounded-lg px-3 py-2 text-left text-sm ${
          activeWeek === null ? "bg-gray-900 text-white" : "hover:bg-gray-100"
        }`}
      >
        전체
      </button>
      <div className="mt-1 space-y-1">
        {weeks.map((w) => (
          <button
            key={w}
            onClick={() => onSelect?.(w)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
              activeWeek === w ? "bg-gray-900 text-white" : "hover:bg-gray-100"
            }`}
          >
            {w}주차
          </button>
        ))}
      </div>
    </aside>
  );
}
