"use client";

import { useState } from "react";
import Link from "next/link";
import type { Attachment, Comment, Post } from "@/types/board";
import { Heart, Paperclip, Pin, Trash2, Edit3, ArrowLeft } from "lucide-react";

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
  post,
  comments,
  attachments,
  onLike,
  onTogglePin,
  onDelete,
  onAddComment,
}: Props) {
  const [c, setC] = useState("");

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <section className="mx-auto w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 space-y-8">
        {/* 헤더 */}
        <header className="border-b pb-5 space-y-3">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            {post.isPinned && <span className="text-indigo-500 mr-1">📌</span>}
            {post.title}
          </h1>
          <p className="text-sm text-gray-500">
            {post.author} ·{" "}
            {new Date(post.createdAt).toLocaleDateString("ko-KR")}
          </p>

          {/* 액션 버튼 */}
          <div className="flex flex-wrap items-center gap-2 pt-3">
            <button
              onClick={onLike}
              className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
            >
              <Heart size={14} />
              좋아요 ({post.likeUserIds.length})
            </button>

            <button
              onClick={onTogglePin}
              className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
            >
              <Pin size={14} />
              {post.isPinned ? "고정 해제" : "상단 고정"}
            </button>

            <Link
              href={`/board/${post.id}/edit`}
              className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
            >
              <Edit3 size={14} /> 수정
            </Link>

            <button
              onClick={onDelete}
              className="flex items-center gap-1 rounded-md bg-rose-600 px-3 py-1.5 text-sm text-white hover:bg-rose-700 transition"
            >
              <Trash2 size={14} /> 삭제
            </button>

            <Link
              href="/board"
              className="ml-auto flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              <ArrowLeft size={14} /> 목록
            </Link>
          </div>
        </header>

        {/* 본문 */}
        <article className="whitespace-pre-wrap leading-relaxed text-gray-800 text-[15px]">
          {post.content}
        </article>

        {/* 첨부파일 */}
        {attachments.length > 0 && (
          <section className="border-t pt-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Paperclip size={16} className="text-indigo-500" />
              첨부파일
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {attachments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-2 bg-gray-50 rounded-md px-3 py-2 hover:bg-indigo-50 transition"
                >
                  📄
                  <a
                    href={a.url}
                    target="_blank"
                    className="text-indigo-600 hover:underline"
                  >
                    {a.fileName}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 댓글 */}
        <section className="border-t pt-6 space-y-4">
          <h2 className="font-semibold text-gray-800 text-lg">
            💬 댓글 {comments.length ? `(${comments.length})` : ""}
          </h2>

          {/* 댓글 목록 */}
          <div className="divide-y divide-gray-200">
            {comments.length === 0 ? (
              <div className="text-center text-sm py-10 text-gray-500">
                첫 댓글을 남겨보세요 ✨
              </div>
            ) : (
              comments.map((cm) => (
                <div key={cm.id} className="py-4">
                  <div className="text-xs text-gray-500 mb-1">
                    {cm.author} ·{" "}
                    {new Date(cm.createdAt).toLocaleDateString("ko-KR")}
                  </div>
                  <div className="text-sm text-gray-800 bg-gray-50 rounded-lg px-4 py-2">
                    {cm.content}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 댓글 작성 */}
          <form
            className="mt-4 flex gap-2"
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
              placeholder="댓글을 입력하세요..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none transition"
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              등록
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
