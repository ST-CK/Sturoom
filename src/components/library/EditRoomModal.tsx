"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { LibraryRoom } from "@/types/library";

export default function EditRoomModal({
  room,
  onClose,
  onUpdated,
}: {
  room: LibraryRoom;
  onClose: () => void;
  onUpdated: (room: LibraryRoom) => void;
}) {
  const [title, setTitle] = useState(room.title);
  const [instructor, setInstructor] = useState(room.instructor ?? "");
  const [track, setTrack] = useState(room.track ?? "교과(오프라인)");
  const [thumbnail, setThumbnail] = useState(room.thumbnail ?? "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ✅ 수정 처리
  const handleUpdate = async () => {
    setLoading(true);
    setErr(null);

    try {
      console.log("수정 요청 ID:", room.id);

      // 🔹 1차 업데이트
      const { error: updateError } = await supabase
        .from("library_rooms")
        .update({
          title,
          instructor,
          track,
          thumbnail,
        })
        .eq("id", room.id);

      if (updateError) throw updateError;

      // 🔹 2차 재조회 (업데이트된 데이터 확인)
      const { data: updated, error: fetchError } = await supabase
        .from("library_rooms")
        .select("*")
        .eq("id", room.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!updated) throw new Error("수정한 데이터를 다시 불러올 수 없습니다.");

      onUpdated(updated as LibraryRoom);
      onClose();
    } catch (e: any) {
      console.error("수업 수정 오류:", e);
      setErr(e.message ?? "수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-bold text-gray-800">수업 수정</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">수업명</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              placeholder="예: 데이터베이스 기초"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">담당 교사/교수</label>
            <input
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              placeholder="예: 홍길동 교수"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">트랙</label>
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
            >
              <option value="교과(오프라인)">교과(오프라인)</option>
              <option value="교과(온라인)">교과(온라인)</option>
              <option value="비교과">비교과</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">썸네일 URL</label>
            <input
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>

          {err && (
            <p className="text-sm text-red-600 font-medium">{err}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            취소
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
