"use client";
import { useState } from "react";
import { PlusCircle } from "lucide-react";

export default function ChatSidebar() {
  const [sessions] = useState([
    { id: 1, title: "3주차 회귀분석 퀴즈" },
    { id: 2, title: "4주차 다중회귀 퀴즈" },
  ]);

  return (
    <aside className="flex flex-col h-full bg-gradient-to-b from-indigo-50 to-white/80 border-r border-indigo-100/50 backdrop-blur-lg">
      <div className="px-4 py-3 border-b border-indigo-100/50">
        <h2 className="font-semibold text-indigo-700">AI 퀴즈 기록</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {sessions.map((s) => (
          <button
            key={s.id}
            className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-indigo-100/40 transition"
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="p-3 border-t border-indigo-100/50">
        <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 text-white py-2 text-sm font-semibold hover:opacity-90 transition">
          <PlusCircle className="h-4 w-4" /> 새 퀴즈 시작
        </button>
      </div>
    </aside>
  );
}
