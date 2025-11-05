// "use client";

// import Link from "next/link";
// import type { Post } from "@/types/board";

// type Props = { items: Post[]; emptyText?: string };

// export default function BoardList({ items, emptyText = "게시물이 없습니다." }: Props) {
//   if (!items.length) {
//     return <div className="py-16 text-center text-sm text-gray-500">{emptyText}</div>;
//   }

//   return (
//     <div className="text-sm">
//       <div className="hidden md:flex items-center border-b pb-3 text-gray-500">
//         <div className="w-16">No</div>
//         <div className="flex-1">제목</div>
//         <div className="w-40">글쓴이</div>
//         <div className="w-44 text-right">작성시간</div>
//       </div>
//       <ul className="divide-y">
//         {items.map((p, idx) => (
//           <li key={p.id} className="py-4 hover:bg-gray-50/60">
//             <div className="hidden md:flex items-center">
//               <div className="w-16 text-gray-500">{idx + 1}</div>
//               <div className="flex-1">
//                 <Link href={`/board/${p.id}`} className="font-medium text-gray-900 hover:underline">
//                   {p.isPinned && "📌 "}{p.title}
//                 </Link>
//                 <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{p.content}</p>
//               </div>
//               <div className="w-40">{p.author}</div>
//               <div className="w-44 text-right">{new Date(p.createdAt).toLocaleString()}</div>
//             </div>

//             <div className="md:hidden">
//               <Link href={`/board/${p.id}`} className="block">
//                 <div>{p.isPinned && "📌 "}{p.title}</div>
//                 <p className="text-xs line-clamp-2">{p.content}</p>
//                 <div className="flex justify-between text-xs mt-1">
//                   <span>{p.author}</span>
//                   <span>{new Date(p.createdAt).toLocaleString()}</span>
//                 </div>
//               </Link>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
"use client";

import Link from "next/link";
import type { Post } from "@/types/board";

type Props = { items: Post[]; emptyText?: string };

export default function BoardList({ items, emptyText = "게시물이 없습니다." }: Props) {
  if (!items.length) {
    return (
      <div className="py-20 text-center text-gray-500 text-sm bg-white rounded-2xl shadow-sm">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
      {items.map((p) => (
        <Link
          key={p.id}
          href={`/board/${p.id}`}
          className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-md hover:shadow-xl hover:border-indigo-200 transition-all duration-300"
        >
          {p.isPinned && <div className="text-sm text-indigo-500 mb-1">📌 고정글</div>}
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 line-clamp-2">
            {p.title}
          </h3>
          <p className="mt-2 text-sm text-gray-600 line-clamp-3">{p.content}</p>

          <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
            <span className="font-medium">{p.author}</span>
            <span>{new Date(p.createdAt).toLocaleDateString("ko-KR")}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
