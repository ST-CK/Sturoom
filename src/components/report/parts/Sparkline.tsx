"use client";

import React from "react";

export default function Sparkline({
  data = [],
  stroke = "#000",
  width = 120,
  height = 40,
}) {
  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height}>
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={stroke}
          strokeWidth="2"
        />
      </svg>
    );
  }

  // min/max 정상 계산
  const max = Math.max(...data);
  const min = Math.min(...data);
  const diff = max - min || 1;

  // 좌표 변환
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / diff) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height}>
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}
