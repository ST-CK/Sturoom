// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { boardRepo } from "@/services/board";
// import type { Post } from "@/types/board";
// import BoardList from "@/components/board/BoardList";

// /* ---------- Pagination ---------- */
// type PaginationProps = { 
//   page: number; setPage: (p: number) => void; total: number; pageSize?: number; windowSize?: number;
// };
// function Pagination({ page, setPage, total, pageSize = 10, windowSize = 5 }: PaginationProps) {
//   const totalPages = Math.max(1, Math.ceil(total / pageSize));
//   if (totalPages <= 1) return null;
//   const windowStart = Math.floor((page - 1) / windowSize) * windowSize + 1;
//   const windowEnd = Math.min(windowStart + windowSize - 1, totalPages);
//   return (
//     <nav className="flex items-center justify-center gap-1 py-6 text-sm">
//       {page > 1 && (<>
//         <button onClick={() => setPage(1)} className="rounded-md px-3 py-2 hover:bg-gray-100">&laquo;</button>
//         <button onClick={() => setPage(page - 1)} className="rounded-md px-3 py-2 hover:bg-gray-100">&lsaquo;</button>
//       </>)}
//       {Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i).map((n) => (
//         <button key={n} onClick={() => setPage(n)}
//           className={`min-w-9 rounded-md px-3 py-2 ${n === page ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}>
//           {n}
//         </button>
//       ))}
//       {page < totalPages && (<>
//         <button onClick={() => setPage(page + 1)} className="rounded-md px-3 py-2 hover:bg-gray-100">&rsaquo;</button>
//         <button onClick={() => setPage(totalPages)} className="rounded-md px-3 py-2 hover:bg-gray-100">&raquo;</button>
//       </>)}
//     </nav>
//   );
// }
// /* -------------------------------- */

// export default function BoardListPage() {
//   const [items, setItems] = useState<Post[]>([]);
//   const [total, setTotal] = useState(0);
//   const [q, setQ] = useState("");
//   const [field, setField] = useState<"title" | "content" | "title_content">("title_content");
//   const [page, setPage] = useState(1);
//   const me = "demo@sturoom.dev";

//   useEffect(() => {
//     let alive = true;
//     boardRepo.list({ q, field, page, pageSize: 10, me })
//       .then(({ items, total }) => { if (alive) { setItems(items); setTotal(total); } })
//       .catch(() => { if (alive) { setItems([]); setTotal(0); } });
//     return () => { alive = false; };
//   }, [q, field, page]);

//   return (
//     <section className="mx-auto w-full max-w-5xl space-y-6 px-4 pb-0 pt-10">
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-bold tracking-tight sm:text-2xl">게시판</h1>
//         <Link href="/board/new" className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 sm:px-4">
//           새 글
//         </Link>
//       </div>

//       <div className="flex flex-col gap-2 sm:flex-row">
//         <select value={field} onChange={(e) => { setField(e.target.value as any); setPage(1); }}
//                 className="w-32 rounded-md border bg-white px-3 py-2 text-sm">
//           <option value="title_content">제목+내용</option>
//           <option value="title">제목</option>
//           <option value="content">내용</option>
//         </select>
//         <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="검색어"
//                className="w-full rounded-md border bg-white px-3 py-2 text-sm" />
//       </div>

//       <BoardList items={items} />
//       <Pagination page={page} setPage={setPage} total={total} pageSize={10} windowSize={5} />
//     </section>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { boardRepo } from "@/services/board";
import type { Post } from "@/types/board";
import BoardList from "@/components/board/BoardList";

type PaginationProps = {
  page: number;
  setPage: (p: number) => void;
  total: number;
  pageSize?: number;
  windowSize?: number;
};

function Pagination({ page, setPage, total, pageSize = 10, windowSize = 5 }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const windowStart = Math.floor((page - 1) / windowSize) * windowSize + 1;
  const windowEnd = Math.min(windowStart + windowSize - 1, totalPages);

  return (
    <div className="flex justify-center items-center gap-2 pt-10">
      {page > 1 && (
        <>
          <button onClick={() => setPage(1)} className="px-3 py-2 text-gray-600 hover:text-indigo-600">&laquo;</button>
          <button onClick={() => setPage(page - 1)} className="px-3 py-2 text-gray-600 hover:text-indigo-600">&lsaquo;</button>
        </>
      )}
      {Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i).map((n) => (
        <button
          key={n}
          onClick={() => setPage(n)}
          className={`px-4 py-2 rounded-lg transition ${
            n === page
              ? "bg-indigo-600 text-white shadow-md"
              : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
          }`}
        >
          {n}
        </button>
      ))}
      {page < totalPages && (
        <>
          <button onClick={() => setPage(page + 1)} className="px-3 py-2 text-gray-600 hover:text-indigo-600">&rsaquo;</button>
          <button onClick={() => setPage(totalPages)} className="px-3 py-2 text-gray-600 hover:text-indigo-600">&raquo;</button>
        </>
      )}
    </div>
  );
}

export default function BoardListPage() {
  const [items, setItems] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [field, setField] = useState<"title" | "content" | "title_content">("title_content");
  const [page, setPage] = useState(1);
  const me = "demo@sturoom.dev";

  useEffect(() => {
    let alive = true;
    boardRepo
      .list({ q, field, page, pageSize: 10, me })
      .then(({ items, total }) => {
        if (alive) {
          setItems(items);
          setTotal(total);
        }
      })
      .catch(() => {
        if (alive) {
          setItems([]);
          setTotal(0);
        }
      });
    return () => {
      alive = false;
    };
  }, [q, field, page]);

  return (
    <main className="min-h-screen w-full bg-gray-50 py-16 px-6">
      <section className="mx-auto w-full max-w-6xl space-y-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">📋 게시판</h1>
          <Link
            href="/board/new"
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            새 글 작성
          </Link>
        </div>

        {/* 검색 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={field}
            onChange={(e) => {
              setField(e.target.value as any);
              setPage(1);
            }}
            className="w-40 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="title_content">제목+내용</option>
            <option value="title">제목</option>
            <option value="content">내용</option>
          </select>
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="검색어를 입력하세요"
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <BoardList items={items} />
        <Pagination page={page} setPage={setPage} total={total} />
      </section>
    </main>
  );
}
