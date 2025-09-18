import { rooms, listWeeks, listPosts } from "../_data";
import ClientRoom from "../../../components/library/ClientRoom";

export default function LibraryRoomPage({ params }: { params: { id: string } }) {
  const room = rooms.find((r) => r.id === params.id) ?? rooms[0];
  const weeks = listWeeks(room.id);
  const posts = listPosts(room.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* 헤더 */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-lg font-bold tracking-tight">{room.title}</div>
          <div className="text-xs text-gray-500">
            {room.id} · {room.instructor}
          </div>
        </div>
        <div className="rounded-xl bg-white/70 px-3 py-1 text-xs text-gray-600 ring-1 ring-gray-200">
          내 활동
        </div>
      </div>

      {/* 본문 (클라이언트 컴포넌트) */}
      <ClientRoom initialWeeks={weeks} initialPosts={posts} />
    </div>
  );
}
