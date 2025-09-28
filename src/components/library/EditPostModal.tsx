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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold">자료 수정</h2>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
          <input
            type="number"
            min={1}
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded bg-gray-100 px-4 py-2 text-sm">
            취소
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="rounded bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {loading ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
