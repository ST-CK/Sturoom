"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BoardForm from "@/components/board/BoardForm";
import { boardRepo } from "@/services/board";
import type { Post } from "@/types/board";

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    boardRepo.get(String(id)).then(setPost);
  }, [id]);

  if (!post) return <section className="p-4">불러오는 중…</section>;

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-5 pt-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">글 수정</h1>

      <BoardForm
        initialData={post}
        author={post.author}
        saving={saving}
        onSave={async ({ title, content, isPinned }) => {
          setSaving(true);
          await boardRepo.update(post.id, { title, content, isPinned });
          setSaving(false);
          router.replace(`/board/${post.id}`);
        }}
      />
    </section>
  );
}
