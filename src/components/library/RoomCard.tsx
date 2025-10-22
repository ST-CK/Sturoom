// "use client";

// import Link from "next/link";

// // RoomCard 전용 Props 정의
// interface RoomCardProps {
//   id: string;
//   title: string;
//   instructor?: string | null;
//   track?: string | null;
//   thumbnail?: string | null;
//   is_new?: boolean;
// }

// export default function RoomCard({
//   id,
//   title,
//   instructor,
//   track,
//   thumbnail,
//   is_new,
// }: RoomCardProps) {
//   return (
//     <Link
//       href={`/library/${id}`}
//       className="block rounded-xl border border-gray-200 bg-white shadow hover:shadow-md"
//     >
//       {thumbnail ? (
//         <img
//           src={thumbnail}
//           alt={title ?? "수업"}
//           className="h-32 w-full rounded-t-xl object-cover"
//         />
//       ) : (
//         <div className="h-32 w-full rounded-t-xl bg-gray-100" />
//       )}
//       <div className="p-4">
//         <h3 className="truncate text-base font-semibold">{title}</h3>
//         <p className="text-sm text-gray-600">{instructor ?? "미정"}</p>
//         <p className="mt-1 text-xs text-gray-500">{track ?? "교과(오프라인)"}</p>
//         {is_new && (
//           <span className="mt-2 inline-block rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
//             NEW
//           </span>
//         )}
//       </div>
//     </Link>
//   );
// }

"use client";

import Link from "next/link";
import { useState } from "react";

interface RoomCardProps {
  id: string;
  title: string;
  instructor?: string | null;
  track?: string | null;
  thumbnail?: string | null;
  is_new?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function RoomCard({
  id,
  title,
  instructor,
  track,
  thumbnail,
  is_new,
  onEdit,
  onDelete,
}: RoomCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative rounded-xl border bg-white shadow hover:shadow-md">
      <Link href={`/library/${id}`}>
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="h-32 w-full rounded-t-xl object-cover" />
        ) : (
          <div className="h-32 w-full rounded-t-xl bg-gray-100" />
        )}
        <div className="p-4">
          <h3 className="truncate text-base font-semibold">{title}</h3>
          <p className="text-sm text-gray-600">{instructor ?? "미정"}</p>
          <p className="mt-1 text-xs text-gray-500">{track ?? "교과(오프라인)"}</p>
        </div>
      </Link>

      <button
        className="absolute top-2 right-2 rounded-full p-1 text-gray-500 hover:bg-gray-100"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ⋮
      </button>

      {menuOpen && (
        <div className="absolute right-2 top-8 w-28 rounded-lg border bg-white py-1 shadow-lg z-20">
          <button
            onClick={() => {
              setMenuOpen(false);
              onEdit?.(id);
            }}
            className="block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50"
          >
            ✏️ 수정
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              onDelete?.(id);
            }}
            className="block w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
          >
            🗑️ 삭제
          </button>
        </div>
      )}
    </div>
  );
}
