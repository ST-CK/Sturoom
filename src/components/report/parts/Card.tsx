import React from "react";

export default function Card({
  title,
  right,
  className,
  children,
}: React.PropsWithChildren<{
  title?: string;
  right?: React.ReactNode;
  className?: string;
}>) {
  return (
    <div
      className={`
        rounded-2xl border border-neutral-200 
        bg-white/70 backdrop-blur p-4 sm:p-5 shadow-sm 
        ${className || ""}
      `}
    >
      {(title || right) && (
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          {title && (
            <h3 className="text-sm sm:text-base font-semibold text-neutral-800">
              {title}
            </h3>
          )}
          <div className="text-xs sm:text-sm">{right}</div>
        </div>
      )}
      {children}
    </div>
  );
}