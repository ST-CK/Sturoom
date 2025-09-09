"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BoardForm from "@/components/board/BoardForm";
import { boardRepo } from "@/services/board";

export default function NewPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const me = "demo@sturoom.dev";

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-5 pt-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">새 글 작성</h1>

      <BoardForm
        author={me}
        saving={saving}
        onSave={async ({ title, content, files, isPinned }) => {
          setSaving(true);
          const id = await boardRepo.create({ title, content, author: me, attachments: files });
          if (isPinned) await boardRepo.update(id, { isPinned: true });
          setSaving(false);
          router.replace(`/board/${id}`);
        }}
      />
    </section>
  );
}
