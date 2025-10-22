"use client";

import React, { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ClientRoom from "@/components/library/ClientRoom";
import AddMemberModal from "@/components/library/AddMemberModal";
import type { LibraryPost } from "@/types/library";

export default function LibraryRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = use(params); // ✅ Next.js 경고 해결용

  const [user, setUser] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [posts, setPosts] = useState<LibraryPost[]>([]);
  const [weeks, setWeeks] = useState<number[]>([]);
  const [role, setRole] = useState<string>("student");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // ✅ 로그인된 유저 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }
      setUser(user);

      // ✅ 유저 역할 가져오기
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      setRole(profile?.role ?? "student");

      // ✅ 초대 여부 확인
      const { data: membership } = await supabase
        .from("library_room_members")
        .select("id")
        .eq("room_id", roomId)
        .eq("user_id", user.id)
        .maybeSingle();

      const isPrivileged = ["admin", "teacher"].includes(profile?.role ?? "");
      if (!membership && !isPrivileged) {
        setError("초대받은 사용자만 이 강의실에 접근할 수 있습니다.");
        setLoading(false);
        return;
      }

      // ✅ 강의 정보
      const { data: room } = await supabase
        .from("library_rooms")
        .select("*")
        .eq("id", roomId)
        .maybeSingle();

      if (!room) {
        setError("강의 정보를 찾을 수 없습니다.");
        setLoading(false);
        return;
      }

      setRoom(room);

      // ✅ 주차 정보
      const { data: weeksData } = await supabase
        .from("library_posts")
        .select("week")
        .eq("room_id", roomId);

      const uniqueWeeks = Array.from(new Set((weeksData ?? []).map((w) => w.week))).sort();
      setWeeks(uniqueWeeks);

      // ✅ 게시물 목록
      const { data: postsData } = await supabase
        .from("library_posts")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: false });

      setPosts(postsData ?? []);
      setLoading(false);
    }

    fetchData();
  }, [roomId]);

  if (loading) return <div className="p-6 text-gray-500">불러오는 중...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!room) return <div className="p-6">강의 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="p-6">
      {/* 상단 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">{room.title}</h1>

        {(role === "admin" || role === "teacher") && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 transition"
          >
            + 학생 초대
          </button>
        )}
      </div>

      {/* ✅ ClientRoom 내부에 MembersSection 이미 포함됨 */}
      <ClientRoom roomId={roomId} initialWeeks={weeks} initialPosts={posts} />

      {/* ❌ MembersList 제거 (중복 렌더링 방지) */}
      {/* <MembersList roomId={roomId} /> */}

      {/* 초대 모달 */}
      {showInviteModal && (
        <AddMemberModal
          roomId={roomId}
          onClose={() => setShowInviteModal(false)}
          onAdded={() => window.location.reload()}
        />
      )}
    </div>
  );
}
