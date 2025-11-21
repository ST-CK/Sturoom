"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { LibraryPost } from "@/types/library";

export default function EditPostModal({
  post,
  onClose,
  onUpdated,
}: {
  post: LibraryPost;
  onClose: () => void;
  onUpdated: (p: LibraryPost) => void;
}) {
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body ?? "");
  const [week, setWeek] = useState(post.week);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("library_posts")
      .update({ title, body, week })
      .eq("id", post.id)
      .select("*")
      .single();
    setLoading(false);

    if (!error && data) {
      onUpdated(data as LibraryPost);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 md:p-6 shadow-lg">
        <h2 className="mb-3 md:mb-4 text-base md:text-lg font-bold">
          자료 수정
        </h2>

        <div className="space-y-2.5 md:space-y-3 text-xs md:text-sm">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border px-3 py-2 md:py-2.5"
            placeholder="제목"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded border px-3 py-2 md:py-2.5 min-h-[100px]"
            placeholder="본문"
          />
          <input
            type="number"
            min={1}
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
            className="w-full rounded border px-3 py-2 md:py-2.5"
            placeholder="주차"
          />
        </div>

        <div className="mt-5 md:mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded bg-gray-100 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm"
          >
            취소
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="rounded bg-indigo-600 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-white disabled:opacity-50"
          >
            {loading ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}