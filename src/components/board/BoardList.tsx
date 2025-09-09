"use client";

import Link from "next/link";
import type { Post } from "@/types/board";

type Props = {
  items: Post[];
  emptyText?: string;
};

export default function BoardList({ items, emptyText = "게시물이 없습니다." }: Props) {
  if (!items.length) {
    return <div className="py-16 text-center text-sm text-gray-500">{emptyText}</div>;
  }

  return (
    <div className="text-sm">
      {/* 헤더: md 이상에서만 보이기 */}
      <div className="hidden items-center border-b border-gray-200 pb-3 text-gray-500 md:flex">
        <div className="w-16">No</div>
        <div className="flex-1">제목</div>
        <div className="w-40">글쓴이</div>
        <div className="w-44 text-right">작성시간</div>
      </div>

      <ul className="divide-y divide-gray-100">
        {items.map((p, idx) => (
          <li key={p.id} className="py-4 hover:bg-gray-50/60">
            {/* md↑: 행 형태 */}
            <div className="hidden items-center md:flex">
              <div className="w-16 text-gray-500">{idx + 1}</div>
              <div className="flex-1">
                <Link href={`/board/${p.id}`} className="font-medium text-gray-900 hover:underline">
                  {p.isPinned && <span className="mr-1">📌</span>}
                  {p.title}
                </Link>
                <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{p.content}</p>
              </div>
              <div className="w-40 text-gray-600">{p.author}</div>
              <div className="w-44 text-right text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
            </div>

            {/* <md: 카드형 */}
            <div className="md:hidden">
              <Link href={`/board/${p.id}`} className="block">
                <div className="font-medium text-gray-900">
                  {p.isPinned && <span className="mr-1">📌</span>}
                  {p.title}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-gray-600">{p.content}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>{p.author}</span>
                  <time>{new Date(p.createdAt).toLocaleString()}</time>
                </div>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
