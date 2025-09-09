"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { boardRepo } from "@/services/board";
import type { Post, Comment, Attachment } from "@/types/board";
import BoardDetail from "@/components/board/BoardDetail";

export default function DetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const me = "demo@sturoom.dev";

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const reload = async () => {
    const pid = String(id);
    const p = await boardRepo.get(pid);
    setPost(p);
    setComments(await boardRepo.listComments(pid));
    setAttachments(await boardRepo.listAttachments(pid));
  };

  useEffect(() => { reload(); }, [id]);

  if (!post) return <section className="p-6">불러오는 중…</section>;

  return (
    <section className="min-h-[100svh] px-4 pb-5 pt-10">
      <BoardDetail
        post={post}
        comments={comments}
        attachments={attachments}
        onLike={async () => { await boardRepo.toggleLike(post.id, me); reload(); }}
        onTogglePin={async () => { await boardRepo.update(post.id, { isPinned: !post.isPinned }); reload(); }}
        onDelete={async () => { await boardRepo.remove(post.id); router.replace("/board"); }}
        onAddComment={async (text) => { await boardRepo.addComment(post.id, me, text); reload(); }}
      />
    </section>
  );
}
