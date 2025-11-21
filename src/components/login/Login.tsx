"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: userId,
        password,
      });
      if (error) setErr(error.message);
      else router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const signInWithKakao = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 md:px-0">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border bg-white p-6 md:p-8 shadow-sm"
      >
        <h1 className="text-center text-2xl md:text-3xl font-bold tracking-tight">
          LOGIN
        </h1>

        <div className="mt-6 space-y-6 text-sm md:text-base">
          {/* 이메일 */}
          <div className="space-y-1.5 md:space-y-2">
            <label
              htmlFor="userId"
              className="block text-xs md:text-sm font-medium text-gray-700"
            >
              아이디(이메일)
            </label>
            <input
              id="userId"
              type="email"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 md:px-4 md:py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* 비밀번호 */}
          <div className="space-y-1.5 md:space-y-2">
            <label
              htmlFor="password"
              className="block text-xs md:text-sm font-medium text-gray-700"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 md:px-4 md:py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* 링크 */}
          <div className="flex items-center justify-between text-xs md:text-sm text-gray-600">
            <span />
            <div className="flex items-center gap-2">
              <Link
                href="/reset-password"
                className="text-indigo-600 hover:underline"
              >
                비밀번호 재설정
              </Link>
            </div>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 md:py-3 font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-70"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>

          {/* OR */}
          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-300" />
            <span className="mx-4 text-xs md:text-sm text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300" />
          </div>

          {/* 소셜 */}
          <div className="space-y-2.5 md:space-y-3">
            <button
              type="button"
              onClick={signInWithGoogle}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 md:py-3 font-semibold text-gray-900 hover:bg-gray-50 text-sm md:text-base"
            >
              Google로 로그인
            </button>
            <button
              type="button"
              onClick={signInWithKakao}
              className="w-full rounded-xl bg-[#FEE500] px-4 py-2.5 md:py-3 font-semibold hover:opacity-90 text-sm md:text-base"
            >
              카카오로 로그인
            </button>
          </div>

          <div className="mx-auto mt-6 md:mt-8 text-center text-xs md:text-sm text-gray-600">
            아직 회원이 아니신가요?
            <div className="mt-2 md:mt-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                회원가입
              </Link>
            </div>
          </div>

          {err && <p className="text-xs md:text-sm text-red-600">{err}</p>}
        </div>
      </form>
    </div>
  );
}