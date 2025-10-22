// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import RoomCard from "@/components/library/RoomCard";
// import AddRoomModal from "@/components/library/AddRoomModal";
// import type { LibraryRoom } from "@/types/library";

// export default function LibraryListPage() {
//   const [rooms, setRooms] = useState<LibraryRoom[]>([]);
//   const [role, setRole] = useState<string>("student");
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);

//   useEffect(() => {
//     async function fetchData() {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) {
//         setLoading(false);
//         return;
//       }

//       const { data: profile } = await supabase
//         .from("profiles")
//         .select("role")
//         .eq("id", user.id)
//         .single();

//       setRole(profile?.role ?? "student");

//       const { data: roomData, error } = await supabase
//         .from("library_rooms")
//         .select("*")
//         .order("created_at", { ascending: false });

//       if (!error && roomData) {
//         setRooms(roomData as LibraryRoom[]);
//       }

//       setLoading(false);
//     }
//     fetchData();
//   }, []);

//   if (loading) {
//     return (
//       <div className="mx-auto w-4/5 max-w-5xl py-8">
//         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//           {[1, 2, 3].map((i) => (
//             <div key={i} className="animate-pulse rounded-xl border bg-gray-100 h-40" />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="mx-auto w-4/5 max-w-5xl py-8">
//       <div className="mb-6 flex items-center justify-between">
//         <h1 className="px-1 text-2xl font-bold text-gray-800">내 강의자료실</h1>
//         {(role === "admin" || role === "teacher") && (
//           <button
//             onClick={() => setShowModal(true)}
//             className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 transition"
//           >
//             + 수업 추가
//           </button>
//         )}
//       </div>

//       {rooms.length === 0 ? (
//         <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-10 text-gray-500">
//           <p className="text-lg font-medium">아직 등록된 수업이 없습니다.</p>
//           {(role === "admin" || role === "teacher") && (
//             <button
//               onClick={() => setShowModal(true)}
//               className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
//             >
//               첫 수업 추가하기
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//           {rooms.map((r) => (
//             <RoomCard
//               key={r.id}
//               id={r.id}
//               title={r.title}
//               instructor={r.instructor}
//               track={r.track ?? "교과(오프라인)"}
//               thumbnail={r.thumbnail ?? null}
//               is_new={!!r.is_new}
//             />
//           ))}
//         </div>
//       )}

//       {showModal && (
//         <AddRoomModal
//           onClose={() => setShowModal(false)}
//           onAdded={(newRoom) => setRooms([newRoom, ...rooms])}
//         />
//       )}
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RoomCard from "@/components/library/RoomCard";
import AddRoomModal from "@/components/library/AddRoomModal";
import EditRoomModal from "@/components/library/EditRoomModal";
import type { LibraryRoom } from "@/types/library";

export default function LibraryListPage() {
  const [rooms, setRooms] = useState<LibraryRoom[]>([]);
  const [role, setRole] = useState<string>("student");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRoom, setEditRoom] = useState<LibraryRoom | null>(null);

  // ✅ 데이터 및 권한 로드
  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // 프로필에서 role 가져오기
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(profile?.role ?? "student");

      // 수업 목록 가져오기
      const { data: roomData, error } = await supabase
        .from("library_rooms")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && roomData) {
        setRooms(roomData as LibraryRoom[]);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  // ✅ 삭제
  const handleDeleteRoom = async (id: string) => {
    if (role !== "admin" && role !== "teacher") {
      alert("삭제 권한이 없습니다.");
      return;
    }

    if (!confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("library_rooms").delete().eq("id", id);

    if (error) {
      alert("삭제 실패: " + error.message);
    } else {
      setRooms((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // ✅ 수정 후 업데이트
  const handleUpdatedRoom = (updated: LibraryRoom) => {
    setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  // ✅ 로딩 중
  if (loading) {
    return (
      <div className="mx-auto w-4/5 max-w-5xl py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border bg-gray-100 h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-4/5 max-w-5xl py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="px-1 text-2xl font-bold text-gray-800">내 강의자료실</h1>
        {(role === "admin" || role === "teacher") && (
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 transition"
          >
            + 수업 추가
          </button>
        )}
      </div>

      {/* 강의실 목록 */}
      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-10 text-gray-500">
          <p className="text-lg font-medium">아직 등록된 수업이 없습니다.</p>
          {(role === "admin" || role === "teacher") && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
            >
              첫 수업 추가하기
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((r) => (
            <RoomCard
              key={r.id}
              id={r.id}
              title={r.title}
              instructor={r.instructor}
              track={r.track}
              thumbnail={r.thumbnail}
              is_new={!!r.is_new}
              // 교사/관리자만 수정 및 삭제 버튼 표시
              onEdit={
                role === "admin" || role === "teacher"
                  ? (id) => {
                      const room = rooms.find((rr) => rr.id === id);
                      if (room) setEditRoom(room);
                    }
                  : undefined
              }
              onDelete={
                role === "admin" || role === "teacher"
                  ? handleDeleteRoom
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* 모달 */}
      {showAddModal && (role === "admin" || role === "teacher") && (
        <AddRoomModal
          onClose={() => setShowAddModal(false)}
          onAdded={(newRoom) => setRooms([newRoom, ...rooms])}
        />
      )}

      {editRoom && (role === "admin" || role === "teacher") && (
        <EditRoomModal
          room={editRoom}
          onClose={() => setEditRoom(null)}
          onUpdated={handleUpdatedRoom}
        />
      )}
    </div>
  );
}
