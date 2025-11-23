"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AddMemberModal({
  roomId,
  onClose,
  onAdded,
}: {
  roomId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleInvite = async () => {
    setLoading(true);
    setMessage(null);

    try {
      if (!email.trim()) throw new Error("이메일을 입력해주세요.");

      const { data: foundUser } = await supabase
        .from("profiles")
        .select("id, email")
        .ilike("email", email.trim())
        .maybeSingle();

      if (!foundUser) throw new Error("해당 이메일의 회원을 찾을 수 없습니다.");

      const { data: existing } = await supabase
        .from("library_room_members")
        .select("id")
        .eq("room_id", roomId)
        .eq("user_id", foundUser.id)
        .maybeSingle();

      if (existing) throw new Error("이미 초대된 회원입니다.");

      const {
        data: { user: inviter },
      } = await supabase.auth.getUser();

      const { error: insertError } = await supabase
        .from("library_room_members")
        .insert([
          {
            room_id: roomId,
            user_id: foundUser.id,
            invited_by: inviter?.id ?? null,
            role: "student",
          },
        ]);

      if (insertError) throw insertError;

      setMessage(`✅ ${foundUser.email} 님을 초대했습니다.`);
      setEmail("");
      onAdded();
    } catch (e: any) {
      setMessage(e.message || "초대 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="
          w-[90%] md:w-full max-w-md 
          rounded-2xl bg-white 
          p-5 md:p-6 
          shadow-2xl
        "
      >
        {/* 상단 헤더 */}
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h2 className="text-base md:text-lg font-bold text-gray-800">
            학생 초대
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl md:text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* 입력 + 버튼 */}
        <div className="space-y-2 md:space-y-3">
          <input
            type="email"
            placeholder="학생 이메일 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full rounded-lg border 
              px-3 py-2 text-xs md:text-sm
              focus:border-indigo-500 focus:ring focus:ring-indigo-200 
              transition
            "
          />

          <button
            onClick={handleInvite}
            disabled={loading || !email.trim()}
            className="
              w-full rounded-lg 
              bg-indigo-600 
              px-4 py-2 text-xs md:text-sm 
              text-white font-medium 
              hover:bg-indigo-700 
              disabled:opacity-50 
              transition
            "
          >
            {loading ? "초대 중..." : "초대하기"}
          </button>
        </div>

        {/* 메시지 */}
        {message && (
          <p
            className={`
              mt-3 md:mt-4 
              text-center text-xs md:text-sm
              ${
                message.startsWith("✅")
                  ? "text-green-600 font-medium"
                  : "text-red-600"
              }
            `}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}