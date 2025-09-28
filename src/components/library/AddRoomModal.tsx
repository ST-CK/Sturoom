// "use client";

// import { useState } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import type { LibraryRoom } from "@/types/library";

// export default function AddRoomModal({
//   onClose,
//   onAdded,
// }: {
//   onClose: () => void;
//   onAdded: (room: LibraryRoom) => void;
// }) {
//   const [title, setTitle] = useState("");
//   const [instructor, setInstructor] = useState("");
//   const [track, setTrack] = useState("교과(오프라인)");
//   const [thumbnail, setThumbnail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState<string | null>(null);

//   const handleSubmit = async () => {
//     setErr(null);
//     if (!title.trim()) return setErr("수업명을 입력하세요.");

//     setLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from("library_rooms")
//         .insert([{ title, instructor, track, thumbnail }])
//         .select("*")
//         .single();

//       if (error) throw error;
//       if (data) onAdded(data as LibraryRoom);
//       onClose();
//     } catch (e: any) {
//       setErr(e.message ?? "수업 생성 오류");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//       <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
//         <h2 className="mb-4 text-lg font-bold">새 수업 추가</h2>

//         <div className="space-y-3">
//           <input
//             placeholder="수업명"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             className="w-full rounded border px-3 py-2"
//           />
//           <input
//             placeholder="담당 교사/교수"
//             value={instructor}
//             onChange={(e) => setInstructor(e.target.value)}
//             className="w-full rounded border px-3 py-2"
//           />
//           <input
//             placeholder="트랙 (예: 교과, 비교과)"
//             value={track}
//             onChange={(e) => setTrack(e.target.value)}
//             className="w-full rounded border px-3 py-2"
//           />
//           <input
//             placeholder="썸네일 URL (선택)"
//             value={thumbnail}
//             onChange={(e) => setThumbnail(e.target.value)}
//             className="w-full rounded border px-3 py-2"
//           />
//           {err && <p className="text-sm text-red-600">{err}</p>}
//         </div>

//         <div className="mt-6 flex justify-end gap-2">
//           <button
//             onClick={onClose}
//             className="rounded bg-gray-100 px-4 py-2 text-sm"
//           >
//             취소
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={loading}
//             className="rounded bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
//           >
//             {loading ? "저장 중..." : "저장"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { LibraryRoom } from "@/types/library";

export default function AddRoomModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: (room: LibraryRoom) => void;
}) {
  const [title, setTitle] = useState("");
  const [instructor, setInstructor] = useState("");
  const [track, setTrack] = useState("교과(오프라인)");
  const [thumbnail, setThumbnail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErr(null);
    if (!title.trim()) return setErr("수업명을 입력하세요.");
    if (!instructor.trim()) return setErr("담당 교사를 입력하세요.");

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("library_rooms")
        .insert([{ title, instructor, track, thumbnail }])
        .select("*")
        .single();

      if (error) throw error;
      if (data) onAdded(data as LibraryRoom);
      onClose();
    } catch (e: any) {
      console.error(e);
      setErr(e.message ?? "수업 생성 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-bold text-gray-800">새 수업 추가</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              수업명 <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="예: 데이터베이스 기초"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              담당 교사/교수 <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="예: 홍길동 교수"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              트랙
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              썸네일 URL (선택)
            </label>
            <input
              placeholder="https://example.com/thumbnail.jpg"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
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
            onClick={handleSubmit}
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
