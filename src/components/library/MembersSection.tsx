"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AddMemberModal from "./AddMemberModal";

type Member = {
  id: string;
  email: string;
  role: string;
  full_name?: string;
};

export default function MembersSection({ roomId }: { roomId: string }) {
  const [role, setRole] = useState<string>("student");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // ✅ 현재 로그인한 사용자의 역할 확인
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      setRole(profile?.role ?? "student");
    })();
  }, []);

  // ✅ 멤버 조회 함수
  const fetchMembers = async () => {
    setLoading(true);

    const { data: memberRows, error: memberError } = await supabase
      .from("library_room_members")
      .select("user_id, role")
      .eq("room_id", roomId);

    if (memberError) {
      console.error("멤버 조회 오류:", memberError.message);
      setLoading(false);
      return;
    }

    if (!memberRows?.length) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const userIds = memberRows.map((m) => m.user_id);

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", userIds);

    if (profileError) {
      console.error("프로필 조회 오류:", profileError.message);
      setMembers([]);
      setLoading(false);
      return;
    }

    const merged = memberRows.map((m) => {
      const p = profiles?.find((p) => p.id === m.user_id);
      return {
        id: m.user_id,
        email: p?.email ?? "-",
        full_name: p?.full_name ?? "(이름 없음)",
        role: m.role,
      };
    });

    setMembers(merged);
    setLoading(false);
  };

  // ✅ 처음 렌더링 시 멤버 불러오기
  useEffect(() => {
    fetchMembers();
  }, [roomId]);

  // ✅ 실시간 반영 (추가, 삭제 모두)
  useEffect(() => {
    const channel = supabase
      .channel(`room-members-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // insert / update / delete 모두 감지
          schema: "public",
          table: "library_room_members",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log("📡 실시간 업데이트 감지:", payload);
          fetchMembers(); // 변경 시 자동 새로고침
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // ✅ 멤버 삭제
  const handleRemove = async (memberId: string) => {
    if (!confirm("정말 이 멤버를 강의실에서 제거하시겠습니까?")) return;

    console.log("🗑️ 삭제 시도:", { roomId, memberId });

    // 삭제 전 존재 여부 확인
    const { data: checkData, error: checkError } = await supabase
      .from("library_room_members")
      .select("user_id, room_id")
      .eq("room_id", String(roomId))
      .eq("user_id", String(memberId));

    if (checkError) {
      console.error("❌ 삭제 전 확인 오류:", checkError.message);
      alert("삭제 전 확인 중 오류가 발생했습니다.");
      return;
    }

    if (!checkData || checkData.length === 0) {
      alert("삭제할 멤버를 찾을 수 없습니다.");
      console.warn("⚠️ 삭제 실패: 조건 불일치", { roomId, memberId });
      return;
    }

    // 실제 삭제 실행
    const { error: deleteError } = await supabase
      .from("library_room_members")
      .delete()
      .eq("room_id", String(roomId))
      .eq("user_id", String(memberId));

    if (deleteError) {
      console.error("❌ 삭제 오류:", deleteError.message);
      alert("삭제 중 오류가 발생했습니다. (RLS 정책 또는 권한 문제일 수 있음)");
      return;
    }

    console.log("✅ 삭제 성공:", memberId);

    // 즉시 반영
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  // ✅ 초대 후 새로고침
  const handleAdded = () => {
    fetchMembers();
    setShowModal(false);
  };

  return (
    <section className="mt-12">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          👥 강의실 멤버
          <span className="text-sm text-gray-500 font-medium">
            ({members.length})
          </span>
        </h2>

        {/* {(role === "teacher" || role === "admin") && (
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm text-white font-semibold shadow-sm hover:bg-indigo-700 transition-all"
          >
            + 학생 초대
          </button>
        )} */}
      </div>

      {/* 멤버 카드 목록 */}
      {loading ? (
        <p className="text-gray-500 text-sm">불러오는 중...</p>
      ) : members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500 bg-gray-50">
          아직 등록된 멤버가 없습니다 😅
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {members.map((m) => (
            <div
              key={m.id}
              className="relative rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 text-center flex flex-col items-center"
            >
              <div className="text-lg font-semibold text-gray-800">
                {m.full_name}
              </div>
              <div className="text-sm text-gray-500 mt-1">{m.email}</div>

              <span
                className={`mt-3 px-3 py-1 text-xs font-semibold rounded-full ${
                  m.role === "admin"
                    ? "bg-emerald-100 text-emerald-700"
                    : m.role === "teacher"
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {m.role}
              </span>

              {(role === "teacher" || role === "admin") && (
                <button
                  onClick={() => handleRemove(m.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="멤버 제거"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 초대 모달 */}
      {showModal && (
        <AddMemberModal
          roomId={roomId}
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
        />
      )}
    </section>
  );
}
