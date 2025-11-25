"use client";

import Link from "next/link";
import type { Post } from "@/types/board";

type Props = { items: Post[]; emptyText?: string };

export default function BoardList({ items, emptyText = "게시물이 없습니다." }: Props) {
  if (!items.length) {
    return (
      <div className="py-20 text-center text-gray-500 text-sm bg-white rounded-2xl shadow-sm">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
      {items.map((p) => (
        <Link
          key={p.id}
          href={`/board/${p.id}`}
          className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-md hover:shadow-xl hover:border-indigo-200 transition-all duration-300"
        >
          {p.isPinned && <div className="text-sm text-indigo-500 mb-1">📌 고정글</div>}
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 line-clamp-2">
            {p.title}
          </h3>
          <p className="mt-2 text-sm text-gray-600 line-clamp-3">{p.content}</p>

          <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
            <span className="font-medium">{p.author}</span>
            <span>{new Date(p.createdAt).toLocaleDateString("ko-KR")}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
