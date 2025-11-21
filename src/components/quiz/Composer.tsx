"use client";

import { useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
};

export default function Composer({
  value,
  onChange,
  onSend,
  disabled,
  placeholder,
}: Props) {
  const [isComposing, setIsComposing] = useState(false); // ✅ 한글 조합 상태
  const sending = useRef(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isComposing) return; // 한글 조합 중이면 무시
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (sending.current) return;
      sending.current = true;
      onSend();
      setTimeout(() => (sending.current = false), 150);
    }
  };

  const handleSendClick = () => {
    if (sending.current) return;
    sending.current = true;
    onSend();
    setTimeout(() => (sending.current = false), 150);
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-[0_-2px_6px_rgba(0,0,0,0.05)] px-3 sm:px-4 py-2.5 sm:py-3">
      <div className="mx-auto max-w-full sm:max-w-3xl flex items-end gap-2 sm:gap-3">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={placeholder ?? "답변을 입력하세요…"}
          className="flex-1 resize-none rounded-xl border border-slate-200 px-2.5 sm:px-3 py-1.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/90 text-sm sm:text-base text-slate-800"
        />
        <button
          type="button"
          onClick={handleSendClick}
          disabled={disabled || !value.trim()}
          className={`rounded-xl px-3 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base font-semibold text-white whitespace-nowrap transition ${
            disabled || !value.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          전송
        </button>
      </div>
    </div>
  );
}