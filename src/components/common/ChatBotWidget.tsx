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
      const res = await fetch("http://127.0.0.1:5000/chat/", {
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
      <div
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 cursor-pointer shadow-lg hover:scale-105 hover:bg-blue-500 transition"
      >
        💬
      </div>

      {/* 🪄 채팅창 */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-[500px] bg-[#F9FAFB] rounded-2xl shadow-2xl border flex flex-col">
          {/* 헤더 */}
          <div className="flex justify-between items-center bg-blue-600 text-white p-3 rounded-t-2xl">
            <h2 className="font-semibold">Sturoom AI 도우미</h2>
            <button
              onClick={() => setOpen(false)}
              className="font-bold hover:text-gray-200"
            >
              ✖
            </button>
          </div>

          {/* 메시지 리스트 */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-3 flex flex-col space-y-2 bg-[#EFF2F6]"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.sender === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold mr-2">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                    m.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none border"
                  }`}
                >
                  <p>{m.text}</p>
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
          <div className="flex border-t bg-white rounded-b-2xl">
            <input
              className="flex-1 px-3 py-2 text-sm outline-none rounded-bl-2xl"
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 rounded-br-2xl font-semibold hover:bg-blue-500 transition"
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
