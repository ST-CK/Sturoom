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

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // ✅ 1️⃣ 사용자 역할 조회
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const userRole = profile?.role ?? "student";
      setRole(userRole);

      // ✅ 2️⃣ 교사/관리자 → 전체 수업
      if (userRole === "admin" || userRole === "teacher") {
        const { data: allRooms, error } = await supabase
          .from("library_rooms")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && allRooms) setRooms(allRooms as LibraryRoom[]);
        setLoading(false);
        return;
      }

      // ✅ 3️⃣ 학생 → 초대받은 수업만
      const { data: memberships, error: memberError } = await supabase
        .from("library_room_members")
        .select("room_id")
        .eq("user_id", user.id);

      if (memberError || !memberships || memberships.length === 0) {
        setRooms([]); // 초대받은 수업 없음
        setLoading(false);
        return;
      }

      const roomIds = memberships.map((m) => m.room_id);

      const { data: allowedRooms, error: roomError } = await supabase
        .from("library_rooms")
        .select("*")
        .in("id", roomIds)
        .order("created_at", { ascending: false });

      if (!roomError && allowedRooms) setRooms(allowedRooms as LibraryRoom[]);
      setLoading(false);
    }

    fetchData();
  }, []);

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
      {/* 헤더 */}
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

      {/* 본문 */}
      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-10 text-gray-500">
          <p className="text-lg font-medium">
            {role === "student"
              ? "아직 초대받은 수업이 없습니다."
              : "등록된 수업이 없습니다."}
          </p>
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
            />
          ))}
        </div>
      )}

      {/* 모달 */}
      {showAddModal && (
        <AddRoomModal
          onClose={() => setShowAddModal(false)}
          onAdded={(newRoom) => setRooms([newRoom, ...rooms])}
        />
      )}

      {editRoom && (
        <EditRoomModal
          room={editRoom}
          onClose={() => setEditRoom(null)}
          onUpdated={(updated) =>
            setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
          }
        />
      )}
    </div>
  );
}
