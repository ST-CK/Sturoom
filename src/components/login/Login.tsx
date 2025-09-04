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
      if (error) {
        setErr(error.message);
      } else {
        // 로그인후 경로 지정
        router.replace("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithKakao = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};

const signInWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};


  return (
    <div className="mx-auto w-full max-w-md">
      <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-center text-3xl font-bold tracking-tight">LOGIN</h1>

        <div className="mt-6 space-y-6">
          {/* 아이디 */}
          <div className="space-y-2">
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
              아이디(이메일)
            </label>
            <input
              id="userId"
              type="email"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              required
            />
          </div>

          {/* 비밀번호 */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              required
            />
          </div>

          {/* 옵션/링크 */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              아이디 저장
            </label>

            <div className="flex items-center gap-2">
              <Link href="/find-id" className="text-indigo-600 hover:underline">아이디 찾기</Link>
              <span className="text-gray-300">/</span>
              <Link href="/reset-password" className="text-indigo-600 hover:underline">비밀번호 재설정</Link>
            </div>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-70"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>

          {/* OR */}
          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-300" />
            <span className="mx-4 text-sm text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300" />
          </div>

          {/* 소셜 로그인 */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={signInWithGoogle}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-900 hover:bg-gray-50"
            >
              Google로 로그인
            </button>
            <button
              type="button"
              onClick={signInWithKakao}
              className="w-full rounded-xl bg-[#FEE500] px-4 py-3 font-semibold hover:opacity-90"
            >
              카카오로 로그인
            </button>
          </div>

          <div className="mx-auto mt-8 text-center text-gray-600">
            아직 회원이 아니신가요?
            <div className="mt-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                회원가입
              </Link>
            </div>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}
        </div>
      </form>
    </div>
  );
}
