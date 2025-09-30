import { HeatDot } from "../types";
import { fmtDate } from "../utils";

export default function Heatmap({ data }: { data: HeatDot[] }) {
  const weeks = data.length / 7;
  const matrix = Array.from({ length: weeks }, (_, w) => data.slice(w*7, w*7 + 7));
  const color = (v: number) =>
    ["bg-neutral-200","bg-green-200","bg-green-300","bg-green-400","bg-green-500"][v] || "bg-neutral-200";

  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {matrix.map((col, i) => (
        <div key={i} className="flex flex-col gap-1">
          {col.map((d, j) => (
            <div key={`${i}-${j}`} className={`h-3 w-3 rounded-sm ${color(d.value)}`} title={fmtDate(d.date)} />
          ))}
        </div>
      ))}
    </div>
  );
}
