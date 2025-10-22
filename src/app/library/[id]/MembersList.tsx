"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Member = {
  id: string;
  email: string;
  role: string;
};

export default function MembersList({ roomId }: { roomId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      // 1️⃣ room_members 테이블 조회
      const { data: membersData, error: membersError } = await supabase
        .from("library_room_members")
        .select("user_id, role")
        .eq("room_id", roomId);

      if (membersError) {
        console.error("멤버 조회 오류:", membersError);
        setMembers([]);
        setLoading(false);
        return;
      }

      // 2️⃣ 각 user_id로 profiles에서 이메일 가져오기
      const userIds = membersData.map((m) => m.user_id);
      if (userIds.length === 0) {
        setMembers([]);
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      const merged = membersData.map((m) => ({
        id: m.user_id,
        email: profiles?.find((p) => p.id === m.user_id)?.email ?? "unknown",
        role: m.role,
      }));

      setMembers(merged);
      setLoading(false);
    }

    fetchMembers();
  }, [roomId]);

  if (loading) return <p className="text-gray-500">멤버 목록 불러오는 중...</p>;
  if (members.length === 0) return <p className="text-gray-400">등록된 멤버가 없습니다.</p>;

  return (
    <div className="mt-4 border-t pt-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">📋 강의실 멤버 목록</h3>
      <ul className="space-y-1 text-sm">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex justify-between rounded-md border px-3 py-1.5 text-gray-700"
          >
            <span>{m.email}</span>
            <span className="text-gray-500 text-xs">{m.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
