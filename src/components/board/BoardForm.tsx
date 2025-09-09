"use client";

import { useMemo, useState } from "react";
import type { Post } from "@/types/board";

type Props = {
  initialData?: Partial<Post>;
  onSave: (data: { title: string; content: string; files: File[]; isPinned?: boolean }) => void;
  saving: boolean;
  author?: string;
};

export default function BoardForm({ initialData = {}, onSave, saving, author }: Props) {
  const [title, setTitle] = useState(initialData.title ?? "");
  const [content, setContent] = useState(initialData.content ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [isPinned, setIsPinned] = useState<boolean>(!!initialData.isPinned);

  const nowText = useMemo(() => new Date().toLocaleString(), []);

  return (
    <div className="space-y-6">
      {/* 상단 메타/액션 */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-gray-500">
          <span className="mr-3">{author ?? "나"}</span>
          <span>{nowText}</span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            상단 고정
          </label>
          <button
            type="button"
            onClick={() => history.back()}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onSave({ title, content, files, isPinned });
            }}
            disabled={saving || !title.trim() || !content.trim()}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>

      {/* 제목 */}
      <div className="space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="w-full border-0 border-b border-gray-200 bg-transparent px-0 py-3 text-xl font-semibold outline-none placeholder:text-gray-400 focus:border-gray-400"
        />
      </div>

      {/* 내용 */}
      <div className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          placeholder="내용을 작성하세요"
          className="min-h-48 md:min-h-60 w-full resize-y rounded-md border border-gray-200 px-3 py-3 text-sm outline-none focus:border-gray-400"
        />
        <div className="text-right text-xs text-gray-400">{content.length}자</div>
      </div>

      {/* 첨부 */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">파일 첨부</div>
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="block w-full cursor-pointer text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-white hover:file:opacity-90"
        />
        {files.length > 0 && (
          <ul className="flex flex-wrap gap-2 text-sm text-gray-600">
            {files.map((f) => (
              <li key={f.name} className="rounded-full bg-gray-100 px-3 py-1">{f.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
