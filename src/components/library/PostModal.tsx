"use client";

import type { LibraryPost } from "@/types/library";
import Comments from "./Comments";

export default function PostModal({
  post,
  onClose,
}: {
  post: LibraryPost;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 sm:px-4">
      <div className="w-full max-w-lg sm:max-w-2xl rounded-2xl bg-white shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-800">
            {post.title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 sm:p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto text-xs sm:text-sm">
          {/* 본문 */}
          <div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.body}
            </p>
          </div>

          {/* 첨부파일 */}
          {post.attachments?.length ? (
            <div>
              <h3 className="mb-2 text-xs sm:text-sm font-semibold text-gray-700">
                첨부파일
              </h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {post.attachments.map((a) => (
                  <li key={a.id}>
                    <a
                      href={a.url ?? "#"}
                      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs sm:text-sm text-indigo-600 hover:bg-indigo-50 hover:underline transition"
                      target="_blank"
                      rel="noreferrer"
                      download
                    >
                      📎 <span>{a.name}</span>
                      <span className="ml-auto text-[10px] sm:text-xs text-gray-400">
                        {a.size} bytes
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* 댓글 */}
          <div>
            <h3 className="mb-2 text-xs sm:text-sm font-semibold text-gray-700">
              댓글
            </h3>
            <Comments postId={post.id} />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-4 sm:px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}