"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { LibraryPost } from "@/types/library";
import WeekSidebar from "./WeekSidebar";
import ContentCard from "./ContentCard";
import PostModal from "./PostModal";
import AddPostModal from "./AddPostModal";
import EditPostModal from "./EditPostModal";
import MembersSection from "./MembersSection";

export default function ClientRoom({
  roomId,
  initialWeeks,
  initialPosts,
}: {
  roomId: string;
  initialWeeks: number[];
  initialPosts: LibraryPost[];
}) {
  const [activeWeek, setActiveWeek] = useState<number | null>(null);
  const [open, setOpen] = useState<LibraryPost | null>(null);
  const [editPost, setEditPost] = useState<LibraryPost | null>(null);
  const [posts, setPosts] = useState<LibraryPost[]>(initialPosts);
  const [role, setRole] = useState<string>("student");
  const [showAddModal, setShowAddModal] = useState(false);

  // ✅ 유저 role 가져오기
  useEffect(() => {
    async function fetchRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(profile?.role ?? "student");
    }
    fetchRole();
  }, []);

  // ✅ 주차별 필터링
  const filteredPosts = useMemo(
    () => (activeWeek === null ? posts : posts.filter((p) => p.week === activeWeek)),
    [activeWeek, posts]
  );

  // ✅ 게시물 삭제 (관리자/교사만)
  async function handleDelete(id: string) {
    if (role !== "admin" && role !== "teacher") {
      alert("삭제 권한이 없습니다.");
      return;
    }

    const { error } = await supabase.from("library_posts").delete().eq("id", id);
    if (!error) {
      setPosts(posts.filter((p) => p.id !== id));
    }
  }

  return (
    <div className="flex gap-6">
      {/* 사이드바 (주차별 보기) */}
      <WeekSidebar
        weeks={initialWeeks}
        activeWeek={activeWeek}
        onSelect={setActiveWeek}
      />

      <div className="flex-1">
        {/* 상단 헤더 */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-600">
            {activeWeek === null ? "전체 콘텐츠" : `${activeWeek}주차`}
          </h2>

          {/* ✅ 관리자/교사만 자료 추가 버튼 */}
          {(role === "admin" || role === "teacher") && (
            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700"
            >
              + 자료 추가
            </button>
          )}
        </div>

        {/* 게시물 목록 */}
        {filteredPosts.length === 0 ? (
          <div className="text-gray-500">
            {activeWeek === null
              ? "등록된 자료가 없습니다. 자료를 추가해 보세요."
              : `${activeWeek}주차 자료가 없습니다.`}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((p) => (
              <ContentCard
                key={p.id}
                post={p}
                onOpen={setOpen}
                onEdit={setEditPost}
                onDelete={handleDelete}
                role={role} // ✅ 역할 전달
              />
            ))}
          </div>
        )}

        {/* 모달들 */}
        {open && <PostModal post={open} onClose={() => setOpen(null)} />}
        {showAddModal && (
          <AddPostModal
            roomId={roomId}
            onClose={() => setShowAddModal(false)}
            onAdded={(newPost) => setPosts([newPost, ...posts])}
          />
        )}
        {editPost && (
          <EditPostModal
            post={editPost}
            onClose={() => setEditPost(null)}
            onUpdated={(updated) => {
              setPosts(posts.map((p) => (p.id === updated.id ? updated : p)));
            }}
          />
        )}

        {/* ✅ 멤버 목록 섹션 (항상 하단에 표시) */}
        <div className="mt-8 border-t pt-4">
          <MembersSection roomId={roomId} />
        </div>
      </div>
    </div>
  );
}
