"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RoomCard from "@/components/library/RoomCard";
import AddRoomModal from "@/components/library/AddRoomModal";
import type { LibraryRoom } from "@/types/library";

export default function LibraryListPage() {
  const [rooms, setRooms] = useState<LibraryRoom[]>([]);
  const [role, setRole] = useState<string>("student");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(profile?.role ?? "student");

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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="px-1 text-2xl font-bold text-gray-800">내 강의자료실</h1>
        {(role === "admin" || role === "teacher") && (
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 transition"
          >
            + 수업 추가
          </button>
        )}
      </div>

      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-10 text-gray-500">
          <p className="text-lg font-medium">아직 등록된 수업이 없습니다.</p>
          {(role === "admin" || role === "teacher") && (
            <button
              onClick={() => setShowModal(true)}
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
              track={r.track ?? "교과(오프라인)"}
              thumbnail={r.thumbnail ?? null}
              is_new={!!r.is_new}
            />
          ))}
        </div>
      )}

      {showModal && (
        <AddRoomModal
          onClose={() => setShowModal(false)}
          onAdded={(newRoom) => setRooms([newRoom, ...rooms])}
        />
      )}
    </div>
  );
}
