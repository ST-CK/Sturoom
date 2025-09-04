"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (password !== password2) {
      setErr("비밀번호가 서로 다릅니다.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setErr(error.message);
      } else {
        setMsg("가입 메일을 보냈어요. 받은 편지함에서 확인해주세요!");
      }
    } finally {
      setLoading(false);
    }
  };

  const signUpWithKakao = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const signUpWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border bg-white p-8 shadow-sm"
        >
          <h1 className="text-center text-3xl font-bold tracking-tight">
            회원가입
          </h1>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password2"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호 확인
              </label>
              <input
                id="password2"
                type="password"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-70"
            >
              {loading ? "가입 중..." : "회원가입"}
            </button>

            <div className="flex items-center">
              <div className="flex-grow border-t border-gray-300" />
              <span className="mx-4 text-sm text-gray-500">또는</span>
              <div className="flex-grow border-t border-gray-300" />
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={signUpWithGoogle}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50"
              >
                Google로 계속하기
              </button>
              <button
                type="button"
                onClick={signUpWithKakao}
                className="w-full rounded-xl bg-[#FEE500] px-4 py-3 font-semibold hover:opacity-90"
              >
                카카오로 계속하기
              </button>
            </div>

            {msg && <p className="text-sm text-green-600">{msg}</p>}
            {err && <p className="text-sm text-red-600">{err}</p>}
            <p className="text-center text-sm text-gray-600">
              이미 계정이 있나요?{" "}
              <Link href="/login" className="text-indigo-600 hover:underline">
                로그인
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
