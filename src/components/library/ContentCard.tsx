// "use client";

// import { useState } from "react";
// import type { LibraryPost } from "@/types/library";

// export default function ContentCard({
//   post,
//   onOpen,
//   onEdit,
//   onDelete,
// }: {
//   post: LibraryPost;
//   onOpen: (p: LibraryPost) => void;
//   onEdit: (p: LibraryPost) => void;
//   onDelete: (id: string) => void;
// }) {
//   const [menuOpen, setMenuOpen] = useState(false);

//   return (
//     <div
//       className="relative rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition transform hover:-translate-y-1 cursor-pointer"
//       onClick={() => onOpen(post)}
//     >
//       {/* 제목 */}
//       <h3 className="mb-1 text-lg font-semibold text-gray-800">{post.title}</h3>
//       <p className="line-clamp-2 text-sm text-gray-600">{post.summary ?? post.body}</p>

//       {/* Footer */}
//       <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
//         <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-600">
//           {post.week}주차
//         </span>
//         <span>{post.created_at?.slice(0, 10)}</span>
//       </div>

//       {/* 메뉴 버튼 */}
//       <div
//         className="absolute top-2 right-2"
//         onClick={(e) => {
//           e.stopPropagation();
//           setMenuOpen(!menuOpen);
//         }}
//       >
//         <button className="rounded-full p-1 hover:bg-gray-100">⋮</button>
//         {menuOpen && (
//           <div className="absolute right-0 mt-1 w-24 rounded-md bg-white shadow-lg border z-10">
//             <button
//               onClick={() => {
//                 setMenuOpen(false);
//                 onEdit(post);
//               }}
//               className="block w-full px-3 py-1 text-left text-sm hover:bg-gray-50"
//             >
//               수정
//             </button>
//             <button
//               onClick={() => {
//                 setMenuOpen(false);
//                 onDelete(post.id);
//               }}
//               className="block w-full px-3 py-1 text-left text-sm text-red-600 hover:bg-red-50"
//             >
//               삭제
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import type { LibraryPost } from "@/types/library";

export default function ContentCard({
  post,
  onOpen,
  onEdit,
  onDelete,
}: {
  post: LibraryPost;
  onOpen: (p: LibraryPost) => void;
  onEdit: (p: LibraryPost) => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="relative rounded-xl border bg-white p-5 shadow hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer"
      onClick={() => onOpen(post)}
    >
      {/* 제목 */}
      <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-1">
        {post.title}
      </h3>

      {/* 요약 */}
      <p className="mb-3 text-sm text-gray-600 line-clamp-2">
        {post.summary ?? post.body}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-600">
          {post.week}주차
        </span>
        <span className="text-gray-400">{post.created_at?.slice(0, 10)}</span>
      </div>

      {/* 메뉴 버튼 */}
      <div
        className="absolute top-3 right-3"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
      >
        <button className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition">
          ⋮
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-28 rounded-lg border bg-white py-1 shadow-lg z-20">
            <button
              onClick={() => {
                setMenuOpen(false);
                onEdit(post);
              }}
              className="block w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              ✏️ 수정
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onDelete(post.id);
              }}
              className="block w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
            >
              🗑️ 삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
