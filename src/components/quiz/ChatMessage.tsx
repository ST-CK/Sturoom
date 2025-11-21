"use client";

type Props = {
  role: "ai" | "user";
  children: React.ReactNode;
};

export default function ChatMessage({ role, children }: Props) {
  const isAI = role === "ai";

  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[85%] md:max-w-[720px] 
          w-fit rounded-2xl 
          px-3 py-2 md:px-4 md:py-3 
          text-[14px] md:text-[15px] leading-relaxed 
          shadow-sm animate-[fadeIn_0.25s_ease]
          ${
            isAI
              ? "bg-white/80 text-slate-800 border border-slate-200/50 backdrop-blur-md rounded-bl-none"
              : "bg-indigo-600 text-white rounded-br-none"
          }`}
        style={{ wordBreak: "break-word" }}
      >
        {children}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(3px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}