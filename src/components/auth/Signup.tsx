"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import SchoolSelect from "@/components/common/SchoolSelect";

type Role = "parent" | "student" | "teacher";

export default function Signup() {
  const [role, setRole] = useState<Role>("student");
  const [school, setSchool] = useState<{ name: string; kind?: string }>({ name: "" });
  const [grade, setGrade] = useState(""); // 학년(문자)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const gradeHint =
    school.kind?.includes("초") ? "1~6" :
    school.kind?.includes("중") ? "1~3" :
    school.kind?.includes("고") ? "1~3" :
    school.kind?.includes("대") ? "1~4" : "예: 1";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!school.name) return setErr("학교를 선택해주세요.");
    if (!fullName.trim()) return setErr("이름을 입력해주세요.");
    if (!email.trim()) return setErr("이메일을 입력해주세요.");
    if (!phone.trim()) return setErr("전화번호를 입력해주세요.");
    if (password !== password2) return setErr("비밀번호가 서로 다릅니다.");
    if (password.length < 6) return setErr("비밀번호는 6자 이상이어야 합니다.");

    setLoading(true);
    try {
      // 이메일 회원가입
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { role, school_name: school.name, grade, full_name: fullName, phone },
        },
      });
      if (error) throw error;

      // 세션 즉시 생성 시 프로필 upsert (메일확인 필요 설정이면 콜백/온보딩에서 처리)
      const user = data.user;
      if (user) {
        await supabase.from("profiles").upsert({
          id: user.id,
          role,
          school_name: school.name,
          grade,
          full_name: fullName,
          email,
          phone,
        });
        window.location.replace("/");
      } else {
        setMsg("가입 메일을 보냈어요. 받은 편지함에서 확인해주세요!");
      }
    } catch (e: any) {
      setErr(e.message ?? "가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 소셜 회원가입(=로그인) → 콜백에서 profiles 검사 후 미완성 시 /onboarding 이동
  const signUpWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };
  const signUpWithKakao = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-center text-3xl font-bold tracking-tight">회원가입</h1>

        <div className="mt-6 space-y-6">
          {/* 0) 역할 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">역할</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: "parent", t: "학부모" },
                { v: "student", t: "학생" },
                { v: "teacher", t: "교사·교수" },
              ].map((o) => (
                <label
                  key={o.v}
                  className={`flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2 text-sm
                  ${role === o.v ? "border-indigo-500 bg-indigo-50" : "border-gray-300 bg-white"}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={o.v}
                    checked={role === (o.v as Role)}
                    onChange={() => setRole(o.v as Role)}
                    className="hidden"
                  />
                  {o.t}
                </label>
              ))}
            </div>
          </div>

          {/* 1) 학교 이름 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">학교 이름</label>
            <SchoolSelect value={school.name} onChange={(v) => setSchool(v)} />
          </div>

          {/* 2) 학년 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">학년</label>
            <input
              type="text"
              placeholder={gradeHint}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            <p className="text-xs text-gray-500">교사·교수/학부모는 비워도 됩니다.</p>
          </div>

          {/* 3) 이름 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">이름</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              required
            />
          </div>

          {/* 4) 이메일 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              required
            />
          </div>

          {/* 5) 전화번호 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">전화번호</label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="01012345678"
              pattern="[0-9]{10,11}"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              required
            />
          </div>

          {/* 6~7) 비밀번호 / 확인 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              required
              minLength={6}
            />
          </div>

          {/* 가입 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-70"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>

          {/* OR (로그인과 동일 UI) */}
          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-300" />
            <span className="mx-4 text-sm text-gray-500">또는</span>
            <div className="flex-grow border-t border-gray-300" />
          </div>

          {/* 소셜로 계속하기 (구글/카카오 복구) */}
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

          {/* 메시지 */}
          {msg && <p className="text-sm text-green-600">{msg}</p>}
          {err && <p className="text-sm text-red-600">{err}</p>}

          <p className="text-center text-sm text-gray-600">
            이미 계정이 있나요?{" "}
            <Link href="/login" className="text-indigo-600 hover:underline">로그인</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
