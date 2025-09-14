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

export default function BoardDetail({ post, comments, attachments, onLike, onTogglePin, onDelete, onAddComment }: Props) {
  const [c, setC] = useState("");

  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="pb-5">
        <h1 className="text-2xl font-bold">{post.isPinned && "📌 "}{post.title}</h1>
        <p className="text-sm text-gray-500">
          {post.author} · {new Date(post.createdAt).toLocaleString()}
        </p>
        <div className="mt-3 flex gap-2 flex-wrap">
          <button onClick={onLike} className="border px-3 py-1.5 rounded-md text-sm">
            좋아요 ({post.likeUserIds.length})
          </button>
          <button onClick={onTogglePin} className="border px-3 py-1.5 rounded-md text-sm">
            {post.isPinned ? "고정 해제" : "고정"}
          </button>
          <Link href={`/board/${post.id}/edit`} className="border px-3 py-1.5 rounded-md text-sm">수정</Link>
          <button onClick={onDelete} className="bg-rose-600 text-white px-3 py-1.5 rounded-md text-sm">삭제</button>
          <Link href="/board" className="ml-auto border px-3 py-1.5 rounded-md text-sm">목록</Link>
        </div>
        <div className="mt-5 border-b" />
      </header>

      <article className="py-6 whitespace-pre-wrap">{post.content}</article>

      {attachments.length > 0 && (
        <section className="py-6">
          <h3 className="font-semibold">첨부파일</h3>
          <ul className="list-disc pl-5 text-sm">
            {attachments.map(a => (
              <li key={a.id}>
                <a href={a.url} target="_blank" className="text-indigo-600">{a.fileName}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="py-6">
        <h2 className="font-semibold">댓글 {comments.length ? `(${comments.length})` : ""}</h2>
        <div className="divide-y">
          {comments.length === 0
            ? <div className="text-center text-sm py-10 text-gray-500">첫 댓글을 남겨보세요.</div>
            : comments.map(cm => (
              <div key={cm.id} className="py-3">
                <div className="text-xs text-gray-500">{cm.author} · {new Date(cm.createdAt).toLocaleString()}</div>
                <div className="text-sm">{cm.content}</div>
              </div>
            ))}
        </div>
        <form className="mt-4 flex gap-2" onSubmit={(e) => {
          e.preventDefault();
          if (!c.trim()) return;
          onAddComment(c.trim());
          setC("");
        }}>
          <input value={c} onChange={(e) => setC(e.target.value)} placeholder="댓글 입력"
                 className="flex-1 border px-3 py-2 rounded-md text-sm"/>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm">등록</button>
        </form>
      </section>
    </div>
  );
}
