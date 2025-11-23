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
    const parts = (profile?.full_name ?? "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) return "ST";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }, [profile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setOpenMenu(false);
    router.refresh();
  };

  // 바깥 클릭 → 드롭다운 닫기
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    }
    if (openMenu) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openMenu]);

  // 라우트 변경 → 사이드바 닫기
  useEffect(() => {
    setOpenSidebar(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <Container className="flex h-14 items-center justify-between py-0">
        
        {/* ========= LEFT ========= */}
        <div className="flex items-center gap-2">
          {/* 햄버거 버튼 */}
          <button
            onClick={() => setOpenSidebar(true)}
            aria-label="사이드바 열기"
            className="ml-[-4px] inline-flex shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white/70 px-2 py-1 text-lg leading-none text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <span className="inline-block scale-x-125 -translate-y-[1px]">
              {"\u2630"}
            </span>
          </button>

          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-purple-300 via-purple-400 to-teal-300" />
            <span className="text-base font-semibold text-slate-800">
              Sturoom
            </span>
          </Link>

          {/* 사용 팁 버튼 (작게 조정) */}
          <Link
            href="/guide"
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100 sm:text-xs"
          >
            💡 사용 팁
          </Link>
        </div>

        {/* ========= RIGHT ========= */}
        <nav className="flex items-center gap-2">
          {/* 비로그인 상태 */}
          {!loading && !user && (
            <>
              <Link
                href="/#cta"
                className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-white bg-gradient-to-r from-gray-700 via-slate-600 to-blue-500 shadow-sm hover:opacity-90"
              >
                무료 체험
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
              >
                로그인
              </Link>
            </>
          )}

          {/* 로딩 스켈레톤 */}
          {loading && (
            <div className="ml-1 h-7 w-20 animate-pulse rounded-md bg-slate-200" />
          )}

          {/* 로그인 상태 */}
          {!loading && user && (
            <div className="relative ml-1" ref={menuRef}>
              <button
                onClick={() => setOpenMenu((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white/70 px-2.5 py-1 text-xs shadow-sm transition hover:bg-gray-50"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-[10px] font-bold text-white shadow">
                  {initials}
                </div>
                <span className="max-w-[90px] truncate text-[11px] font-medium text-slate-800">
                  {displayName}
                </span>

                <svg
                  className={`h-3.5 w-3.5 text-slate-500 transition ${
                    openMenu ? "rotate-180" : ""
                  }`}
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
                <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white/95 text-[12px] shadow-lg backdrop-blur">
                  <Link
                    href="/mypage"
                    onClick={() => setOpenMenu(false)}
                    className="block px-4 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    마이페이지
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </Container>

      {/* ========= SIDEBAR ========= */}
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