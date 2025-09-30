import React from "react";
import { cx } from "../utils";

export default function Card({
  title, right, className, children,
}: React.PropsWithChildren<{ title?: string; right?: React.ReactNode; className?: string }>) {
  return (
    <div className={cx("rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur p-5 shadow-sm", className)}>
      {(title || right) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>}
          {right}
        </div>
      )}
      {children}
    </div>
  );
}
