"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Container from "./Container";
import { supabase } from "@/lib/supabaseClient";
import useAuth from "@/hooks/useAuth";
import SideBar from "@/components/sidebar/SideBar";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();

  const [openMenu, setOpenMenu] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const displayName = useMemo(() => profile?.full_name || "사용자", [profile]);
  const initials = useMemo(() => {
    const parts = (profile?.full_name ?? "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "ST";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }, [profile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setOpenMenu(false);
    router.refresh();
  };

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpenMenu(false);
    }
    if (openMenu) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openMenu]);

  useEffect(() => {
    setOpenSidebar(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      {/* h-16로 고정, padding으로 높이 늘어나지 않게 py-0 */}
      <Container className="flex h-16 items-center justify-between py-0">
        {/* 왼쪽 묶음: 버튼 + 로고/베타/버전 + 사용팁 */}
        <div className="flex items-center gap-3">
          {/* ☰ 버튼: 레이아웃 안에 배치 + 살짝 왼쪽으로 당겨서 화면 가장자리 느낌 */}
          <button
            onClick={() => setOpenSidebar(true)}
            aria-label="사이드바 열기"
            className="ml-[-6px] inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white/70 px-2.5 py-1.5 text-xl leading-none text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <span aria-hidden className="-translate-y-[1px] inline-block scale-x-[1.35] leading-none">
              {"\u2630"}
            </span>
          </button>

          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-300 via-purple-400 to-teal-300" />
            <span className="text-lg font-semibold text-slate-800">Sturoom</span>
            <span className="flex items-center gap-1 text-sm">
              <span className="rounded bg-blue-600 px-1.5 py-0.5 text-white text-xs font-semibold">Beta</span>
              <span className="text-gray-400">v1.1.2</span>
            </span>
          </Link>

          <Link
            href="/#guide"
            className="hidden md:inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            💡 사용 팁
          </Link>
        </div>

        {/* 오른쪽: 상태별 메뉴 */}
        <nav className="hidden md:flex items-center gap-2">
          {!loading && !user && (
            <>
              <Link
                href="/#cta"
                className="rounded-xl px-3 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-gray-700 via-slate-600 to-blue-500 shadow-sm hover:opacity-90"
              >
                무료 체험
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                로그인
              </Link>
            </>
          )}

          {loading && <div className="ml-1 h-9 w-28 animate-pulse rounded-lg bg-slate-200" />}

          {!loading && user && (
            <div className="relative ml-1" ref={menuRef}>
              <button
                onClick={() => setOpenMenu((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-2.5 py-1.5 shadow-sm transition hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-xs font-bold text-white shadow">
                  {initials}
                </div>
                <span className="max-w-[140px] truncate text-sm font-medium text-slate-800">
                  {displayName}
                </span>
                <svg
                  className={`h-4 w-4 text-slate-500 transition ${openMenu ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-lg backdrop-blur">
                  <Link
                    href="/mypage"
                    onClick={() => setOpenMenu(false)}
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    마이페이지
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </Container>

      {/* 사이드바 */}
      <SideBar
        open={openSidebar}
        onClose={() => setOpenSidebar(false)}
        side="left"
        userLoggedIn={!!user}
        loading={loading}
        displayName={displayName}
        initials={initials}
        onSignOut={handleSignOut}
      />
    </header>
  );
}
