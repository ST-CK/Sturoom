"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Container from "./Container";
import { supabase } from "@/lib/supabaseClient";
import useAuth from "@/hooks/useAuth";

export default function Header() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [openMobile, setOpenMobile] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
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
    setOpenMobile(false);
    router.refresh(); // 헤더 즉시 갱신
  };

  // 메뉴 바깥 클릭 시 닫기
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpenMenu(false);
    }
    if (openMenu) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openMenu]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50">
      <Container className="flex h-16 items-center justify-between">
        {/* 왼쪽: 로고 + 버전 */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-300 via-fuchsia-300 to-teal-300 shadow-inner transition-transform duration-200 group-hover:scale-105" />
          <div className="flex items-end gap-2">
            <span className="text-xl font-extrabold tracking-tight text-slate-800">Sturoom</span>
            <span className="flex items-center gap-1 text-[10px]">
              <span className="rounded-md bg-blue-600/90 px-1.5 py-0.5 font-semibold text-white shadow-sm">
                Beta
              </span>
              <span className="text-slate-400">v1.1.2</span>
            </span>
          </div>
        </Link>

        {/* 데스크톱 네비 */}
        <nav className="hidden items-center gap-2 md:flex">
          {/* 로그인 안 했을 때만 노출: 무료 체험 */}
          {!loading && !user && (
            <a
              href="/#cta"
              className="rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              무료 체험
            </a>
          )}


          {/* 우측 사용자 영역 */}
          {loading ? (
            <div className="ml-1 h-9 w-28 animate-pulse rounded-lg bg-slate-200" />
          ) : user ? (
            <div className="relative ml-1" ref={menuRef}>
              <button
                onClick={() => setOpenMenu((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-2.5 py-1.5 shadow-sm transition hover:bg-slate-50"
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

              {/* 드롭다운 */}
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
          ) : (
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              로그인
            </Link>
          )}
        </nav>

        {/* 모바일: 햄버거 */}
        <button
          onClick={() => setOpenMobile((v) => !v)}
          className="md:hidden rounded-xl border border-slate-200 bg-white/70 p-2 shadow-sm"
          aria-label="open menu"
        >
          <span className="block h-0.5 w-5 bg-slate-700" />
          <span className="mt-1 block h-0.5 w-5 bg-slate-700" />
          <span className="mt-1 block h-0.5 w-5 bg-slate-700" />
        </button>
      </Container>

      {/* 모바일 드로어 */}
      {openMobile && (
        <div className="md:hidden border-t border-slate-200/70 bg-white/80 backdrop-blur-xl">
          <Container className="flex flex-col gap-2 py-3">
            {!loading && !user && (
              <a
                href="/#cta"
                className="rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                onClick={() => setOpenMobile(false)}
              >
                무료 체험
              </a>
            )}

            <Link
              href="/#guide"
              className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              onClick={() => setOpenMobile(false)}
            >
              💡 사용 팁
            </Link>

            {loading ? (
              <div className="h-9 w-full animate-pulse rounded-lg bg-slate-200" />
            ) : user ? (
              <>
                <div className="mt-1 flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 p-3 shadow-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-xs font-bold text-white shadow">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="max-w-[70vw] truncate text-sm font-semibold text-slate-800">
                      {displayName}
                    </div>
                    <div className="text-xs text-slate-500">환영합니다 👋</div>
                  </div>
                </div>

                <Link
                  href="/mypage"
                  className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                  onClick={() => setOpenMobile(false)}
                >
                  마이페이지
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setOpenMobile(false);
                  }}
                  className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                onClick={() => setOpenMobile(false)}
              >
                로그인
              </Link>
            )}
          </Container>
        </div>
      )}
    </header>
  );
}
