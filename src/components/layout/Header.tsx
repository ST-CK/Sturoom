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

  const displayName = useMemo(
    () => profile?.full_name || "사용자",
    [profile]
  );

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
    router.refresh();
  };

  // 드롭다운 바깥 클릭 닫기
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpenMenu(false);
    }
    if (openMenu) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openMenu]);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between py-3">
        {/* 왼쪽: 로고 + 텍스트 + 버전 + 사용 가이드 (기존 디자인 유지) */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            {/* 로고 네모: 연보라 + 민트 그라데이션 (디자인 그대로) */}
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-300 via-purple-400 to-teal-300" />
            <span className="text-lg font-semibold text-slate-800">Sturoom</span>

            {/* Beta / 버전 뱃지 (디자인 그대로) */}
            <span className="flex items-center gap-1 text-sm">
              <span className="rounded bg-blue-600 px-1.5 py-0.5 text-white text-xs font-semibold">
                Beta
              </span>
              <span className="text-gray-400">v1.1.2</span>
            </span>
          </Link>

          {/* 사용 가이드 버튼 (디자인 그대로) */}
          <Link
            href="/#guide"
            className="hidden md:inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            💡 사용 팁
          </Link>
        </div>

        {/* 오른쪽: 메뉴 (로그인 상태에 따라 변경) */}
        <nav className="hidden md:flex items-center gap-2">
          {/* 비로그인: 무료 체험 / 로그인 (기존 디자인) */}
          {!loading && !user && (
            <>
              <a
                href="/#cta"
                className="rounded-xl px-3 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-gray-700 via-slate-600 to-blue-500 shadow-sm hover:opacity-90"
              >
                무료 체험
              </a>
              <Link
                href="/login"
                className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                로그인
              </Link>
            </>
          )}

          {/* 로딩 중 스켈레톤 */}
          {loading && (
            <div className="ml-1 h-9 w-28 animate-pulse rounded-lg bg-slate-200" />
          )}

          {/* 로그인: 아바타/이름 + 드롭다운 (마이페이지/로그아웃) */}
          {!loading && user && (
            <div className="relative ml-1" ref={menuRef}>
              <button
                onClick={() => setOpenMenu((v) => !v)}
                aria-expanded={openMenu}
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

        {/* 모바일 햄버거 (디자인 최대한 유지) */}
        <button
          onClick={() => setOpenMobile((v) => !v)}
          className="md:hidden rounded-lg border p-2"
          aria-label="open menu"
          aria-expanded={openMobile}
        >
          {/* 기존 헤더는 텍스트 아이콘이었지만, 시각적으로 깔끔하게 바꿈 */}
          <span className="block h-0.5 w-5 bg-slate-700" />
          <span className="mt-1 block h-0.5 w-5 bg-slate-700" />
          <span className="mt-1 block h-0.5 w-5 bg-slate-700" />
        </button>
      </Container>

      {/* 모바일 드로어 */}
      {openMobile && (
        <div className="md:hidden border-t border-slate-200/70 bg-white/80 backdrop-blur-xl">
          <Container className="flex flex-col gap-2 py-3">
            {/* 비로그인: 무료 체험/로그인 */}
            {!loading && !user && (
              <>
                <a
                  href="/#cta"
                  className="rounded-xl bg-gradient-to-r from-gray-700 via-slate-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
                  onClick={() => setOpenMobile(false)}
                >
                  무료 체험
                </a>
                <Link
                  href="/login"
                  className="rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  onClick={() => setOpenMobile(false)}
                >
                  로그인
                </Link>
              </>
            )}

            {/* 로딩 중 스켈레톤 */}
            {loading && (
              <div className="h-9 w-full animate-pulse rounded-lg bg-slate-200" />
            )}

            {/* 로그인: 사용자 카드 + 링크 */}
            {!loading && user && (
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
                  className="rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  onClick={() => setOpenMobile(false)}
                >
                  마이페이지
                </Link>

                <button
                  onClick={() => {
                    handleSignOut();
                    setOpenMobile(false);
                  }}
                  className="rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-left text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  로그아웃
                </button>
              </>
            )}

            {/* 공통: 사용 팁 */}
            <Link
              href="/#guide"
              className="rounded-xl border border-gray-200 bg-white/80 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              onClick={() => setOpenMobile(false)}
            >
              💡 사용 팁
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}
