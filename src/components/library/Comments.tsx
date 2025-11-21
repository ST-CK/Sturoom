"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Comments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .then(({ data }) => {
        setComments(data || []);
      });
  }, [postId]);

  async function handleAdd() {
    if (!text) return;
    await supabase.from("comments").insert({ post_id: postId, content: text });
    setText("");
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId);
    setComments(data || []);
  }

  return (
    <div className="mt-4 text-xs md:text-sm">
      <h4 className="text-xs md:text-sm font-semibold">댓글</h4>

      <ul className="mt-2 space-y-1.5 md:space-y-2">
        {comments.map((c) => (
          <li
            key={c.id}
            className="rounded-md border p-2 text-xs md:text-sm"
          >
            {c.content}
          </li>
        ))}
      </ul>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded border px-2 py-1 text-xs md:text-sm"
          placeholder="댓글 입력..."
        />
        <button
          onClick={handleAdd}
          className="rounded bg-gray-900 px-3 py-1.5 text-xs md:text-sm text-white"
        >
          등록
        </button>
      </div>
    </div>
  );
}