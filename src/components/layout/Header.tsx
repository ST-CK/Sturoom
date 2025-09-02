"use client";

import Link from "next/link";
import Container from "./Container";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <Container className="flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-sky-400" />
          <span className="text-lg font-semibold">Sturoom</span>
        </Link>

        {/* 데스크톱 */}
        <nav className="hidden gap-6 text-sm md:flex">
          <a className="hover:text-indigo-600" href="/#features">기능</a>
          <a className="hover:text-indigo-600" href="/#courses">코스</a>
          <a className="hover:text-indigo-600" href="/#cta">시작</a>
        </nav>

        <div className="hidden md:block">
          <a
            href="/#cta"
            className="rounded-xl border border-indigo-200 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
          >
            무료 체험
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

      {/* 모바일 드롭다운 */}
      {open && (
        <div className="border-t bg-white md:hidden">
          <Container className="flex flex-col gap-2 py-3">
            <a href="/#features" onClick={() => setOpen(false)}>기능</a>
            <a href="/#courses" onClick={() => setOpen(false)}>코스</a>
            <a href="/#cta" onClick={() => setOpen(false)}>시작</a>
            <a
              href="/#cta"
              className="mt-2 rounded-xl border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-700"
              onClick={() => setOpen(false)}
            >
              무료 체험
            </a>
          </Container>
        </div>
      )}
    </header>
  );
}
