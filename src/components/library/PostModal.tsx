"use client";

import type { Post } from "../../app/library/_data";

export default function PostModal({ post, onClose }: { post: Post; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* Panel */}
      <div className="absolute left-1/2 top-1/2 w-[720px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="truncate text-base font-semibold">{post.title}</h3>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100">닫기 ✕</button>
        </div>

        {/* Scroll area */}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          {/* 본문 */}
          {post.body && (
            <div className="prose prose-sm max-w-none">
              <p>{post.body}</p>
            </div>
          )}

          {/* 이미지 (옵션) */}
          {post.images?.length ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {post.images.map((src, i) => (
                <div key={i} className="overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`image-${i}`} className="h-40 w-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}

          {/* 첨부파일 */}
          {post.attachments?.length ? (
            <div className="mt-5">
              <div className="mb-2 text-sm font-semibold">첨부파일</div>
              <ul className="divide-y rounded-xl border">
                {post.attachments.map((f) => (
                  <li key={f.id} className="flex items-center justify-between p-3 text-sm">
                    <div className="truncate">
                      <span className="font-medium">{f.name}</span>
                      {f.size && <span className="ml-2 text-gray-500">{f.size}</span>}
                    </div>
                    <a
                      href={f.url ?? "#"}
                      download
                      onClick={(e) => !f.url && e.preventDefault()}
                      className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-900 hover:text-white"
                    >
                      다운로드
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
