"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { LibraryPost } from "@/types/library";
import { v4 as uuidv4 } from "uuid";

export default function AddPostModal({
  roomId,
  onClose,
  onAdded,
}: {
  roomId: string;
  onClose: () => void;
  onAdded: (p: LibraryPost) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [week, setWeek] = useState(1);
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) return setErr("제목을 입력하세요.");
    setLoading(true);
    try {
      let attachments: any[] = [];

      // ✅ 파일 업로드
      if (files && files.length > 0) {
        for (const file of Array.from(files)) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from("posts") // Storage 버킷 이름
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("posts")
            .getPublicUrl(fileName);

          attachments.push({
            id: uuidv4(),
            name: file.name,
            url: publicUrl,
            size: file.size.toString(),
          });
        }
      }

      // ✅ 게시물 insert (파일정보 포함)
      const { data, error } = await supabase
        .from("library_posts")
        .insert([{ title, body, room_id: roomId, week, attachments }])
        .select("*")
        .single();

      if (error) throw error;
      if (data) onAdded(data as LibraryPost);
      onClose();
    } catch (e: any) {
      console.error("Insert error:", e);
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold">자료 추가</h2>
        <div className="space-y-3">
          <input
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
          <textarea
            placeholder="본문"
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
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="w-full rounded border px-3 py-2"
          />
          {err && <p className="text-sm text-red-600">{err}</p>}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded bg-gray-100 px-4 py-2 text-sm">
            취소
          </button>
          <button
            onClick={handleSubmit}
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
