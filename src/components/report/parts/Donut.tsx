"use client";

export default function Donut({
  value,
  size = 128,
  label,
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const r = 56;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value);

  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={r}
          strokeWidth="12"
          className="fill-none stroke-neutral-200"
        />
        <circle
          cx="64"
          cy="64"
          r={r}
          strokeWidth="12"
          className="fill-none stroke-blue-500"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-xl sm:text-2xl font-bold text-neutral-900">
            {Math.round(value * 100)}%
          </div>
          {label && (
            <div className="text-[11px] sm:text-xs text-neutral-500">
              {label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}