"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import SchoolSelect from "@/components/common/SchoolSelect";

export default function OnboardingPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"parent" | "student" | "teacher">("student");
  const [school, setSchool] = useState<{ name: string; kind?: string }>({ name: "" });
  const [grade, setGrade] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return (window.location.href = "/login");
      setEmail(user.email ?? "");
      const meta: any = (user as any).user_metadata || {};
      setFullName(meta.full_name || meta.name || "");
      setPhone(meta.phone || "");
    })();
  }, []);

  const gradeHint =
    school.kind?.includes("초")
      ? "1~6"
      : school.kind?.includes("중")
      ? "1~3"
      : school.kind?.includes("고")
      ? "1~3"
      : school.kind?.includes("대")
      ? "1~4"
      : "예: 1";

  const handleSave = async () => {
    setErr(null);
    if (!school.name) return setErr("학교를 선택해주세요.");
    if (!fullName.trim()) return setErr("이름을 입력해주세요.");
    if (!phone.trim()) return setErr("전화번호를 입력해주세요.");

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

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
    } catch (e: any) {
      setErr(e.message ?? "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-xl font-bold sm:text-2xl">
          추가 정보 입력
        </h1>

        <div className="mt-6 space-y-5">
          {/* 역할 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              역할
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: "parent", t: "학부모" },
                { v: "student", t: "학생" },
                { v: "teacher", t: "교사·교수" },
              ].map((o) => (
                <label
                  key={o.v}
                  className={`flex cursor-pointer items-center justify-center rounded-xl border px-2 py-2 text-xs sm:px-3 sm:text-sm
                  ${
                    role === o.v
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    className="hidden"
                    name="role"
                    value={o.v}
                    checked={role === (o.v as any)}
                    onChange={() => setRole(o.v as any)}
                  />
                  {o.t}
                </label>
              ))}
            </div>
          </div>

          {/* 학교 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              학교 이름
            </label>
            <SchoolSelect
              value={school.name}
              onChange={(v) => setSchool(v)}
            />
          </div>

          {/* 학년 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              학년
            </label>
            <input
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder={gradeHint}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:px-4 sm:py-3"
            />
            <p className="text-xs text-gray-500">
              교사/학부모는 비워도 됩니다.
            </p>
          </div>

          {/* 이름/이메일/전화 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              이름
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:px-4 sm:py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              disabled
              value={email}
              className="w-full rounded-xl border bg-gray-100 px-3 py-2 text-sm text-gray-500 sm:px-4 sm:py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              전화번호
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01012345678"
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:px-4 sm:py-3"
            />
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-70"
          >
            {saving ? "저장 중..." : "저장하고 계속하기"}
          </button>
        </div>
      </div>
    </div>
  );
}