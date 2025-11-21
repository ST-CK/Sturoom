"use client";

export default function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const pts = data
    .map((y, i) => `${(i / (data.length - 1)) * 100},${100 - (y / max) * 100}`)
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      className="
        h-8 w-24
        /* 📱 모바일에서 조금 더 크게 */
        sm:h-10 sm:w-28
      "
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        strokeWidth="2"
        stroke="currentColor"
        className="text-neutral-400"
        points={pts}
      />
    </svg>
  );
}