"use client";

import React, { useState, useRef, useEffect } from "react";

interface Message {
  sender: "user" | "bot";
  text: string;
  time: string;
}

const ChatBotWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isComposing, setIsComposing] = useState(false); // 🧩 한글 조합 상태 감지
  const chatRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const now = new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg: Message = { sender: "user", text: input, time: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });


      if (!res.ok) throw new Error("서버 응답 오류");

      const data = await res.json();
      const botMsg: Message = {
        sender: "bot",
        text: data.reply || "응답을 불러오지 못했어요 😢",
        time: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const errMsg: Message = {
        sender: "bot",
        text: "서버 연결에 실패했어요 😥",
        time: now,
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  };

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  return (
    <>
      {/* 💬 플로팅 아이콘 */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform"
      >
        💬
      </button>

      {/* 💎 채팅창 */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-[520px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col overflow-hidden transition-all">
          {/* 헤더 */}
          <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3">
            <h2 className="font-semibold text-sm">Sturoom AI 도우미</h2>
            <button
              onClick={() => setOpen(false)}
              className="font-bold hover:text-gray-200 transition"
            >
              ✕
            </button>
          </div>

          {/* 메시지 영역 */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex items-end ${
                  m.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.sender === "bot" && (
                  <div className="w-7 h-7 mr-2 rounded-full bg-blue-500 text-white text-xs font-semibold flex items-center justify-center shadow-md">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                    m.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none shadow-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span
                    className={`text-[10px] mt-1 block text-right ${
                      m.sender === "user" ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 입력창 */}
          <div className="flex border-t border-gray-200 bg-gray-50 p-2 items-center">
            <input
              className="flex-1 px-3 py-2 text-sm rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onCompositionStart={() => setIsComposing(true)} // 🧩 한글 조합 시작
              onCompositionEnd={() => setIsComposing(false)}   // 🧩 한글 조합 끝
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isComposing) sendMessage(); // ✅ 중복 방지
              }}
            />
            <button
              onClick={sendMessage}
              className="ml-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-full hover:opacity-90 active:scale-95 transition"
            >
              전송
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBotWidget;
