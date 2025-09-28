"use client";

import Link from "next/link";
import { useEffect } from "react";
import { X, Home, HelpCircle, CalendarCheck2, MessageSquareText, Brain, Activity, BookOpen, } from "lucide-react";

type SideBarProps = {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  userLoggedIn?: boolean;
  loading?: boolean;
  displayName?: string | null;
  initials?: string | null;
  onSignOut?: () => void;
};

export default function SideBar({
  open,
  onClose,
  side = "left",
  userLoggedIn = false,
  loading = false,
  displayName = "사용자",
  initials = "ST",
  onSignOut,
}: SideBarProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const panelBase = "fixed top-0 z-[61] h-dvh w-72 max-w-[80vw] bg-white shadow-xl transition-transform duration-300";
  const sideClass =
    side === "left"
      ? `${open ? "translate-x-0" : "-translate-x-full"} left-0 border-r border-slate-200`
      : `${open ? "translate-x-0" : "translate-x-full"} right-0 border-l border-slate-200`;

  return (
    <>
      {/* 오버레이 */}
      <div
        aria-hidden
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* 패널 */}
      <aside role="dialog" aria-modal="true" aria-label="사이드바" className={`${panelBase} ${sideClass}`}>
        {/* 헤더와 동일 높이(h-16) */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-300 via-purple-400 to-teal-300" />
            <span className="text-lg font-semibold text-slate-800">Sturoom</span>
          </div>
          <button
            aria-label="사이드바 닫기"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 로그인 상태 (옵션) */}
        {loading ? (
          <div className="m-3 h-10 animate-pulse rounded-lg bg-slate-200" />
        ) : userLoggedIn ? (
          <div className="m-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 p-3 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-xs font-bold text-white shadow">
              {(initials ?? "ST").slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="max-w-[60vw] truncate text-sm font-semibold text-slate-800">
                {displayName ?? "사용자"}
              </div>
              <div className="text-xs text-slate-500">환영합니다 👋</div>
            </div>
          </div>
        ) : null}

        {/* 메뉴: 왼쪽 거의 붙게 */}
        <nav className="flex flex-col gap-1 pl-1 pr-3 py-2">
          <Link href="/" onClick={onClose} className="flex items-center gap-2 rounded-lg pl-2 pr-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Home className="h-4 w-4" />
            홈
          </Link>
          <Link href="/#guide" onClick={onClose} className="flex items-center gap-2 rounded-lg pl-2 pr-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <HelpCircle className="h-4 w-4" />
            사용팁
          </Link>
          <Link href="/attendance" onClick={onClose} className="flex items-center gap-2 rounded-lg pl-2 pr-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <CalendarCheck2 className="h-4 w-4" />
            출석부
          </Link>
          <Link
            href="/library"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg pl-2 pr-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <BookOpen className="h-4 w-4" />
            강의자료실
          </Link>
          <Link href="/board" onClick={onClose} className="flex items-center gap-2 rounded-lg pl-2 pr-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <MessageSquareText className="h-4 w-4" />
            게시판
          </Link>
          <Link href="/ai/learn" onClick={onClose} className="flex items-center gap-2 rounded-lg pl-2 pr-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Brain className="h-4 w-4" />
            학습AI
          </Link>
          <Link href="/ai/focus" onClick={onClose} className="flex items-center gap-2 rounded-lg pl-2 pr-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Activity className="h-4 w-4" />
            집중도AI
          </Link>
        </nav>

        {userLoggedIn && onSignOut && (
          <div className="p-3">
            <button
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              로그아웃
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
