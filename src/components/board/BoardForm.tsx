"use client";

import { useMemo, useState } from "react";

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

  const nowText = useMemo(() => new Date().toLocaleString(), []);

  return (
    <div className="space-y-6">
      {/* 작성자 + 액션 */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-gray-500">
          <span className="mr-3">{authorName} ({authorEmail})</span>
          <span>{nowText}</span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
            />
            상단 고정
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            익명
          </label>
          <button
            type="button"
            onClick={() => history.back()}
            className="rounded-md border px-4 py-2 text-sm"
          >
            취소
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onSave({ title, content, files, isPinned, isAnonymous });
            }}
            disabled={saving || !title.trim() || !content.trim()}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-40"
          >
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>

      {/* 제목 */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력하세요"
        className="w-full border-b py-3 text-xl font-semibold outline-none"
      />

      {/* 내용 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        placeholder="내용을 작성하세요"
        className="w-full rounded-md border p-3 text-sm"
      />
      <div className="text-right text-xs text-gray-400">{content.length}자</div>

      {/* 파일 첨부 */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">파일 첨부</div>
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="block w-full cursor-pointer text-sm
            file:mr-3 file:rounded-md file:border-0
            file:bg-indigo-600 file:text-white file:px-4 file:py-2
            hover:file:bg-indigo-700"
        />
        {files.length > 0 && (
          <ul className="flex flex-wrap gap-2 text-sm text-gray-600">
            {files.map((f) => (
              <li key={f.name} className="rounded-full bg-gray-100 px-3 py-1">
                {f.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
