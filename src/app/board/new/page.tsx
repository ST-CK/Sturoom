"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BoardForm from "@/components/board/BoardForm";
import { boardRepo } from "@/services/board";
import useAuth from "@/hooks/useAuth";

export default function NewPostPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [saving, setSaving] = useState(false);

  const meEmail = user?.email ?? "";
  const meName  = profile?.full_name ?? "사용자";

  return (
    <section
      className="
        w-full mx-auto 
        max-w-4xl 
        px-4 sm:px-6 
        pt-10 sm:pt-12 
        pb-5
      "
    >
      <h1 className="mb-6 text-2xl sm:text-3xl font-bold">새 글 작성</h1>

      <BoardForm
        authorEmail={meEmail}
        authorName={meName}
        saving={saving}
        onSave={async ({ title, content, files, isPinned, isAnonymous }) => {
          try {
            setSaving(true);
            const id = await boardRepo.create({
              title,
              content,
              authorEmail: meEmail,
              authorName: meName,
              isAnonymous,
              attachments: files,
            });
            if (isPinned) await boardRepo.update(id, { isPinned });
            router.replace(`/board/${id}`);
          } finally {
            setSaving(false);
          }
        }}
      />
    </section>
  );
}