// "use client";

// import Link from "next/link";
// import type { LibraryRoom } from "@/types/library";

// export default function RoomCard({
//   id,
//   title,
//   instructor,
//   track,
//   thumbnail,
//   is_new,
// }: LibraryRoom) {
//   return (
//     <Link
//       href={`/library/${id}`}
//       className="block rounded-xl border border-gray-200 bg-white shadow hover:shadow-md"
//     >
//       {thumbnail ? (
//         <img
//           src={thumbnail}
//           alt={title}
//           className="h-32 w-full rounded-t-xl object-cover"
//         />
//       ) : (
//         <div className="h-32 w-full rounded-t-xl bg-gray-100" />
//       )}
//       <div className="p-4">
//         <h3 className="truncate text-base font-semibold">{title}</h3>
//         <p className="text-sm text-gray-600">{instructor}</p>
//         <p className="mt-1 text-xs text-gray-500">{track}</p>
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

// RoomCard 전용 Props 정의
interface RoomCardProps {
  id: string;
  title: string;
  instructor?: string | null;
  track?: string | null;
  thumbnail?: string | null;
  is_new?: boolean;
}

export default function RoomCard({
  id,
  title,
  instructor,
  track,
  thumbnail,
  is_new,
}: RoomCardProps) {
  return (
    <Link
      href={`/library/${id}`}
      className="block rounded-xl border border-gray-200 bg-white shadow hover:shadow-md"
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={title ?? "수업"}
          className="h-32 w-full rounded-t-xl object-cover"
        />
      ) : (
        <div className="h-32 w-full rounded-t-xl bg-gray-100" />
      )}
      <div className="p-4">
        <h3 className="truncate text-base font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{instructor ?? "미정"}</p>
        <p className="mt-1 text-xs text-gray-500">{track ?? "교과(오프라인)"}</p>
        {is_new && (
          <span className="mt-2 inline-block rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
            NEW
          </span>
        )}
      </div>
    </Link>
  );
}
