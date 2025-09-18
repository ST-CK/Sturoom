"use client";

import type { Post } from "../../app/library/_data";

export default function ContentCard({ post, onOpen }: { post: Post; onOpen: (p: Post) => void }) {
  return (
    <div
      className="group relative rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
      onClick={() => onOpen(post)}
      role="button"
    >
      {/* 썸네일 프레임 (그라데이션) */}
      <div className="flex items-start gap-3">
        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-gray-200 via-gray-100 to-white ring-1 ring-gray-200" />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            {post.status && (
              <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                {post.status}
              </span>
            )}
            {post.tags?.map((t, i) => (
              <span key={i} className="inline-flex rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-700 ring-1 ring-violet-200">
                {t}
              </span>
            ))}
          </div>
          <div className="truncate text-[15px] font-semibold leading-5">{post.title}</div>
          {post.dueAt && (
            <div className="mt-1 text-xs text-gray-500">{post.dueAt} 까지</div>
          )}
          {post.summary && (
            <div className="mt-2 text-xs text-gray-600">{post.summary}</div>
          )}
        </div>
        <div className="absolute right-3 top-3 rounded-lg bg-gray-50 px-2 py-1 text-xs text-gray-500">⋯</div>
      </div>

      {/* 하단 메타 라인 */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-gray-100 px-1.5 py-0.5">주차 {post.week}</span>
          {post.attachments?.length ? <span>파일 {post.attachments.length}</span> : null}
        </div>
        <span className="opacity-80">댓글 0</span>
      </div>
    </div>
  );
}
