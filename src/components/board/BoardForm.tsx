// "use client";

// import { useMemo, useState } from "react";

// type Props = {
//   onSave: (data: {
//     title: string;
//     content: string;
//     files: File[];
//     isPinned?: boolean;
//     isAnonymous?: boolean;
//   }) => void;
//   saving: boolean;
//   authorEmail: string;
//   authorName: string;
// };

// export default function BoardForm({ onSave, saving, authorEmail, authorName }: Props) {
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [files, setFiles] = useState<File[]>([]);
//   const [isPinned, setIsPinned] = useState(false);
//   const [isAnonymous, setIsAnonymous] = useState(false);

//   const nowText = useMemo(() => new Date().toLocaleString(), []);

//   return (
//     <div className="space-y-6">
//       {/* 작성자 + 액션 */}
//       <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//         <div className="text-sm text-gray-500">
//           <span className="mr-3">{authorName} ({authorEmail})</span>
//           <span>{nowText}</span>
//         </div>
//         <div className="flex flex-col gap-2 sm:flex-row">
//           <label className="flex items-center gap-2 text-sm text-gray-600">
//             <input
//               type="checkbox"
//               checked={isPinned}
//               onChange={(e) => setIsPinned(e.target.checked)}
//             />
//             상단 고정
//           </label>
//           <label className="flex items-center gap-2 text-sm text-gray-600">
//             <input
//               type="checkbox"
//               checked={isAnonymous}
//               onChange={(e) => setIsAnonymous(e.target.checked)}
//             />
//             익명
//           </label>
//           <button
//             type="button"
//             onClick={() => history.back()}
//             className="rounded-md border px-4 py-2 text-sm"
//           >
//             취소
//           </button>
//           <button
//             onClick={(e) => {
//               e.preventDefault();
//               onSave({ title, content, files, isPinned, isAnonymous });
//             }}
//             disabled={saving || !title.trim() || !content.trim()}
//             className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-40"
//           >
//             {saving ? "저장 중…" : "저장"}
//           </button>
//         </div>
//       </div>

//       {/* 제목 */}
//       <input
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//         placeholder="제목을 입력하세요"
//         className="w-full border-b py-3 text-xl font-semibold outline-none"
//       />

//       {/* 내용 */}
//       <textarea
//         value={content}
//         onChange={(e) => setContent(e.target.value)}
//         rows={10}
//         placeholder="내용을 작성하세요"
//         className="w-full rounded-md border p-3 text-sm"
//       />
//       <div className="text-right text-xs text-gray-400">{content.length}자</div>

//       {/* 파일 첨부 */}
//       <div className="space-y-2">
//         <div className="text-sm font-medium text-gray-700">파일 첨부</div>
//         <input
//           type="file"
//           multiple
//           onChange={(e) => setFiles(Array.from(e.target.files || []))}
//           className="block w-full cursor-pointer text-sm
//             file:mr-3 file:rounded-md file:border-0
//             file:bg-indigo-600 file:text-white file:px-4 file:py-2
//             hover:file:bg-indigo-700"
//         />
//         {files.length > 0 && (
//           <ul className="flex flex-wrap gap-2 text-sm text-gray-600">
//             {files.map((f) => (
//               <li key={f.name} className="rounded-full bg-gray-100 px-3 py-1">
//                 {f.name}
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { Paperclip, Pin, User } from "lucide-react";

type Props = {
  onSave: (data: {
    title: string;
    content: string;
    files: File[];
    isPinned?: boolean;
    isAnonymous?: boolean;
  }) => void;
  saving: boolean;
  authorEmail: string;
  authorName: string;
};

export default function BoardForm({ onSave, saving, authorEmail, authorName }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <section className="mx-auto w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 space-y-8">
        {/* 작성자 & 상단 액션 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User size={16} className="text-indigo-500" />
              <span className="font-medium">{authorName}</span>
              <span className="text-gray-400">({authorEmail})</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Pin size={14} /> 상단 고정
            </label>

            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              익명
            </label>

            <div className="flex gap-2 mt-2 sm:mt-0">
              <button
                type="button"
                onClick={() => history.back()}
                className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                취소
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onSave({ title, content, files, isPinned, isAnonymous });
                }}
                disabled={saving || !title.trim() || !content.trim()}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-40"
              >
                {saving ? "저장 중…" : "저장"}
              </button>
            </div>
          </div>
        </div>

        {/* 제목 */}
        <div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="✏️ 제목을 입력하세요"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg font-semibold placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
          />
        </div>

        {/* 내용 */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            placeholder="내용을 자유롭게 작성하세요..."
            className="w-full rounded-lg border border-gray-300 p-4 text-sm leading-relaxed focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
          />
          <div className="text-right text-xs text-gray-400 mt-1">{content.length}자</div>
        </div>

        {/* 파일 첨부 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Paperclip size={16} className="text-indigo-500" />
            파일 첨부
          </div>

          <label className="block cursor-pointer text-sm w-fit">
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="hidden"
            />
            <span className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 transition shadow-sm">
              <Paperclip size={14} />
              파일 선택
            </span>
          </label>

          {files.length > 0 && (
            <ul className="flex flex-wrap gap-2 text-sm text-gray-600">
              {files.map((f) => (
                <li
                  key={f.name}
                  className="rounded-full bg-gray-100 px-3 py-1 flex items-center gap-1"
                >
                  📄 {f.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
