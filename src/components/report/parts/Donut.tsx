export default function Donut({ value, size = 128, label }: { value: number; size?: number; label?: string }) {
  const r = 56, c = 2 * Math.PI * r, off = c * (1 - value);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
        <circle cx="64" cy="64" r={r} strokeWidth="12" className="fill-none stroke-neutral-200" />
        <circle cx="64" cy="64" r={r} strokeWidth="12" className="fill-none stroke-blue-500"
                strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-2xl font-bold text-neutral-900">{Math.round(value*100)}%</div>
          {label && <div className="text-xs text-neutral-500">{label}</div>}
        </div>
      </div>
    </div>
  );
}
