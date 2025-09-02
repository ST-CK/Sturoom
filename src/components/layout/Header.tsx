"use client";

import Link from "next/link";
import Container from "./Container";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <Container className="flex items-center justify-between py-3">
        {/* 왼쪽: 로고 + 텍스트 + 버전 + 사용 가이드 */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            {/* 로고 네모: 차콜 + 블루 그라데이션 */}
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-gray-700 via-slate-600 to-blue-500" />
            <span className="text-lg font-semibold text-slate-800">Sturoom</span>

            {/* Beta 버전: Beta만 강조 */}
            <span className="flex items-center gap-1 text-sm">
              <span className="rounded bg-blue-600 px-1.5 py-0.5 text-white text-xs font-semibold">
                Beta
              </span>
              <span className="text-gray-400">v1.0.0</span>
            </span>
          </Link>

          {/* 사용 가이드 */}
          <Link
            href="/#guide"
            className="hidden md:inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            💡 사용 팁
          </Link>
        </div>

        {/* 오른쪽: 메뉴 */}
        <div className="hidden md:flex items-center gap-2">
          <a
            href="/#cta"
            className="rounded-xl px-3 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-gray-700 via-slate-600 to-blue-500 shadow-sm hover:opacity-90"
          >
            무료 체험
          </a>
          <a
            href="/login"
            className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            로그인
          </a>
        </div>

        {/* 모바일 햄버거 */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden rounded-lg border p-2"
          aria-label="open menu"
        >
          ☰
        </button>
      </Container>
    </header>
  );
}
