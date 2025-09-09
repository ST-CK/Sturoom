"use client";

import { useState } from "react";
import Link from "next/link";
import type { Attachment, Comment, Post } from "@/types/board";

type Props = {
  post: Post;
  comments: Comment[];
  attachments: Attachment[];
  onLike: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
  onAddComment: (text: string) => void;
};

export default function BoardDetail({
  post, comments, attachments, onLike, onTogglePin, onDelete, onAddComment,
}: Props) {
  const [c, setC] = useState("");

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* 제목/메타 */}
      <header className="pb-5">
        <h1 className="text-2xl font-bold tracking-tight">
          {post.isPinned && "📌 "}{post.title}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {post.author} · {new Date(post.createdAt).toLocaleString()}
        </p>

        {/* 액션 (반응형 랩) */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={onLike} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
            좋아요 ({post.likeUserIds.length})
          </button>
          <button onClick={onTogglePin} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
            {post.isPinned ? "고정 해제" : "고정"}
          </button>
          <Link href={`/board/${post.id}/edit`} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
            수정
          </Link>
          <button onClick={onDelete} className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700">
            삭제
          </button>

          {/* 목록으로: 우측 정렬 */}
          <Link href="/board" className="ml-auto rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
            목록으로
          </Link>
        </div>

        {/* 제목/본문 구분선 */}
        <div className="mt-5 border-b border-gray-200" />
      </header>

      {/* 본문: 내용이 짧아도 최소 35vh */}
      <article className="min-h-[35vh] py-6 whitespace-pre-wrap leading-relaxed text-gray-900">
        {post.content}
      </article>

      {/* 첨부 */}
      {attachments.length > 0 && (
        <>
          <div className="border-t border-gray-100" />
          <section className="py-6">
            <h3 className="mb-2 font-semibold">첨부파일</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {attachments.map(a => (
                <li key={a.id}>
                  <a href={a.url} target="_blank" className="text-indigo-600 hover:underline">
                    {a.fileName}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {/* 댓글 */}
      <div className="border-t border-gray-200" />
      <section className="py-6">
        <h2 className="mb-3 font-semibold">댓글 {comments.length ? `(${comments.length})` : ""}</h2>

        <div className="divide-y divide-gray-100 rounded-md">
          {comments.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">첫 댓글을 남겨보세요.</div>
          ) : (
            comments.map(cm => (
              <div key={cm.id} className="py-4">
                <div className="text-xs text-gray-500">
                  {cm.author} · {new Date(cm.createdAt).toLocaleString()}
                </div>
                <div className="mt-1 text-sm text-gray-900">{cm.content}</div>
              </div>
            ))
          )}
        </div>

        {/* 입력 바 */}
        <form
          className="mt-4 flex gap-2 border-t border-gray-100 pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!c.trim()) return;
            onAddComment(c.trim());
            setC("");
          }}
        >
          <input
            value={c}
            onChange={(e) => setC(e.target.value)}
            placeholder="댓글 입력"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            등록
          </button>
        </form>
      </section>
    </div>
  );
}
