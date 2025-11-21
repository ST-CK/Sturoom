"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { boardRepo } from "@/services/board";
import type { Post, Comment, Attachment } from "@/types/board";
import BoardDetail from "@/components/board/BoardDetail";
import useAuth from "@/hooks/useAuth";

export default function DetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    try {
      const pid = String(id);
      const p = await boardRepo.get(pid);
      setPost(p);
      setComments(await boardRepo.listComments(pid));
      setAttachments(await boardRepo.listAttachments(pid));
    } catch {
      alert("게시글을 불러오지 못했습니다.");
      router.replace("/board");
    } finally {
      setLoading(false);
    }
  };

  // 초기 로딩
  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading)
    return <section className="p-4 sm:p-6 text-sm sm:text-base">불러오는 중…</section>;
  if (!post)
    return (
      <section className="p-4 sm:p-6 text-sm sm:text-base">
        존재하지 않는 게시글입니다.
      </section>
    );

  const me = user?.email ?? "demo@sturoom.dev";

  return (
    <section className="
      min-h-[100svh] 
      px-4 sm:px-6 
      pb-5 pt-8 sm:pt-10
      max-w-4xl mx-auto
    ">
      <BoardDetail
        post={post}
        comments={comments}
        attachments={attachments}
        onLike={async () => {
          await boardRepo.toggleLike(post.id, me);
          reload();
        }}
        onTogglePin={async () => {
          await boardRepo.update(post.id, { isPinned: !post.isPinned });
          reload();
        }}
        onDelete={async () => {
          await boardRepo.remove(post.id);
          router.replace("/board");
        }}
        onAddComment={async (text) => {
          await boardRepo.addComment(post.id, me, text);
          reload();
        }}
      />
    </section>
  );
}