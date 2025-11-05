"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { boardRepo } from "@/services/board";
import type { Post } from "@/types/board";

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await boardRepo.get(String(id));
        setPost(p);
        setTitle(p.title);
        setContent(p.content);
        setIsPinned(p.isPinned);
      } catch {
        alert("게시글을 불러오지 못했습니다.");
        router.replace("/board");
      }
    })();
  }, [id, router]);

  if (!post) return <section className="p-6">불러오는 중…</section>;

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-5 pt-10">
      <h1 className="mb-6 text-2xl font-bold">글 수정</h1>

      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-b py-3 text-xl font-semibold outline-none"
          placeholder="제목"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="w-full rounded-md border p-3 text-sm"
          placeholder="내용"
        />
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
            상단 고정
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
            익명
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => history.back()}
            className="rounded-md border px-4 py-2 text-sm"
          >
            취소
          </button>
          <button
            onClick={async () => {
              try {
                setSaving(true);
                await boardRepo.update(post.id, { title, content, isPinned, isAnonymous });
                router.replace(`/board/${post.id}`);
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving || !title.trim() || !content.trim()}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white"
          >
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>
    </section>
  );
}
