"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Message = { id: string; content: string; inserted_at: string };

export default function SupabaseTestPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // 목록 불러오기
  async function load() {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("inserted_at", { ascending: false });
    if (error) {
      setInitError(error.message);
    } else {
      setInitError(null);
      setMessages((data ?? []) as Message[]);
    }
  }

  // 최초 & 실시간 구독
  useEffect(() => {
    load();

    // 실시간: insert 되면 자동으로 목록 위에 반영
    const channel = supabase
      .channel("messages-insert")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as Message;
          setMessages((prev) => [row, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 추가
  async function add() {
    const text = content.trim();
    if (!text) return;
    if (text.length > 200) {
      alert("200자 이내로 입력해주세요.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("messages").insert({ content: text });
    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      setContent("");
      // 실시간 구독으로 자동 반영되지만, 초기엔 새로고침 보강
      // await load();
    }
  }

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-gray-50 px-4 py-6 sm:p-6 space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold">
        Supabase 연결 테스트 (클라이언트 전용)
      </h1>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="메시지 입력 (200자 이내)"
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <button
          onClick={add}
          disabled={loading}
          className="rounded px-4 py-2 bg-black text-white disabled:opacity-50 w-full sm:w-auto"
        >
          {loading ? "추가중..." : "추가"}
        </button>
      </div>

      {initError && (
        <div className="text-red-600 text-sm">
          초기 로드 에러: {initError}
        </div>
      )}

      <ul className="space-y-2">
        {messages.length === 0 && (
          <li className="opacity-60 text-sm">메시지가 없어요.</li>
        )}
        {messages.map((m) => (
          <li key={m.id} className="border rounded p-3 bg-white">
            <div className="text-xs opacity-60">
              {new Date(m.inserted_at).toLocaleString()}
            </div>
            <div className="text-sm mt-1 break-words">{m.content}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}