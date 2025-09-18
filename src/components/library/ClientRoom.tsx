"use client";

import { useMemo, useState } from "react";
import type { Post } from "../../app/library/_data";
import WeekSidebar from "./WeekSidebar";
import ContentCard from "./ContentCard";
import PostModal from "./PostModal";

export default function ClientRoom({
  initialWeeks,
  initialPosts,
}: {
  initialWeeks: number[];
  initialPosts: Post[];
}) {
  const [activeWeek, setActiveWeek] = useState<number | null>(null);
  const [open, setOpen] = useState<Post | null>(null);

  const posts = useMemo(
    () => (activeWeek === null ? initialPosts : initialPosts.filter((p) => p.week === activeWeek)),
    [activeWeek, initialPosts]
  );

  return (
    <div className="flex gap-6">
      <WeekSidebar weeks={initialWeeks} activeWeek={activeWeek} onSelect={setActiveWeek} />

      <div className="flex-1">
        {/* 상단 탭 (모바일 대비) */}
        <div className="mb-3 flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setActiveWeek(null)}
            className={`rounded-xl px-3 py-1.5 text-sm ${activeWeek === null ? "bg-gray-900 text-white" : "bg-gray-100"}`}
          >
            전체
          </button>
          {[...new Set(initialPosts.map((p) => p.week))].sort((a, b) => b - a).map((w) => (
            <button
              key={w}
              onClick={() => setActiveWeek(w)}
              className={`rounded-xl px-3 py-1.5 text-sm ${activeWeek === w ? "bg-gray-900 text-white" : "bg-gray-100"}`}
            >
              {w}주차
            </button>
          ))}
        </div>

        <h2 className="mb-3 text-sm font-semibold text-gray-600">
          {activeWeek === null ? "전체 콘텐츠" : `${activeWeek}주차`}
        </h2>

        <div className="space-y-3">
          {posts.map((p) => (
            <ContentCard key={p.id} post={p} onOpen={setOpen} />
          ))}
        </div>

        {open && <PostModal post={open} onClose={() => setOpen(null)} />}
      </div>
    </div>
  );
}
